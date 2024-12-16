import axios from "axios";
import { logError } from "../utils/logging";

export async function fetchSitemapUrl(domain: string): Promise<string | null> {
    try {
      const robotsUrl = `${domain}/robots.txt`;
      const response = await axios.get(robotsUrl);
  
      const robotsContent: string = response.data;
      const sitemapLine = robotsContent
        .split("\n")
        .find((line: string) => line.trim().toLowerCase().startsWith("sitemap:"));
  
      if (sitemapLine) {
        return "https://" + sitemapLine.split("//")[1].trim();
      }
  
      return null;
    } catch (err) {
      console.error(`Error accessing robots.txt at ${domain}:`, err);
      logError(fetchSitemapUrl, {
        newFile: true,
        data: {
          domain: domain,
          message: `Erro: acessando o robots.txt no ${domain}:`,
          return: err,
        }
      })
      return null;
    }
  }