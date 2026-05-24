import pino from "pino";
import pinoHttp from "pino-http";
import pretty from "pino-pretty";
import { mkdirSync } from "node:fs";
import { createStream } from "rotating-file-stream";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || "info";
const prettyLogs = process.env.LOG_PRETTY === "true";

const createLogger = () => {
    if (!isProduction) {
        return pino({
            level: logLevel,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                    singleLine: true,
                },
            },
        });
    }

    const logDir = process.env.LOG_DIR || "logs";
    const rotateInterval = process.env.LOG_ROTATE_INTERVAL || "1d";
    const retentionDays = Number(process.env.LOG_RETENTION_DAYS || "7");

    mkdirSync(logDir, { recursive: true });

    const rotatingStream = createStream("app.log", {
        path: logDir,
        interval: rotateInterval,
        maxFiles:
            Number.isFinite(retentionDays) && retentionDays > 0
                ? retentionDays
                : 7,
    });

    const stdoutStream = prettyLogs
        ? pretty({
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
              singleLine: true,
          })
        : process.stdout;

    return pino(
        { level: logLevel },
        pino.multistream([
            { stream: stdoutStream },
            { stream: rotatingStream },
        ]),
    );
};

const logger = createLogger();

export const requestLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => req.url === "/health",
    },
    serializers: {
        req: (req: any) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress || req.socket?.remoteAddress,
            userAgent: req.headers?.["user-agent"],
        }),
        res: (res: any) => ({
            statusCode: res.statusCode,
        }),
    },
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
    customSuccessMessage: (req, res) =>
        `${req.method} ${req.url} -> ${res.statusCode}`,
    customErrorMessage: (req, res, err) =>
        `${req.method} ${req.url} -> ${res.statusCode} (${err?.message || "error"})`,
});
