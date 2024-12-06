import { Router } from 'express';
import { Request, Response } from 'express';
import { healthscore } from './service/healthscore';

const router = Router();

router.get('/healthscore', async (req: Request, res: Response) => {
  try {
    await healthscore(req, res);
  } catch (error) {
    console.error('Erro ao processar a requisição: ', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
