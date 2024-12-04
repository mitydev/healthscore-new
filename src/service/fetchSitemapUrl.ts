import axios from "axios";

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
    } catch (error) {
      console.error(`Error accessing robots.txt at ${domain}:`, error);
      return null;
    }
  }