const whois = require('whois-json');

export async function getDomainAge(domain: string): Promise<Date | false> {
    try {
        const info = await whois(domain.split('//')[1]);
        
        if (info.creationDate) {
            let creationDate = info.creationDate;

            if (Array.isArray(creationDate)) {
                creationDate = creationDate[0];
            }

            return new Date(creationDate);
        }
    } catch (e) {
        console.error(`Erro ao obter informações do domínio: ${e}`);
    }
    return false;
}