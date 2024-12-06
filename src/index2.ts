import amqplib, { Channel, Connection } from "amqplib";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();
const rabbitUrl = process.env.RABBITMQ_URL!;
const rabbitQueue = process.env.RABBITMQ_QUEUE_NAME!;

async function startRabbitMQListener() {
  try {
    const connection: Connection = await amqplib.connect(rabbitUrl);
    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(rabbitQueue, { durable: true });

    console.log(`Listener conectado à fila: ${rabbitQueue}`);

    channel.consume(
      rabbitQueue,
      async (msg) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log(`Mensagem recebida: ${messageContent}`);

          try {
            const result = await processJob(messageContent);

            await axios.post("http://example.com/api/resultado", result);

            console.log("Resultado enviado com sucesso!");
          } catch (error) {
            console.error("Erro ao processar ou enviar o resultado:", error);
          } finally {
            channel.ack(msg);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Erro ao iniciar o listener RabbitMQ:", error);
  }
}

async function processJob(messageContent: string): Promise<any> {
  console.log(`Processando job: ${messageContent}`);

  const processedData = {
    original: messageContent,
    processedAt: new Date(),
    status: "success",
  };

  return processedData;
}

startRabbitMQListener();
