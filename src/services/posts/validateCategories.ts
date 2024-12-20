import axios from "axios";
import * as cheerio from "cheerio";
import { logError } from "../../utils/logging.utils";
import capitalizeFirstLetter from "../../utils/capitalize.utils";
import { DetectPlataformReturn } from "../utils/detectPlataform";

type responseCategory = {
  status: number;
  data: CategoryData[];
};

export type CategoryData = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
};

export async function validateCategories(
  url: string,
  platform: DetectPlataformReturn
): Promise<{ categoryErrors: string[]; categoriesMap: Map<number, string> }> {
  const categoryErrors: string[] = [];
  const categoriesMap = new Map<number, string>();

  try {
    if (platform === "wordpress") {
      const apiUrl = `${url}/wp-json/wp/v2/categories`;
      const response: responseCategory = await axios.get(apiUrl);
      response.data.forEach((data) => {
        const slugSplitted = capitalizeFirstLetter(
          data.slug.replaceAll("-", " ")
        );
        categoriesMap.set(data.id, slugSplitted);
      });
      if (response.status === 200) {
        const categories = response.data;
        for (const category of categories) {
          if (category.count < 5) {
            categoryErrors.push(`${url}/category/${category.slug}`);
          }
        }
      }
    }
    if (platform === "blogger") {
      const response = await axios.get(url);
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        const categoryLinks = $("a[href*='/search/label/']");

        for (const link of categoryLinks.toArray()) {
          const categoryUrl = $(link).attr("href");
          if (categoryUrl) {
            const categoryResponse = await axios.get(categoryUrl);
            if (categoryResponse.status === 200) {
              const categoryHtml = categoryResponse.data;
              const categoryPage = cheerio.load(categoryHtml);
              const posts = categoryPage("article");

              if (posts.length < 5) {
                categoryErrors.push(categoryUrl);
              }
            }
          }
        }
      }
    }
    if (platform === "unknown") {
      categoriesMap.set(0, "Sem categoria");
      categoryErrors.push("Categorias não encontradas!");
      logError(validateCategories, {
        domain: url,
        message:
          "Categorias não encontradas, entrou no IF do Platform 'Unknown'",
        return: { categoriesMap, categoryErrors },
      });
    }
  } catch (err) {
    logError(validateCategories, {
      message: `Erro: Erro ao validar as categorias`,
      domain: url,
      return: err,
    });
  }

  return { categoryErrors, categoriesMap };
}
