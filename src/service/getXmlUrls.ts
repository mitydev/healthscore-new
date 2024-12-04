import axios from "axios";
import * as cheerio from "cheerio";

export async function getXmlUrls(
  sitemap: string,
): Promise<string[]> {
  try {
    const response = await axios.get(sitemap);
    const xmlContent = response.data;
    const $ = cheerio.load(xmlContent, { xmlMode: true });
    const sitemapUrls: string[] = [];
    const urlElements = $("urlset > url > loc");
    const sitemapElements = $("sitemapindex > sitemap > loc");

    urlElements.each((_, elem) => {
      const loc = $(elem).text();
      if (loc) {
        sitemapUrls.push(loc);
      }
    });

    for (const elem of sitemapElements.toArray()) {
      const loc = $(elem).text();
      if (loc) {
        if (loc.endsWith(".xml")) {
          const nestedUrls = await getXmlUrls(loc);
          sitemapUrls.push(...nestedUrls);
        } else {
          sitemapUrls.push(loc);
        }
      }
    }

    return sitemapUrls;
  } catch (error) {
    console.error(`Error accessing ${sitemap}:`, error);
    return [];
  }
}
