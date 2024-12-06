import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { policy } from "../constants/policies";
import { formatUrl } from "../utils/formatUrl.utils";
import { fetchSitemapUrl } from "./fetchSitemapUrl";
import { getDomainAge } from "./getDomainAge";
import softScrapping, { CategoryMessage, PostMessage } from "./softScrapping";
import { hardScrapping } from "./hardScrapping";

interface SoftScrappingResult {
  score: number;
  policies: any;
  categoriesMessage: CategoryMessage;
  postsMessage: PostMessage;
}

export const healthscore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const domain = req.query.domain as string;
  if (!domain) {
    return res.json({ message: "O 'domain' não foi fornecido." });
  }

  const URL = formatUrl(domain);
  const sitemap = await fetchSitemapUrl(URL);
  const files = [
    { desc: "ads.txt", valid: false },
    { desc: "sitemap.xml", valid: false },
  ];

  let policies = policy;
  let score = 0;
  let categoriesMessage: CategoryMessage = { message: "" };
  let postsMessage: PostMessage = { message: "" };

  try {
    let response: AxiosResponse;
    try {
      response = await axios.get(sitemap ? sitemap : `${URL}/sitemap.xml`, {
        maxRedirects: 5,
      });
    } catch {
      response = await axios.get(URL, { maxRedirects: 5 });
    }

    if (
      response.status === 200 &&
      response.request.res.responseUrl.endsWith(".xml")
    ) {
      const [
        scoreResult,
        policiesResult,
        categoriesMessageVerified,
        postsMessageResult,
      ] = await softScrapping(sitemap || `${URL}/sitemap.xml`, policies, files);

      score = scoreResult;
      policies = policiesResult;
      categoriesMessage = categoriesMessageVerified;
      postsMessage = postsMessageResult;
    } else {
      console.log(await hardScrapping());
    }

    const creationDate = await getDomainAge(URL);
    if (creationDate) {
      score += 10;
      console.log(`Adicionado da data de criação: ${score}`);
    }

    const age = creationDate
      ? { creation_date: creationDate }
      : { creation_date: null };

    return res.json({
      status: 200,
      score,
      domain_age: age,
      categories: categoriesMessage,
      posts: postsMessage,
      required_pages: policies,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      code: "error",
      message: "Dominio possui proteção contra web scraping",
    });
  }
};
