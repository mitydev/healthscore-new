import { Response } from "express";
import { formatUrl } from "../utils/formatUrl.utils";
import { fetchSitemapUrl } from "./fetchSitemapUrl";
import { getDomainAge } from "./getDomainAge";
import softScrapping from "./softScrapping";
import { policyConstants } from "../constants/policies";
import { filesConstants } from "../constants/files";
import { logInfo } from "../utils/logging";
import { hardScrapping } from "./hardScrapping";

export const healthscore = async (
  domain: string,
  res: Response
): Promise<Response> => {
  const URL = formatUrl(domain);
  if (typeof URL === "object") {
    return res.json(URL);
  }

  const sitemap = await fetchSitemapUrl(URL);
  let score = 0;
  const creationDate = await getDomainAge(URL);
  let categoriesMessage;
  let postsMessage;
  let policies = JSON.parse(JSON.stringify(policyConstants));
  let files = JSON.parse(JSON.stringify(filesConstants));

  if (sitemap) {
    const [
      scoreResult,
      policiesResult,
      categoriesMessageVerified,
      postsMessageResult,
    ] = await softScrapping(sitemap, policies, files);

    score = scoreResult;
    policies = policiesResult;
    categoriesMessage = categoriesMessageVerified;
    postsMessage = postsMessageResult;
  } else {
    logInfo(hardScrapping, {
      newFile: false,
      data: {
        message: `O domínio ${URL} entraria pro Hard Scrapping`,
        domain: URL,
        return: {}
      },
    });
  }

  if (creationDate) score += 10;
  return res.status(200).json({
    score,
    domain_age: creationDate,
    categories: categoriesMessage,
    posts: postsMessage,
    required_pages: policies,
  });

  /**
   * //TODO
   * preciso realizar um tratamento de erro
   */
  // console.error(error);
  // return res.json({
  //   code: "error",
  //   message: "Dominio possui proteção contra web scraping",
  // });
};
