import { policyConstants, filesConstants } from "../constants";
import { formatUrl, logInfo } from "../utils";
import hardScrapping from "./scrapping/hardScrapping";
import softScrapping from "./scrapping/softScrapping";
import { fetchSitemapUrl } from "./utils/fetchSitemapUrl";
import { getDomainAge } from "./utils/getDomainAge";
import { Response } from "express";

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
      message: `O domínio ${URL} entraria pro Hard Scrapping`,
      domain: URL,
      return: {},
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
};
