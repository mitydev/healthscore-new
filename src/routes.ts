import { Router } from "express";
import { Request, Response } from "express";
import { healthscore } from "./services/healthscore";
import { getDomainAge } from "./services/getDomainAge";
import { formatUrl } from "./utils/formatUrl.utils";
import { logError } from "./utils/logging.utils";

const router = Router();

router.get("/healthscore", async (req: Request, res: Response) => {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(422).json({ message: "O 'domain' não foi fornecido." });
    return;
  }

  try {
    await healthscore(domain, res);
  } catch (err) {
    logError(getDomainAge, {
      message: `Erro ao processar a requisição '/healthscore': ${err}`,
      domain: domain,
      return: err,
    });
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/healthscore/age", async (req: Request, res: Response) => {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(422).json({ message: "O 'domain' não foi fornecido." });
    return;
  }

  try {
    formatUrl(domain);
    await getDomainAge(domain);
  } catch (err) {
    logError(getDomainAge, {
      message: `Erro ao processar a requisição '/healthscore/age': ${err}`,
      domain: domain,
      return: err,
    });
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;
