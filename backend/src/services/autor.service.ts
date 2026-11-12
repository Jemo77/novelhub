import prisma from "../config/database";
import { AppError } from "../utils/errores";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../config/r2";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

function esDireccionEthereumValida(direccion: string | null): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(direccion || "");
}

export class AutorService {
  async getDashboardStats(autorId: string) {
    const novelas = await prisma.novela.findMany({
      where: { autorId },
      include: {
        _count: {
          select: { capitulos: true }
        }
      }
    });
    const comics = await prisma.comic.findMany({
      where: { autorId },
      include: {
        _count: {
          select: { capitulos: true }
        }
      }
    });
    const libros = await prisma.libro.findMany({
      where: { autorId },
      orderBy: { creadoEn: "desc" },
    });

    const totalVistas = 
      novelas.reduce((acc, curr) => acc + curr.vistas, 0) +
      comics.reduce((acc, curr) => acc + curr.vistas, 0);

    const totalLikes = 
      novelas.reduce((acc, curr) => acc + curr.likes, 0) +
      comics.reduce((acc, curr) => acc + curr.likes, 0);

    // Mapear obras a un formato común
    const obras = [
      ...novelas.map(n => ({ id: n.id, titulo: n.titulo, tipo: "novela", vistas: n.vistas, likes: n.likes, fecha: n.fechaPublicacion, capitulosCount: n._count.capitulos })),
      ...comics.map(c => ({ id: c.id, titulo: c.titulo, tipo: "comic", vistas: c.vistas, likes: c.likes, fecha: c.fechaPublicacion, capitulosCount: c._count.capitulos })),
      ...libros.map(l => ({ id: l.id, titulo: l.titulo, tipo: "libro", vistas: 0, likes: 0, fecha: l.creadoEn, capitulosCount: 0 })),
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return {
      vistasTotales: totalVistas,
      likesTotales: totalLikes,
      seguidores: 0, 
      obras
    };
  }

  async getPerfil(autorId: string) {
    const perfil = await prisma.perfilAutor.findUnique({
      where: { usuarioId: autorId },
      select: {
        biografia: true,
        walletWeb3: true,
        cafecito: true,
        paypal: true,
        kofi: true,
        patreon: true,
        buyMeACoffee: true,
        githubSponsors: true,
        mercadoPago: true,
        twitter: true,
        adIdGeneral: true,
        adIdTop: true,
        adIdBottom: true,
      },
    });

    return perfil || {
      biografia: null,
      walletWeb3: null,
      cafecito: null,
      paypal: null,
      kofi: null,
      patreon: null,
      buyMeACoffee: null,
      githubSponsors: null,
      mercadoPago: null,
      twitter: null,
      adIdGeneral: null,
      adIdTop: null,
      adIdBottom: null,
    };
  }

  async actualizarEnlaces(autorId: string, data: Record<string, unknown>) {
    const campos = [
      "biografia",
      "walletWeb3",
      "cafecito",
      "paypal",
      "kofi",
      "patreon",
      "buyMeACoffee",
      "githubSponsors",
      "mercadoPago",
      "twitter",
      "adIdGeneral",
      "adIdTop",
      "adIdBottom",
    ];

    const updateData: Record<string, string | null> = {};
    for (const campo of campos) {
      if (campo in data) {
        const valor = typeof data[campo] === "string" ? (data[campo] as string).trim() : "";
        updateData[campo] = valor === "" ? null : valor;

        if (campo === "walletWeb3" && updateData[campo] && !esDireccionEthereumValida(updateData[campo])) {
          throw new AppError("La dirección de wallet Web3 no es una dirección Ethereum válida", 400);
        }
      }
    }

    const perfil = await prisma.perfilAutor.upsert({
      where: { usuarioId: autorId },
      update: updateData,
      create: { usuarioId: autorId, ...updateData },
    });

    return perfil;
  }

  async crearObra(autorId: string, tipo: string, titulo: string, sinopsis: string, generos: string[], portadaUrl?: string) {
    if (!titulo || !sinopsis || !tipo) {
      throw new AppError("Faltan campos obligatorios", 400);
    }

    if (tipo === "novela") {
      const novela = await prisma.novela.create({
        data: {
          titulo,
          sinopsis,
          generos,
          portada: portadaUrl || null,
          autorId
        }
      });
      return { ...novela, tipo: "novela" };
    } else if (tipo === "comic") {
      const comic = await prisma.comic.create({
        data: {
          titulo,
          sinopsis,
          generos,
          portada: portadaUrl || null,
          autorId
        }
      });
      return { ...comic, tipo: "comic" };
    } else {
      throw new AppError("Tipo de obra inválido", 400);
    }
  }

  async crearLibro(
    autorId: string,
    titulo: string,
    sinopsis: string,
    precioUSDT: number,
    archivoKey: string,
    formato: string,
    portadaUrl?: string
  ) {
    if (!titulo || !sinopsis || !archivoKey || !formato || !precioUSDT) {
      throw new AppError("Faltan campos obligatorios", 400);
    }

    const formatoNormalizado = formato.toUpperCase();
    if (formatoNormalizado !== "PDF" && formatoNormalizado !== "EPUB") {
      throw new AppError("El formato del libro debe ser PDF o EPUB", 400);
    }

    const libro = await prisma.libro.create({
      data: {
        titulo,
        sinopsis,
        portada: portadaUrl || null,
        autorId,
        precioUSDT,
        archivoKey,
        formato: formatoNormalizado,
      },
    });

    return { ...libro, tipo: "libro" };
  }

  async crearCapituloNovela(
    autorId: string,
    novelaId: string,
    numero: number,
    titulo: string,
    contenido: string,
    opciones?: { esPremium?: boolean; precioUSDT?: number | null; duracionHoras?: number | null }
  ) {
    if (!novelaId || !numero || !titulo || !contenido) {
      throw new AppError("Faltan campos obligatorios", 400);
    }

    if (contenido.length > 50000) {
      throw new AppError("El contenido excede el máximo de 50.000 caracteres permitidos", 400);
    }

    const novela = await prisma.novela.findFirst({
      where: { id: novelaId, autorId }
    });

    if (!novela) {
      throw new AppError("Novela no encontrada o no tienes permisos", 404);
    }

    const capitulo = await prisma.capituloNovela.create({
      data: {
        novelaId,
        numero,
        titulo,
        contenido,
        esPremium: opciones?.esPremium ?? false,
        precioUSDT: opciones?.esPremium ? (opciones.precioUSDT ?? null) : null,
        duracionHoras: opciones?.esPremium ? (opciones.duracionHoras ?? null) : null,
      }
    });

    return capitulo;
  }

  async crearCapituloComic(
    autorId: string,
    comicId: string,
    numero: number,
    titulo: string,
    imagenesUrl: string[],
    opciones?: { esPremium?: boolean; precioUSDT?: number | null; duracionHoras?: number | null }
  ) {
    if (!comicId || !numero || !titulo || !imagenesUrl || imagenesUrl.length === 0) {
      throw new AppError("Faltan campos obligatorios", 400);
    }

    const comic = await prisma.comic.findFirst({
      where: { id: comicId, autorId }
    });

    if (!comic) {
      throw new AppError("Cómic no encontrado o no tienes permisos", 404);
    }

    const capitulo = await prisma.capituloComic.create({
      data: {
        comicId,
        numero,
        titulo,
        imagenes: imagenesUrl,
        esPremium: opciones?.esPremium ?? false,
        precioUSDT: opciones?.esPremium ? (opciones.precioUSDT ?? null) : null,
        duracionHoras: opciones?.esPremium ? (opciones.duracionHoras ?? null) : null,
      }
    });

    return capitulo;
  }

  async obtenerObraParaEditar(autorId: string, obraId: string, tipo: string) {
    if (tipo === "novela") {
      const obra = await prisma.novela.findFirst({
        where: { id: obraId, autorId },
        include: {
          capitulos: {
            orderBy: { numero: "asc" },
            select: { id: true, numero: true, titulo: true, vistas: true, fechaPublicacion: true }
          }
        }
      });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return { ...obra, tipo: "novela" };
    } else if (tipo === "comic") {
      const obra = await prisma.comic.findFirst({
        where: { id: obraId, autorId },
        include: {
          capitulos: {
            orderBy: { numero: "asc" },
            select: { id: true, numero: true, titulo: true, vistas: true, fechaPublicacion: true }
          }
        }
      });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return { ...obra, tipo: "comic" };
    }
    throw new AppError("Tipo inválido", 400);
  }

  async editarObra(autorId: string, obraId: string, tipo: string, titulo?: string, sinopsis?: string, portadaUrl?: string) {
    const updateData: any = {};
    if (titulo) updateData.titulo = titulo;
    if (sinopsis) updateData.sinopsis = sinopsis;
    if (portadaUrl) updateData.portada = portadaUrl;

    if (tipo === "novela") {
      const obra = await prisma.novela.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return prisma.novela.update({ where: { id: obraId }, data: updateData });
    } else if (tipo === "comic") {
      const obra = await prisma.comic.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return prisma.comic.update({ where: { id: obraId }, data: updateData });
    }
    throw new AppError("Tipo inválido", 400);
  }

  async editarCapitulo(autorId: string, obraId: string, tipo: string, capituloId: string, titulo: string) {
    if (tipo === "novela") {
      const obra = await prisma.novela.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return prisma.capituloNovela.update({
        where: { id: capituloId },
        data: { titulo }
      });
    } else if (tipo === "comic") {
      const obra = await prisma.comic.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return prisma.capituloComic.update({
        where: { id: capituloId },
        data: { titulo }
      });
    }
    throw new AppError("Tipo inválido", 400);
  }

  async eliminarCapitulo(autorId: string, obraId: string, tipo: string, capituloId: string) {
    if (tipo === "novela") {
      const obra = await prisma.novela.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }
      return prisma.capituloNovela.delete({ where: { id: capituloId } });
    } else if (tipo === "comic") {
      const obra = await prisma.comic.findFirst({ where: { id: obraId, autorId } });
      if (!obra) { console.log("Obra no encontrada", { obraId, autorId, tipo }); throw new AppError("Obra no encontrada", 404); }

      const capitulo = await prisma.capituloComic.findFirst({ where: { id: capituloId, comicId: obraId } });
      if (!capitulo) throw new AppError("Capítulo no encontrado", 404);

      const deletedCapitulo = await prisma.capituloComic.delete({ where: { id: capituloId } });

      if (capitulo.imagenes && capitulo.imagenes.length > 0) {
        const objectsToDelete = capitulo.imagenes.map((url) => {
          const key = url.replace(R2_PUBLIC_URL + "/", "");
          return { Key: key };
        });

        try {
          await r2Client.send(
            new DeleteObjectsCommand({
              Bucket: R2_BUCKET_NAME,
              Delete: {
                Objects: objectsToDelete,
                Quiet: true,
              },
            })
          );
          console.log("Imágenes del capítulo " + capituloId + " eliminadas de R2 exitosamente.");
        } catch (error) {
          console.error("Error eliminando imágenes de R2:", error);
        }
      }

      return deletedCapitulo;
    }
    throw new AppError("Tipo inválido", 400);
  }
}
