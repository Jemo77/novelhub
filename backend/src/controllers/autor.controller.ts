import { Request, Response, NextFunction } from "express";
import { AutorService } from "../services/autor.service";
import { AuthRequest } from "../middlewares/verificarToken";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../config/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const autorService = new AutorService();

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "1";
}

function obtenerExtensionArchivo(nombreOriginal: string): string {
  const partes = nombreOriginal.split(".");
  return partes.length > 1 ? partes.pop()!.toLowerCase() : "bin";
}

export class AutorController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const autorId = req.usuario.id;
      const data = await autorService.getDashboardStats(autorId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getEnlaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const perfil = await autorService.getPerfil(req.usuario.id);
      res.json(perfil);
    } catch (error) {
      next(error);
    }
  }

  async actualizarEnlaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const perfil = await autorService.actualizarEnlaces(req.usuario.id, req.body || {});
      res.json(perfil);
    } catch (error) {
      next(error);
    }
  }

  async crearObra(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const autorId = req.usuario.id;
      const { titulo, tipo, sinopsis, precioUSDT, formato } = req.body;
      let generos = [];
      try {
        if (req.body.generos) {
          generos = JSON.parse(req.body.generos);
        }
      } catch (e) {
        generos = Array.isArray(req.body.generos) ? req.body.generos : [req.body.generos].filter(Boolean);
      }

      let portadaUrl = undefined;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const portadaFile = files?.portada?.[0];
      const archivoLibro = files?.archivo?.[0];

      if (portadaFile) {
        const fileKey = `portadas/${uuidv4()}.webp`;
        const bufferWebp = await sharp(portadaFile.buffer).resize(250, 300, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            Body: bufferWebp,
            ContentType: "image/webp",
          })
        );
        portadaUrl = `${R2_PUBLIC_URL}/${fileKey}`;
      }

      if (tipo.toLowerCase() === "libro") {
        if (!archivoLibro) {
          return res.status(400).json({ error: "Se requiere un archivo PDF o EPUB para publicar un libro" });
        }

        const formatoNormalizado = String(formato || obtenerExtensionArchivo(archivoLibro.originalname)).toUpperCase();
        const fileKey = `libros/${uuidv4()}.${obtenerExtensionArchivo(archivoLibro.originalname)}`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            Body: archivoLibro.buffer,
            ContentType: archivoLibro.mimetype || (formatoNormalizado === "EPUB" ? "application/epub+zip" : "application/pdf"),
          })
        );

        const libro = await autorService.crearLibro(
          autorId,
          titulo,
          sinopsis,
          Number(precioUSDT),
          fileKey,
          formatoNormalizado,
          portadaUrl
        );

        return res.status(201).json(libro);
      }

      const nuevaObra = await autorService.crearObra(autorId, tipo.toLowerCase(), titulo, sinopsis, generos, portadaUrl);
      
      res.status(201).json(nuevaObra);
    } catch (error) {
      next(error);
    }
  }

  async crearCapituloNovela(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const autorId = req.usuario.id;
      const { obraId } = req.params;
      const { numero, titulo, contenido, esPremium, precioUSDT, duracionHoras } = req.body;

      const capitulo = await autorService.crearCapituloNovela(
        autorId,
        obraId,
        Number(numero),
        titulo,
        contenido,
        {
          esPremium: parseBoolean(esPremium),
          precioUSDT: parseNullableNumber(precioUSDT),
          duracionHoras: parseNullableNumber(duracionHoras),
        }
      );
      res.status(201).json(capitulo);
    } catch (error) {
      next(error);
    }
  }

  async crearCapituloComic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const autorId = req.usuario.id;
      const { obraId } = req.params;
      const { numero, titulo, esPremium, precioUSDT, duracionHoras } = req.body;

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "Se requieren imágenes para el capítulo" });
      }

      const imagenesUrl: string[] = [];

      for (const file of req.files) {
        const metadata = await sharp(file.buffer).metadata();
        const isVertical = metadata.width === 1080 && metadata.height === 2340;

        if (!isVertical) {
          return res.status(400).json({ error: `La imagen original no cumple con las dimensiones obligatorias (1080x2340 vertical). Dimensiones actuales: ${metadata.width}x${metadata.height}` });
        }

        const fileKey = `comics/${obraId}/${uuidv4()}.webp`;
        const bufferWebp = await sharp(file.buffer).webp({ quality: 75, effort: 6 }).toBuffer();
        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            Body: bufferWebp,
            ContentType: "image/webp",
          })
        );
        imagenesUrl.push(`${R2_PUBLIC_URL}/${fileKey}`);
      }

      const capitulo = await autorService.crearCapituloComic(
        autorId,
        obraId,
        Number(numero),
        titulo,
        imagenesUrl,
        {
          esPremium: parseBoolean(esPremium),
          precioUSDT: parseNullableNumber(precioUSDT),
          duracionHoras: parseNullableNumber(duracionHoras),
        }
      );
      res.status(201).json(capitulo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerObraParaEditar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return res.status(401).json({ error: "No autorizado" });
      const { obraId } = req.params;
      const { tipo } = req.query;
      console.log('OBTENER OBRA PARA EDITAR:', { obraId, tipo, usuarioId: req.usuario.id });
      if (!tipo || typeof tipo !== "string") return res.status(400).json({ error: "Tipo es requerido" });
      
      const obra = await autorService.obtenerObraParaEditar(req.usuario.id, obraId, tipo);
      res.json(obra);
    } catch (error) {
      next(error);
    }
  }

  async editarObra(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return res.status(401).json({ error: "No autorizado" });
      const { obraId } = req.params;
      const { tipo, titulo, sinopsis } = req.body;

      let portadaUrl = undefined;
      if (req.file) {
        const obraExistente = await autorService.obtenerObraParaEditar(req.usuario.id, obraId, tipo);
        if (obraExistente && obraExistente.portada) {
          const oldKey = obraExistente.portada.replace(`${R2_PUBLIC_URL}/`, '');
          if (oldKey && oldKey.includes('portadas/')) {
            try {
              await r2Client.send(
                new DeleteObjectCommand({
                  Bucket: R2_BUCKET_NAME,
                  Key: oldKey
                })
              );
            } catch (err) {
              console.error("Error eliminando portada anterior:", err);
            }
          }
        }

        const fileKey = `portadas/${uuidv4()}.webp`;
        const bufferWebp = await sharp(req.file.buffer).resize(250, 300, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileKey,
            Body: bufferWebp,
            ContentType: "image/webp",
          })
        );
        portadaUrl = `${R2_PUBLIC_URL}/${fileKey}`;
      }

      const obraActualizada = await autorService.editarObra(req.usuario.id, obraId, tipo, titulo, sinopsis, portadaUrl);
      res.json(obraActualizada);
    } catch (error) {
      next(error);
    }
  }

  async editarCapitulo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return res.status(401).json({ error: "No autorizado" });
      const { obraId, capituloId } = req.params;
      const { tipo, titulo } = req.body;

      const cap = await autorService.editarCapitulo(req.usuario.id, obraId, tipo, capituloId, titulo);
      res.json(cap);
    } catch (error) {
      next(error);
    }
  }

  async eliminarCapitulo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return res.status(401).json({ error: "No autorizado" });
      const { obraId, capituloId } = req.params;
      const { tipo } = req.query;
      console.log('OBTENER OBRA PARA EDITAR:', { obraId, tipo, usuarioId: req.usuario.id });
      if (!tipo || typeof tipo !== "string") return res.status(400).json({ error: "Tipo es requerido" });

      await autorService.eliminarCapitulo(req.usuario.id, obraId, tipo, capituloId);
      res.json({ mensaje: "Capítulo eliminado" });
    } catch (error) {
      next(error);
    }
  }
}
