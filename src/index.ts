import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { policies } from "./constants/policies";
import { formatUrl } from "./utils/formatUrl";

async (req: Request, res: Response): Promise<Response> => {
  const domain = req.query.domain as string;

  if (!domain) {
    return res.json({ message: "O dominio não foi fornecido." });
  }

  const URL = formatUrl(domain);

  const files = [
    { desc: "ads.txt", valid: false },
    { desc: "sitemap.xml", valid: false },
  ];

  try {
    let response: AxiosResponse;
    try {
      response = await axios.get(`${URL}/sitemap.xml`, { maxRedirects: 5 });
    } catch {
      response = await axios.get(URL, { maxRedirects: 5 });
    }

    let score = 0;
    let categoriesMessage: any;
    let postsMessage: any;

    if (
      response.status === 200 &&
      response.request.res.responseUrl.endsWith(".xml")
    ) {
      ({ score, policies, categoriesMessage, postsMessage } =
        await softScrapping(URL, policies, files));
    } else if (response.status === 200) {
      ({ score, categoriesMessage, postsMessage, policies } =
        await hardScrapping(URL, response, policies, files));
    } else {
      throw new Error("Both requests failed.");
    }

    const creationDate = await getDomainAge(URL);

    const age = creationDate ? { creation_date: creationDate, score: 10 } : {};

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
