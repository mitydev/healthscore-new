export function formatUrl(domain: string): string {
  if (!domain.startsWith("https://")) {
    return `https://${domain}`;
  }
  if(domain.startsWith("http://")) {
    return "Error: " + Error;
  }
  return domain;
}
