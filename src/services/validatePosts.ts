import { DetectPlataformReturn } from "./detectPlataform";
import getAllWpAuthors from "./getAllWpAuthors";
import axios from "axios";
import * as cheerio from "cheerio";
import { getAllWpPosts } from "./getAllWpPostsAndPages";
import { verifyAuthorInHome } from "./verifyAuthorInHome";

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
  dateInHome: boolean
): Promise<any> {
  const postMessage: PostMessage[] = [];
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
    let authorInHome = false;

    if (allPosts) {
      const postMessages: PostMessage[] = [];
      if (authors) {
        authorInHome = await verifyAuthorInHome(authors, url);
      }

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
        if (!curr.categories.some((id) => categories.has(id)))
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
}
