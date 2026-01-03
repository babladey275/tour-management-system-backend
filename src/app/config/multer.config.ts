import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";
import crypto from "crypto";
import { Request } from "express";

const routeFolder = ["user", "booking", "tour", "division", "payment"];

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: (req, file) => {
    let folder = "tour-management/default";

    const matchedRoute = routeFolder.find((route) =>
      req.baseUrl.split("/").includes(route)
    );

    if (matchedRoute) folder = `tour-management/${matchedRoute}`;

    const originalNameWithoutExt = file.originalname
      .toLowerCase()
      .replace(/\.[^/.]+$/, "");

    const fileName = originalNameWithoutExt
      .replace(/\s+/g, "-")
      .replace(/\./g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const safeName = fileName || "file";

    const publicId = `${crypto.randomUUID()}-${safeName}`;

    return {
      folder,
      public_id: publicId,
    };
  },
});

export const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only jpg/png/webp files are allowed"));
  }

  cb(null, true);
};

export const multerUpload = multer({ storage, fileFilter });
