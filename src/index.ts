import express, { Request, Response } from 'express';
import healthRoutes from './routes';  

const app = express();
const port = 3000;  

app.use('/api', healthRoutes);  

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Express com TypeScript funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
