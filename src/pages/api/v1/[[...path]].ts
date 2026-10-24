import type { NextApiRequest, NextApiResponse } from "next";
import serverless from "serverless-http";
import { createApp } from "../../../../backend/dist/app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false
  }
};

type ServerlessHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<unknown>;

declare global {
  // Reuse the Express app across warm serverless invocations
  // eslint-disable-next-line no-var
  var __nilsanApiHandler: ServerlessHandler | undefined;
}

function getHandler(): ServerlessHandler {
  if (!global.__nilsanApiHandler) {
    global.__nilsanApiHandler = serverless(createApp(), {
      binary: [
        "image/*",
        "audio/*",
        "application/pdf",
        "application/octet-stream",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    }) as ServerlessHandler;
  }
  return global.__nilsanApiHandler;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return getHandler()(req, res);
}
