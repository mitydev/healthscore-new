import cheerio from "cheerio";
import { DetectPlataformReturn } from "../services/detectPlataform";

export type PostData = {
  title: string;
  categories: number[];
  date: string;
  link: string;
  author: string | undefined;
};

async function extractPostData(
  platform: DetectPlataformReturn,
  url: string,
  categories: Map<number, string>,
  author: Map<number, string>
): Promise<PostData | null> {
  //verify platform
  //não preciso extractdata se vier do wordpress
  // if (platform == "wordpress") {
  //   return { title: "", categories: [], date: "", link: "", author: "" };
  // }
  if (platform == "blogger") {
    // //blogger?
    return { title: "", categories: [], date: "", link: "", author: "" };
  }
  if (platform == "unknown") {
    // //scrapper?
    return { title: "", categories: [], date: "", link: "", author: "" };
  }

  return null;
}

export default extractPostData;
