import winston from "winston";
import fs from "fs";
import path from "path";
import { CONFIG } from "../config";
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

if (CONFIG.NODE_ENV !== "PROD") {
  logger.add(
    new winston.transports.Console({ format: winston.format.simple() }),
  );
}

export default logger;
