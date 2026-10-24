import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { uploadsRoot } from "../../lib/uploads-path.js";
import type {
  MulterDestinationHandler,
  MulterFileFilterHandler,
  MulterFilenameHandler
} from "../../lib/multer-types.js";
import * as galleryController from "./gallery.controller.js";

const uploadsDir = uploadsRoot("gallery");

const destination: MulterDestinationHandler = (_req, _file, cb) => {
  cb(null, uploadsDir);
};

const filename: MulterFilenameHandler = (_req, file, cb) => {
  const safe = file.originalname
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  cb(null, `${Date.now()}-${safe}`);
};

const fileFilter: MulterFileFilterHandler = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage: multer.diskStorage({ destination, filename }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter
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

galleryRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("image"),
  galleryController.updateGalleryImage
);

galleryRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  galleryController.deleteGalleryImage
);
