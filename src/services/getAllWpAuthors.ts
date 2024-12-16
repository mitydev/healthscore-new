import axios from "axios";
import { logError } from "../utils/logging";

type getAuthorsResponse = {
  data: AuthorData[];
};

type AuthorData = {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
};

async function getAllWpAuthors(url: string): Promise<Map<number, string> | null> {
  const authorMap = new Map();
  try {
    const response: getAuthorsResponse = await axios.get(
      `${url}/wp-json/wp/v2/users/`
    );

    response.data.forEach((data) => {
      authorMap.set(data.id, data.name);
    });
  } catch (err) {
    logError(getAllWpAuthors, {
      newFile: true,
      data: {
        message: "Falha no GET do Authors Wordpress",
        domain: url,
        return: err,
      }
    })
    return null;
  }

  return authorMap;
}

export default getAllWpAuthors;