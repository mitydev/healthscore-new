import axios, { AxiosError } from "axios";

export type DetectPlataformReturn = "wordpress" | "blogger" | "unknown";

export async function detectPlatform(
  url: string
): Promise<DetectPlataformReturn> {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;

      if (html.includes("wp-content") || html.includes("wp-json")) {
        return "wordpress";
      }
      if (url.includes("blogspot") || html.includes("/search/label/")) {
        return "blogger";
      }
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Error detecting platform for ${url}:`, error.message);
    } else {
      console.error(error);
    }
  }
  return "unknown";
}
