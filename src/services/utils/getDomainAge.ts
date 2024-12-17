import { logError } from "../../utils/logging.utils";

const whois = require("whois-json");

export async function getDomainAge(
  domain: string
): Promise<{ creation_date: string }> {
  try {
    const info = await whois(domain.split("//")[1]);
    let creationDate = "Data de criação vazia!";

    if (info.creationDate) {
      creationDate = info.creationDate;
      if (Array.isArray(creationDate)) {
        creationDate = creationDate[0];
      }
    }
    return { creation_date: creationDate };
  } catch (err) {
    logError(getDomainAge, {
      message: "Erro ao chamar a função Whois",
      domain: domain,
      return: err,
    });
    return {
      creation_date: "Erro: Não foi possível conseguir Data de criação!",
    };
  }
}
