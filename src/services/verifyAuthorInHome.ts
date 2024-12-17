import axios from "axios";
import * as cheerio from "cheerio";

export async function verifyAuthorInHome(
  authors: Map<number, string>,
  url: string
): Promise<boolean> {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const bodyText = $("body").text().toLowerCase();

  for (const author of authors.values()) {
    if (bodyText.includes(author.toLowerCase())) {
      return true;
    }
  }

  return false;
}
