import { DetectPlataformReturn } from "./detectPlataform";
import getAllWpAuthors from "./getAllWpAuthors";
import axios from "axios";
import * as cheerio from "cheerio";
import { getAllWpPosts } from "./getAllWpPostsAndPages";

export type PostMessage = {
  post?: string;
  reasons?: any[];
  message?: string;
};

export async function validatePosts(
  domainPlatform: DetectPlataformReturn,
  score: number,
  url: string,
  categories: Map<number, string>,
  dateInHome: boolean,
  authorInHome: boolean
): Promise<any> {
  const postMessage: PostMessage[] = [];
  //TODO: trabalhar nos Posts do healthscore
  /**
   * //TODO:
   * verifique a plataforma
   * cada uma das plataformas tem que verificar o seguinte:
   * conteúdo igual?
   * sem autor?
   * se não tiver erro, score += 10
   *
   * retorno tem que ser na tipagem do postMessage
   */
  if (domainPlatform == "wordpress") {
    const allPosts = await getAllWpPosts(url);
    const authors = await getAllWpAuthors(url);

    if (allPosts) {
      const postMessages: PostMessage[] = [];

      for (const curr of allPosts) {
        const getMyPost = await axios.get(curr.link);
        const myPost = getMyPost.data;
        const $ = cheerio.load(myPost);

        const timeElement = $("time").first();
        const timeText = timeElement.attr("datetime");
        let authorElement;
        authors
          ? (authorElement = $("body")
              .filter((_, element) =>
                $(element)
                  .text()
                  .toLowerCase()
                  .includes(authors.get(curr.author)!.toLowerCase())
              )
              .first())
          : (authorElement = []);

        const errorsInPost = {
          post: curr.link,
          reasons: [] as string[],
        };

        if (!authorInHome && !authorElement.length)
          errorsInPost.reasons.push("Não encontrado Autor no post");
        if (!dateInHome && timeText != curr.date)
          errorsInPost.reasons.push("Sem metadado de Tempo!");
        if (curr.categories.length > 1)
          errorsInPost.reasons.push("Post com duas categorias ou mais!");
        if (curr.categories[0] == 1)
          errorsInPost.reasons.push("Post sem categoria!");

        if (errorsInPost.reasons.length > 0) {
          postMessages.push(errorsInPost);
        }
      }

      if (postMessage.length === 0) score += 10;
      return postMessages;
    }
  }
  if (domainPlatform == "blogger") {
    //blogger vai procurar padroes
  }
  if (domainPlatform == "unknown") {
    //unknown vai ser via scrapping
  }

  //consigo fazer um get de todos os posts em uma só matada se a plataforma for wordpress
  //   if (posts.length > 0) {
  //     const postsData = posts
  //       .map((post) => extractPostData(cheerio.load(post), domainPlatform, url, categories))
  //       .filter((data): data is PostData => data !== null);

  //     const errorsContent: any[] = [];

  //     //TODO: q putaria de for in for
  //     for (let i = 0; i < postsData.length; i++) {
  //       for (let j = 0; j < postsData.length; j++) {
  //         if (i === j || postsData[i].categories === postsData[j].categories) {
  //           continue;
  //         }
  //         if (
  //           postsData[i].title === postsData[j].title ||
  //           postsData[i].summary === postsData[j].summary
  //         ) {
  //           errorsContent.push({
  //             reason: "Conteúdo semelhante",
  //             post1: postsData[i].link,
  //             post2: postsData[j].link,
  //           });
  //         }
  //         if (postsData[i].date && postsData[i].date === postsData[j].title) {
  //           errorsContent.push({
  //             reason: "Datas de postagem iguais",
  //             post1: postsData[i].link,
  //             post2: postsData[j].link,
  //           });
  //         }
  //       }

  //       const urlPost = postsData[i].link;
  //       const responseAuthor = await axios.get(urlPost!);

  //       if (responseAuthor.status === 200) {
  //         const authorSoup = cheerio.load(responseAuthor.data);
  //         const alternativeClasses = ["author-box", "nv-author-biography"];
  //         let authorFound = false;

  //         for (const className of alternativeClasses) {
  //           const authorBox = authorSoup(`.${className}`);
  //           if (authorBox.text().trim()) {
  //             authorFound = true;
  //             break;
  //           }
  //         }
  //         if (!authorFound) {
  //           errorsContent.push({
  //             reason: "Post sem redator!",
  //             post1: urlPost,
  //           });
  //         }
  //       }
  //     }

  //     if (posts.length >= 5) {
  //       score += 10;
  //     } else {
  //       errorsContent.push({
  //         qtd: posts.length,
  //         reason: "Mínimo de posts não cumprido (5)",
  //       });
  //     }
  //     if (errorsContent.length > 0) {
  //       postsMessage = {
  //         message:
  //           "Algumas políticas do Google não estão sendo seguidas nos seguintes posts",
  //         reasons: errorsContent,
  //       };
  //     } else {
  //       postsMessage = {
  //         message: "Nenhum problema encontrado nos posts",
  //       };
  //     }
  //     if (errorsContent.length === 0) {
  //       score += 10;
  //     }
  //   } else {
  //     //TODO: verificar pq está entrando nesse else toda hora
  //     postsMessage = {
  //       message:
  //         "Posts não encontrados (inexistentes ou fora dos padrões reconhecidos)!",
  //     };
  //   }

  //   return postMessage;
}
