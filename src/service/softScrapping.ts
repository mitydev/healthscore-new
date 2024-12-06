import axios from "axios";
import cheerio from "cheerio";
import unidecode from "unidecode";
import { getXmlUrls } from "./getXmlUrls";
import { isUrlAccessible } from "./IsUrlAccessible";
import extractPostData from "../utils/extractPostData.utils";
import { formatReturn } from "../utils/formatReturn";
import { detectPlatform } from "./detectPlataform";
import { validateCategories } from "./validateCategories";

export type Policy = {
  desc: string[];
  valid: boolean;
};

export type File = {
  desc: string | null;
  valid: boolean;
};

export type PostData = {
  title: string | null;
  summary: string | null;
  categories: string | null;
  date: string | null;
  link: string | null;
};

export type CategoryMessage = {
  message: string;
  categories?: string[];
};

export type PostMessage = {
  message: string;
  reasons?: any[];
};

async function softScrapping(
  sitemap: string,
  policies: Record<string, Policy>,
  files: File[]
): Promise<[number, any, CategoryMessage, PostMessage]> {
  const policiesCopy = JSON.parse(JSON.stringify(policies));
  const filesCopy = JSON.parse(JSON.stringify(files));
  const sitemapUrls = await getXmlUrls(sitemap);
  const { protocol, hostname } = new URL(sitemap);
  const domain = `${protocol}//${hostname}`;
  const categoryErrors = await validateCategories(
    domain,
    await detectPlatform(domain)
  );

  const posts: cheerio.Element[] = [];
  let score = 0;

  for (const url of sitemapUrls) {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname?.trim().toLowerCase() ?? "";

    if (path) {
      let found = false;
      const validatedPolicies = new Set();

      for (const policyKey in policiesCopy) {
        if (found) break;
        const policy = policiesCopy[policyKey];

        for (const desc of policy.desc) {
          const slug = unidecode(desc).toLowerCase().replace(/\s+/g, "-");
          const pathParts = path.split("/").filter(Boolean);

          if (
            pathParts.includes(slug) &&
            (await isUrlAccessible(url)) &&
            policy.valid === false
          ) {
            console.log("entrou no if; path: ", path);
            policiesCopy[policyKey].valid = true;
            validatedPolicies.add(policyKey);
            found = true;
            score += 10;
            console.log(`Adicionado do ${desc}: ${score}`);
            break;
          }
        }
      }
    }
  }

  let postsMessage: PostMessage;
  if (posts.length > 0) {
    const postsData = posts
      .map((post) => extractPostData(cheerio.load(post)))
      .filter((data): data is PostData => data !== null);

    const errorsContent: any[] = [];

    for (let i = 0; i < postsData.length; i++) {
      for (let j = 0; j < postsData.length; j++) {
        if (i === j || postsData[i].categories === postsData[j].categories) {
          continue;
        }
        if (
          postsData[i].title === postsData[j].title ||
          postsData[i].summary === postsData[j].summary
        ) {
          errorsContent.push({
            reason: "Conteúdo semelhante",
            post1: postsData[i].link,
            post2: postsData[j].link,
          });
        }
        if (postsData[i].date && postsData[i].date === postsData[j].title) {
          errorsContent.push({
            reason: "Datas de postagem iguais",
            post1: postsData[i].link,
            post2: postsData[j].link,
          });
        }
      }

      const urlPost = postsData[i].link;
      const responseAuthor = await axios.get(urlPost!);

      if (responseAuthor.status === 200) {
        const authorSoup = cheerio.load(responseAuthor.data);
        const alternativeClasses = ["author-box", "nv-author-biography"];
        let authorFound = false;

        for (const className of alternativeClasses) {
          const authorBox = authorSoup(`.${className}`);
          if (authorBox.text().trim()) {
            authorFound = true;
            break;
          }
        }
        if (!authorFound) {
          errorsContent.push({
            reason: "Post sem redator!",
            post1: urlPost,
          });
        }
      }
    }

    if (posts.length >= 5) {
      score += 10;
    } else {
      errorsContent.push({
        qtd: posts.length,
        reason: "Mínimo de posts não cumprido (5)",
      });
    }
    if (errorsContent.length > 0) {
      postsMessage = {
        message:
          "Algumas políticas do Google não estão sendo seguidas nos seguintes posts",
        reasons: errorsContent,
      };
    } else {
      postsMessage = {
        message: "Nenhum problema encontrado nos posts",
      };
    }
    if (errorsContent.length === 0) {
      score += 10;
    }
  } else {
    //TODO: verificar pq está entrando nesse else toda hora
    postsMessage = {
      message:
        "Posts não encontrados (inexistentes ou fora dos padrões reconhecidos)!",
    };
  }

  let categoriesMessage: CategoryMessage;
  if (categoryErrors.length > 0) {
    categoriesMessage = {
      message: "Categorias com menos de 5 posts",
      categories: categoryErrors,
    };
  } else {
    score += 10;
    console.log(`Adicionado do categories: ${score}`);
    categoriesMessage = {
      message: "Nenhum problema encontrado nas categorias",
    };
  }

  if (await isUrlAccessible(`${domain}/ads.txt`)) {
    filesCopy[0].valid = true;
    score += 10;
    console.log(`Adicionado do ads.txt: ${score}`);
  }
  filesCopy[1].valid = true;
  score += 10;
  console.log(`Adicionado do sitemap.xml: ${score}`);

  const policiesReturn = await formatReturn(policiesCopy, filesCopy);
  return [score, policiesReturn, categoriesMessage, postsMessage];
}

export default softScrapping;
