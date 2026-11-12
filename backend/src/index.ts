import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes";
import contenidoRoutes from "./routes/contenido.routes";
import autorRoutes from "./routes/autor.routes";
const app = express();
const PORT = process.env.PORT || 3001;

// Al dejarlo vacío, le decimos: "Deja pasar a cualquier página web por ahora"
app.use(cors());

app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/contenido", contenidoRoutes);
app.use("/api/autor", autorRoutes);

// Ruta no encontrada (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// Manejo de errores global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});