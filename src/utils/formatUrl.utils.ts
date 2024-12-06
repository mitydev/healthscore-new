export function formatUrl(domain: string): string {
  if(domain.startsWith("http://")) {
    return "Error: 'http' not acceptable!"
  }
  if (!domain.startsWith("https://")) {
    return `https://${domain}`;
  }
  if (domain.endsWith("/")) {
    domain = domain.slice(0, -1);
    return `${domain}`;
  }
  return domain;
}
