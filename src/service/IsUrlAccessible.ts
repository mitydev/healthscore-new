import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
const USER_AGENT = process.env.USER_AGENT || 'Mozilla/5.0';

/**
 * Checks if a URL is accessible.
 * @param url The URL to check.
 * @returns A promise that resolves to true if the URL is accessible, false otherwise.
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  const maxRetries = 3;
  const backoffFactor = 4;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
        timeout: 10000, 
        maxRedirects: 10,
      });

      if ([200, 301, 302].includes(response.status)) {
        return true;
      }
      break;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          console.error(`HTTP error occurred: ${axiosError.response.status} ${axiosError.response.statusText}`);
          break;
        } else if (axiosError.code === 'ECONNABORTED') {
          console.error(`Request timeout: ${axiosError.message}. Retrying...`);
        } else {
          console.error(`Request failed: ${axiosError.message}. Retrying...`);
        }
      } else {
        console.error(`Other error occurred: ${(error as Error).message}`);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(backoffFactor, attempt) * 1000));
    }
  }

  return false;
}
