import { Response, NextFunction } from "express";
import { AuthRequest } from "./verificarToken";
import { AppError } from "../utils/errores";

export const esAutor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.usuario?.rol !== "autor") {
    throw new AppError("Acceso solo para autores", 403);
  }
  next();
};