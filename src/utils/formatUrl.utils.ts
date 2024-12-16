export function formatUrl(domain: string): string | { message: string } {
  if (domain.startsWith("http://")) {
    return { message: "Erro: 'http' não é aceitável!" };
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
