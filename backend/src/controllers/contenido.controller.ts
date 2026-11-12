import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ContenidoService } from "../services/contenido.service";

const contenidoService = new ContenidoService();

function obtenerUsuarioId(req: Request): string | null {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    return decoded?.id || null;
  } catch (error) {
    return null;
  }
}

export class ContenidoController {
  async obtenerHome(req: Request, res: Response, next: NextFunction) {
    try {
            const tipoParam = req.query.tipo;
      let tipo: 'novela' | 'comic' | 'libro' = 'novela';
      if (tipoParam === 'comic' || tipoParam === 'libro' || tipoParam === 'novela') {
        tipo = tipoParam;
      }
      const data = await contenidoService.obtenerHome(tipo);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async obtenerNovelas(req: Request, res: Response, next: NextFunction) {
    try {
      const { genero, pagina, limite } = req.query;
      const data = await contenidoService.obtenerNovelas(
        genero as string,
        Number(pagina) || 1,
        Number(limite) || 10
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async obtenerNovela(req: Request, res: Response, next: NextFunction) {
    try {
      
      let identificador = req.ip || req.socket?.remoteAddress || 'unknown';
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
          if (decoded && decoded.id) {
            identificador = decoded.id;
          }
        } catch (e) {}
      }
      const novela = await contenidoService.obtenerNovela(req.params.id, identificador);
      res.json(novela);
    } catch (error) {
      next(error);
    }
  }

  async obtenerComics(req: Request, res: Response, next: NextFunction) {
    try {
      const { genero, pagina, limite } = req.query;
      const data = await contenidoService.obtenerComics(
        genero as string,
        Number(pagina) || 1,
        Number(limite) || 10
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async obtenerComic(req: Request, res: Response, next: NextFunction) {
    try {
      
      let identificador = req.ip || req.socket?.remoteAddress || 'unknown';
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
          if (decoded && decoded.id) {
            identificador = decoded.id;
          }
        } catch (e) {}
      }
      const comic = await contenidoService.obtenerComic(req.params.id, identificador);
      res.json(comic);
    } catch (error) {
      next(error);
    }
  }

  async obtenerCapituloNovela(req: Request, res: Response, next: NextFunction) {
    try {
      let identificador = req.ip || req.socket?.remoteAddress || 'unknown';
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
          if (decoded && decoded.id) {
            identificador = decoded.id;
          }
        } catch (e) {}
      }
      const capitulo = await contenidoService.obtenerCapituloNovela(req.params.id, identificador);
      res.json(capitulo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerCapituloComic(req: Request, res: Response, next: NextFunction) {
    try {
      let identificador = req.ip || req.socket?.remoteAddress || 'unknown';
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
          if (decoded && decoded.id) {
            identificador = decoded.id;
          }
        } catch (e) {}
      }
      const capitulo = await contenidoService.obtenerCapituloComic(req.params.id, identificador);
      res.json(capitulo);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPerfilAutorPublico(req: Request, res: Response, next: NextFunction) {
    try {
      const autor = await contenidoService.obtenerPerfilAutorPublico(req.params.nombre);
      res.json(autor);
    } catch (error) {
      next(error);
    }
  }

  async obtenerLibro(req: Request, res: Response, next: NextFunction) {
    try {
      const libro = await contenidoService.obtenerLibro(req.params.id);
      res.json(libro);
    } catch (error) {
      next(error);
    }
  }

  async obtenerLibros(req: Request, res: Response, next: NextFunction) {
    try {
      const libros = await contenidoService.obtenerLibros();
      res.json({ libros });
    } catch (error) {
      next(error);
    }
  }

  async verificarAccesoCapituloNovela(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const data = await contenidoService.usuarioTieneAccesoCapituloNovela(usuarioId, req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async verificarAccesoCapituloComic(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const data = await contenidoService.usuarioTieneAccesoCapituloComic(usuarioId, req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async verificarAccesoLibro(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      const data = await contenidoService.usuarioTieneAccesoLibro(usuarioId, req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async registrarCompraCapituloNovela(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      if (!usuarioId) return res.status(401).json({ error: "No autorizado" });

      const { txHash } = req.body;
      const compra = await contenidoService.registrarCompraCapituloNovela(usuarioId, req.params.id, txHash);
      res.status(201).json(compra);
    } catch (error) {
      next(error);
    }
  }

  async registrarCompraCapituloComic(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      if (!usuarioId) return res.status(401).json({ error: "No autorizado" });

      const { txHash } = req.body;
      const compra = await contenidoService.registrarCompraCapituloComic(usuarioId, req.params.id, txHash);
      res.status(201).json(compra);
    } catch (error) {
      next(error);
    }
  }

  async registrarCompraLibro(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = obtenerUsuarioId(req);
      if (!usuarioId) return res.status(401).json({ error: "No autorizado" });

      const { txHash } = req.body;
      const compra = await contenidoService.registrarCompraLibro(usuarioId, req.params.id, txHash);
      res.status(201).json(compra);
    } catch (error) {
      next(error);
    }
  }

  async darLikeNovela(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contenidoService.darLikeNovela(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async darLikeComic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contenidoService.darLikeComic(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async quitarLikeNovela(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contenidoService.quitarLikeNovela(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async quitarLikeComic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contenidoService.quitarLikeComic(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

}
