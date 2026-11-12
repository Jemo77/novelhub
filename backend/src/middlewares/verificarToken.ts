import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errores";

export interface AuthRequest extends Request {
  usuario?: { id: string; rol: string };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError("Token no proporcionado", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; rol: string };
    req.usuario = decoded;
    next();
  } catch (error) {
    throw new AppError("Token inválido o expirado", 401);
  }
};