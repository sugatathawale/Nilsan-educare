import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import {
  authenticate,
  optionalAuthenticate
} from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import * as libraryController from "./library.controller.js";

const uploadsDir = path.resolve(process.cwd(), "uploads", "library");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/octet-stream";
    if (ok) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF/DOC/audio files are allowed"));
  }
});

export const libraryRouter = Router();

libraryRouter.get("/plan", libraryController.getPlan);
libraryRouter.put(
  "/plan",
  authenticate,
  requireAdmin,
  libraryController.updatePlan
);

libraryRouter.get(
  "/",
  optionalAuthenticate,
  libraryController.listResources
);

libraryRouter.post(
  "/resources",
  authenticate,
  requireAdmin,
  upload.single("file"),
  libraryController.createResource
);

libraryRouter.patch(
  "/resources/:id",
  authenticate,
  requireAdmin,
  libraryController.updateResource
);

libraryRouter.delete(
  "/resources/:id",
  authenticate,
  requireAdmin,
  libraryController.deleteResource
);

libraryRouter.get(
  "/subscription",
  authenticate,
  libraryController.getMySubscription
);

libraryRouter.post(
  "/subscribe",
  authenticate,
  libraryController.subscribe
);
