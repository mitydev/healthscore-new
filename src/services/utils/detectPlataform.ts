import axios from "axios";
import { logError } from "../../utils/logging.utils";

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
  } catch (err) {
    logError(detectPlatform, {
      domain: url,
      message: `Erro: Erro ao detectar a plataforma para o ${url}:`,
      return: err,
    });
  }
  return "unknown";
}
