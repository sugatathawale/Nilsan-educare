import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${env.PORT}`);
      console.log(`API base URL: http://0.0.0.0:${env.PORT}${env.API_PREFIX}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
