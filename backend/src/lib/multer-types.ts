import type { Request } from "express";
import type { FileFilterCallback } from "multer";

export type MulterFile = Express.Multer.File;

export type MulterDestinationCb = (error: Error | null, destination: string) => void;
export type MulterFilenameCb = (error: Error | null, filename: string) => void;

export type MulterDestinationHandler = (
  req: Request,
  file: MulterFile,
  cb: MulterDestinationCb
) => void;

export type MulterFilenameHandler = (
  req: Request,
  file: MulterFile,
  cb: MulterFilenameCb
) => void;

export type MulterFileFilterHandler = (
  req: Request,
  file: MulterFile,
  cb: FileFilterCallback
) => void;
