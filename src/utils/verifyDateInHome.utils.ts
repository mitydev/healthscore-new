import * as cheerio from "cheerio";

export async function verifyDateInHome(html: string): Promise<boolean> {
  const $ = cheerio.load(html);

  const regex =
    /\b(\d{2})[\/\s]?(dez|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|[0-9]{2,4})[\/\s]?(?:\d{4})?\b/gi;

  const bodyText = $("body").text();
  console.log(regex.test(bodyText));
  return regex.test(bodyText);
}
