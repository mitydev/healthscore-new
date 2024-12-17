import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { logError } from "../utils/logging.utils";

dotenv.config();
const USER_AGENT = process.env.USER_AGENT || "Mozilla/5.0";

export async function isUrlAccessible(url: string): Promise<boolean> {
  const maxRetries = 3;
  const backoffFactor = 4;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": USER_AGENT,
        },
        timeout: 10000,
        maxRedirects: 10,
      });

      if ([200, 301, 302].includes(response.status)) {
        return true;
      }
      break;
    } catch (err) {
      logError(isUrlAccessible, {
        message: `Erro: Falha ao executar a função isUrlAccessible; Tentativa ${attempt}`,
        domain: url,
        return: err,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(backoffFactor, attempt) * 1000)
      );
    }
  }

  return false;
}
