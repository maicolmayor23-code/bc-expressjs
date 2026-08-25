import winston from 'winston';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// Transports list
const transports: winston.transport[] = [
  new winston.transports.Console(),
];

// File transport exists ONLY in production
if (isProduction) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  );
}

export const logger = winston.createLogger({
  level: isProduction ? 'warn' : 'http',
  format: isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) => `${String(timestamp)} [${level}]: ${message}`,
        ),
      ),
  transports,
});

// Stream for Morgan integration to route HTTP request logs to Winston
export const morganMiddleware = morgan(isProduction ? 'combined' : 'dev', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  },
});
