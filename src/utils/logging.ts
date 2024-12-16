import fs from "fs";
import path from "path";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";

export type WinstonLogData = {
  newFile: boolean;
  data: {
    message: string;
    domain: string;
    return: unknown;
  };
};

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
        )
      ),
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), "/logs/app.log"),
    }),
  ],
});

function createFile(
  funcName: string,
  uniqueId: string,
  message: string,
  returnData: unknown
) {
    const dirPath = path.join(process.cwd(), "logs", funcName); 
    const filePath = path.join(dirPath, `${uniqueId}.txt`); 
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileContent = `${message}\n\n${JSON.stringify(returnData, null, 2)}`;
    fs.writeFileSync(filePath, fileContent, "utf8");
}

export function logError(func: Function, data: WinstonLogData) {
  const {
    newFile,
    data: { message, domain, return: returnData },
  } = data;

  const uniqueId = uuidv4();

  if (newFile) {
    createFile(func.name, uniqueId, message, returnData);
    logger.error(`${uniqueId} - ${new Date().toLocaleString()} - ${domain}`);
  } else {
    logger.error(message);
  }
}

export function logInfo(func: Function, data: WinstonLogData) {
  const {
    newFile,
    data: { message, domain, return: returnData },
  } = data;

  const uniqueId = uuidv4();

  if (newFile) {
    createFile(func.name, uniqueId, message, returnData);
    logger.info(`${uniqueId} - ${new Date().toLocaleString()} - ${domain}`);
  } else {
    logger.info(message);
  }
}
