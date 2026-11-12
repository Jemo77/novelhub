import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async registro(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, email, password, rol } = req.body;
      const usuario = await authService.registrar(nombre, email, password, rol);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
