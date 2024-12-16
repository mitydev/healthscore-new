import axios from "axios";
import * as cheerio from "cheerio";
import { logError } from "../utils/logging";

export async function getXmlUrls(sitemap: string): Promise<string[]> {
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
  } catch (err) {
    logError(getXmlUrls, {
      newFile: true,
      data: {
        message: `Error accessing ${sitemap}:`,
        domain: sitemap,
        return: err,
      },
    });
    return [];
  }
}
