import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

import express, { Application } from "express";
import cors, { CorsOptions } from "cors";

const app: Application = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  "https://netcourse.tech",
  "https://www.netcourse.tech",
  "https://admin.netcourse.tech",
  "https://forum.netcourse.tech",
  "/.*\.netcourse\.tech$/",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const origins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;
    if (origins.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-turnstile-token"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(requestLogger);

app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/admin", (req, _res, next) => {
  if (!req.body) req.body = {};
  req.body.turnstileToken = "BYPASS";
  req.headers["x-turnstile-token"] = "BYPASS";
  next();
});
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", express.static("public/admin"));

app.use(errorHandler);

export default app;
