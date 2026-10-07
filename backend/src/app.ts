import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(cors(corsOptions));
  // JSON stays small; video/image uploads use multipart routes
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"), {
      maxAge: "7d",
      fallthrough: true
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      name: "Nilsan Educare Backend",
      version: "0.1.0",
      docs: `${env.API_PREFIX}/health`
    });
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
