import unidecode from "unidecode";
import { getXmlUrls } from "../utils/getXmlUrls";
import { isUrlAccessible } from "../utils/IsUrlAccessible";
import { formatReturn } from "../../utils/formatReturn.utils";
import { detectPlatform } from "../utils/detectPlataform";
import { verifyDateInHome } from "../../utils/verifyDateInHome.utils";
import axios from "axios";
import { validateCategories } from "../posts/validateCategories";
import { PostMessage, validatePosts } from "../posts/validatePosts";

export type Policy = {
  desc: string[];
  valid: boolean;
};

export type File = {
  desc: string | null;
  valid: boolean;
};

export type CategoryMessage = {
  message: string;
  categories?: string[];
};

async function softScrapping(
  sitemap: string,
  policies: Record<string, Policy>,
  files: File[]
): Promise<[number, any, CategoryMessage, PostMessage]> {
  const sitemapUrls = await getXmlUrls(sitemap);
  const { protocol, hostname } = new URL(sitemap);
  const domain = `${protocol}//${hostname}`;
  const homepage = await axios.get(domain);
  const domainPlatform = await detectPlatform(domain);
  const categories = await validateCategories(domain, domainPlatform);
  let score = 0;

  const validatedPolicies = new Set();
  const paths = sitemapUrls.map((url) => {
    const parsedUrl = new URL(url);
    return {
      url,
      pathParts:
        parsedUrl.pathname?.trim().toLowerCase().split("/").filter(Boolean) ??
        [],
    };
  });

  for (const { url, pathParts } of paths) {
    for (const [policyKey, policy] of Object.entries(policies)) {
      if (policy.valid) continue;

      const hasMatch = policy.desc.some((desc) => {
        const slug = unidecode(desc).toLowerCase().replace(/\s+/g, "-");
        return pathParts.includes(slug);
      });

      if (hasMatch && (await isUrlAccessible(url))) {
        policies[policyKey].valid = true;
        validatedPolicies.add(policyKey);
        score += 10;
        console.log(`Adicionado do ${policyKey} (${url}): ${score}`);
      }
    }
  }

  let categoriesMessage: CategoryMessage;
  if (categories.categoryErrors.length > 0) {
    categoriesMessage = {
      message: "Categorias com menos de 5 posts",
      categories: categories.categoryErrors,
    };
  } else {
    score += 10;
    categoriesMessage = {
      message: "Nenhum problema encontrado nas categorias",
    };
  }

  if (await isUrlAccessible(`${domain}/ads.txt`)) {
    files[0].valid = true;
    score += 10;
  }
  files[1].valid = true;
  score += 10;

  const policiesReturn = await formatReturn(policies, files);
  const isDateInHome = await verifyDateInHome(homepage.data);
  const postsMessage = await validatePosts(
    domainPlatform,
    score,
    domain,
    categories.categoriesMap,
    isDateInHome
  );
  return [score, policiesReturn, categoriesMessage, postsMessage];
}

export default softScrapping;
