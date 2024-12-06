import axios, { AxiosError } from "axios";
import { DetectPlataformReturn } from "./detectPlataform";
import * as cheerio from "cheerio";

export async function validateCategories(
  url: string,
  platform: DetectPlataformReturn
): Promise<string[]> {
  const categoryErrors: string[] = [];

  try {
    if (platform === "wordpress") {
      const apiUrl = `${url}/wp-json/wp/v2/categories`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const categories = response.data;
        for (const category of categories) {
          if (category.count < 5) {
            categoryErrors.push(`${url}/category/${category.slug}`);
          }
        }
      }
    } else if (platform === "blogger") {
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
    } else {
      categoryErrors.push(`Platform ${platform} is not supported.`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      categoryErrors.push(
        `Error detecting platform for ${url}:`,
        error.message
      );
      console.error(`Error detecting platform for ${url}:`, error.message);
    } else {
      console.error(error);
    }
  }

  return categoryErrors;
}
