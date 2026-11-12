import multer from "multer";
import { AppError } from "../utils/errores";

const storage = multer.memoryStorage(); // Guardamos en memoria para subir a R2

const fileFilterImagen = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new AppError("Solo se permiten imágenes", 400));
};

const fileFilterLibro = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const nombre = file.originalname.toLowerCase();
  const esPdf = file.mimetype === "application/pdf" || nombre.endsWith(".pdf");
  const esEpub = file.mimetype === "application/epub+zip" || nombre.endsWith(".epub");

  if (esPdf || esEpub) {
    cb(null, true);
    return;
  }

  cb(new AppError("Solo se permiten archivos PDF o EPUB", 400));
};

const fileFilterObra = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const esImagen = file.mimetype.startsWith("image/");
  const nombre = file.originalname.toLowerCase();
  const esPdf = file.mimetype === "application/pdf" || nombre.endsWith(".pdf");
  const esEpub = file.mimetype === "application/epub+zip" || nombre.endsWith(".epub");

  if (esImagen || esPdf || esEpub) {
    cb(null, true);
    return;
  }

  cb(new AppError("Solo se permiten imágenes, PDF o EPUB", 400));
};

export const uploadImagen = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: fileFilterImagen,
});

export const uploadLibro = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250 MB máximo para libros
  fileFilter: fileFilterLibro,
});

export const uploadObra = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: fileFilterObra,
});