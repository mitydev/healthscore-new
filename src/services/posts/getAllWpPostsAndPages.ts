import axios from "axios";

type getPostsOrPagesWordpressResponse = {
  data: PostDataWordpress[];
};

export type PostDataWordpress = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  categories: number[];
  author: number;
};

export type PageDataWordpress = Omit<PostDataWordpress, "categories">;

export async function getAllWpPosts(url: string) {
  const allPosts: PostDataWordpress[] = [];
  let perPage = 100;
  let pageIndex = 1;
  while (true) {
    const apiUrl = `${url}/wp-json/wp/v2/posts?per_page=${perPage}&page=${pageIndex}`;
    const response: getPostsOrPagesWordpressResponse = await axios.get(apiUrl);
    allPosts.push(...response.data);
    if (response.data.length != perPage || pageIndex == 100) break;
    pageIndex++;
  }

  return allPosts;
}

export async function getAllWpPages(url: string) {
  const allPages: PageDataWordpress[] = [];
  let perPage = 100;
  let pageIndex = 1;
  while (true) {
    const apiUrl = `${url}/wp-json/wp/v2/pages?per_page=${perPage}&page=${pageIndex}`;
    const response: getPostsOrPagesWordpressResponse = await axios.get(apiUrl);
    allPages.push(...response.data);
    if (response.data.length != perPage || pageIndex == 100) break;
    pageIndex++;
  }
}
