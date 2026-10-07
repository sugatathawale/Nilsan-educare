import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import * as galleryController from "./gallery.controller.js";

const uploadsDir = path.resolve(process.cwd(), "uploads", "gallery");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
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
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  }
});

export const galleryRouter = Router();

galleryRouter.get("/", galleryController.listGallery);

galleryRouter.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  galleryController.createGalleryImage
);

galleryRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  galleryController.deleteGalleryImage
);
