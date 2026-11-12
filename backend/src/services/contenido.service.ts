import prisma from "../config/database";
import { AppError } from "../utils/errores";

function sumarHoras(horas: number): Date {
  const fecha = new Date();
  fecha.setHours(fecha.getHours() + horas);
  return fecha;
}

export class ContenidoService {
  async obtenerNovelas(genero?: string, pagina = 1, limite = 10) {
    const where = genero ? { generos: { has: genero } } : {};
    const [novelas, total] = await Promise.all([
      prisma.novela.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        include: { autor: { select: { id: true, nombre: true } } },
        orderBy: { fechaPublicacion: "desc" },
      }),
      prisma.novela.count({ where }),
    ]);
    return { novelas, total, pagina, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerNovela(id: string, identificador: string) {
    const novela = await prisma.novela.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            perfilAutor: {
              select: {
                walletWeb3: true,
                cafecito: true,
                paypal: true,
                kofi: true,
                patreon: true,
                buyMeACoffee: true,
                githubSponsors: true,
                mercadoPago: true,
                twitter: true,
              },
            },
          },
        },
        capitulos: { orderBy: { numero: "asc" } },
      },
    });
    if (!novela) throw new AppError("Novela no encontrada", 404);
    // Incrementar vistas
    try {
      await prisma.vistaNovela.create({
        data: { identificador, novelaId: id }
      });
      await prisma.novela.update({ where: { id }, data: { vistas: { increment: 1 } } });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        console.error(e);
      }
    }
    return novela;
  }

  async obtenerComics(genero?: string, pagina = 1, limite = 10) {
    const where = genero ? { generos: { has: genero } } : {};
    const [comics, total] = await Promise.all([
      prisma.comic.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        include: { autor: { select: { id: true, nombre: true } } },
        orderBy: { fechaPublicacion: "desc" },
      }),
      prisma.comic.count({ where }),
    ]);
    return { comics, total, pagina, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerComic(id: string, identificador: string) {
    const comic = await prisma.comic.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            perfilAutor: {
              select: {
                walletWeb3: true,
                cafecito: true,
                paypal: true,
                kofi: true,
                patreon: true,
                buyMeACoffee: true,
                githubSponsors: true,
                mercadoPago: true,
                twitter: true,
              },
            },
          },
        },
        capitulos: { orderBy: { numero: "asc" } },
      },
    });
    if (!comic) throw new AppError("Comic no encontrado", 404);
    try {
      await prisma.vistaComic.create({
        data: { identificador, comicId: id }
      });
      await prisma.comic.update({ where: { id }, data: { vistas: { increment: 1 } } });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        console.error(e);
      }
    }
    return comic;
  }

  async obtenerCapituloNovela(id: string, identificador: string) {
    const capitulo = await prisma.capituloNovela.findUnique({
      where: { id },
      include: { novela: { select: { titulo: true, id: true, autor: { select: { nombre: true } } } } }
    });
    if (!capitulo) throw new AppError("Capitulo no encontrado", 404);
    try {
      await prisma.vistaCapituloNovela.create({
        data: { identificador, capituloNovelaId: id }
      });
      await prisma.capituloNovela.update({ where: { id }, data: { vistas: { increment: 1 } } });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        console.error(e);
      }
    }
    return capitulo;
  }

  async obtenerCapituloComic(id: string, identificador: string) {
    const capitulo = await prisma.capituloComic.findUnique({
      where: { id },
      include: { comic: { select: { titulo: true, id: true, autor: { select: { nombre: true } } } } }
    });
    if (!capitulo) throw new AppError("Capitulo no encontrado", 404);
    try {
      await prisma.vistaCapituloComic.create({
        data: { identificador, capituloComicId: id }
      });
      await prisma.capituloComic.update({ where: { id }, data: { vistas: { increment: 1 } } });
    } catch (e: any) {
      if (e.code !== 'P2002') {
        console.error(e);
      }
    }
    return capitulo;
  }

  async obtenerPerfilAutorPublico(nombre: string) {
    const autor = await prisma.usuario.findUnique({
      where: { nombre },
      select: {
        id: true,
        nombre: true,
        
        avatar: true,
        creadoEn: true,
        perfilAutor: {
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
        },
        novelas: {
          select: { id: true, titulo: true, sinopsis: true, portada: true, generos: true, fechaPublicacion: true },
          orderBy: { fechaPublicacion: "desc" },
        },
        comics: {
          select: { id: true, titulo: true, sinopsis: true, portada: true, generos: true, fechaPublicacion: true },
          orderBy: { fechaPublicacion: "desc" },
        },
        libros: {
          select: { id: true, titulo: true, sinopsis: true, portada: true, precioUSDT: true, formato: true, creadoEn: true },
          orderBy: { creadoEn: "desc" },
        },
      },
    });

    if (!autor) {
      throw new AppError("Autor no encontrado", 404);
    }

    return autor;
  }

  async obtenerLibro(id: string) {
    const libro = await prisma.libro.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        portada: true,
        precioUSDT: true,
        esPremium: true,
        archivoKey: true,
        formato: true,
        creadoEn: true,
        autor: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
            perfilAutor: {
              select: {
                walletWeb3: true,
                cafecito: true,
                paypal: true,
                kofi: true,
                patreon: true,
                buyMeACoffee: true,
                githubSponsors: true,
                mercadoPago: true,
                twitter: true,
              },
            },
          },
        },
      },
    });

    if (!libro) {
      throw new AppError("Libro no encontrado", 404);
    }

    return libro;
  }

  async obtenerLibros() {
    return prisma.libro.findMany({
      orderBy: { creadoEn: "desc" },
      take: 50,
      select: {
        id: true,
        titulo: true,
        sinopsis: true,
        portada: true,
        precioUSDT: true,
        creadoEn: true,
        formato: true,
        autor: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  async registrarCompraCapituloNovela(usuarioId: string, capituloId: string, txHash: string) {
    const capitulo = await prisma.capituloNovela.findUnique({
      where: { id: capituloId },
      select: { id: true, esPremium: true, precioUSDT: true, duracionHoras: true, novela: { select: { autorId: true } } },
    });

    if (!capitulo) {
      throw new AppError("Capítulo no encontrado", 404);
    }

    if (!capitulo.esPremium) {
      throw new AppError("El capítulo no requiere compra", 400);
    }

    if (!txHash || txHash.trim().length < 10) {
      throw new AppError("txHash inválido", 400);
    }

    const compraExistente = await prisma.compraCapituloNovela.findUnique({
      where: { usuarioId_capituloId: { usuarioId, capituloId } },
    });

    if (compraExistente) {
      return compraExistente;
    }

    const expiraEn = capitulo.duracionHoras ? sumarHoras(capitulo.duracionHoras) : null;

    return prisma.compraCapituloNovela.create({
      data: {
        usuarioId,
        capituloId,
        txHash,
        precioPagado: capitulo.precioUSDT ?? 0,
        expiraEn,
      },
    });
  }

  async registrarCompraCapituloComic(usuarioId: string, capituloId: string, txHash: string) {
    const capitulo = await prisma.capituloComic.findUnique({
      where: { id: capituloId },
      select: { id: true, esPremium: true, precioUSDT: true, duracionHoras: true, comic: { select: { autorId: true } } },
    });

    if (!capitulo) {
      throw new AppError("Capítulo no encontrado", 404);
    }

    if (!capitulo.esPremium) {
      throw new AppError("El capítulo no requiere compra", 400);
    }

    if (!txHash || txHash.trim().length < 10) {
      throw new AppError("txHash inválido", 400);
    }

    const compraExistente = await prisma.compraCapituloComic.findUnique({
      where: { usuarioId_capituloId: { usuarioId, capituloId } },
    });

    if (compraExistente) {
      return compraExistente;
    }

    const expiraEn = capitulo.duracionHoras ? sumarHoras(capitulo.duracionHoras) : null;

    return prisma.compraCapituloComic.create({
      data: {
        usuarioId,
        capituloId,
        txHash,
        precioPagado: capitulo.precioUSDT ?? 0,
        expiraEn,
      },
    });
  }

  async registrarCompraLibro(usuarioId: string, libroId: string, txHash: string) {
    const libro = await prisma.libro.findUnique({
      where: { id: libroId },
      select: { id: true, precioUSDT: true, autorId: true },
    });

    if (!libro) {
      throw new AppError("Libro no encontrado", 404);
    }

    if (!txHash || txHash.trim().length < 10) {
      throw new AppError("txHash inválido", 400);
    }

    const compraExistente = await prisma.compraLibro.findUnique({
      where: { usuarioId_libroId: { usuarioId, libroId } },
    });

    if (compraExistente) {
      return compraExistente;
    }

    return prisma.compraLibro.create({
      data: {
        usuarioId,
        libroId,
        txHash,
        precioPagado: libro.precioUSDT,
        expiraEn: null,
      },
    });
  }

  async usuarioTieneAccesoCapituloNovela(usuarioId: string | null, capituloId: string) {
    const capitulo = await prisma.capituloNovela.findUnique({
      where: { id: capituloId },
      select: { id: true, esPremium: true, duracionHoras: true, novela: { select: { autorId: true } } },
    });

    if (!capitulo) {
      throw new AppError("Capítulo no encontrado", 404);
    }

    if (!capitulo.esPremium) {
      return { tieneAcceso: true };
    }

    if (!usuarioId) {
      return { tieneAcceso: false };
    }

    if (capitulo.novela.autorId === usuarioId) {
      return { tieneAcceso: true };
    }

    const compra = await prisma.compraCapituloNovela.findUnique({
      where: { usuarioId_capituloId: { usuarioId, capituloId } },
    });

    if (!compra) {
      return { tieneAcceso: false };
    }

    if (compra.expiraEn && compra.expiraEn < new Date()) {
      return { tieneAcceso: false };
    }

    return { tieneAcceso: true };
  }

  async usuarioTieneAccesoCapituloComic(usuarioId: string | null, capituloId: string) {
    const capitulo = await prisma.capituloComic.findUnique({
      where: { id: capituloId },
      select: { id: true, esPremium: true, duracionHoras: true, comic: { select: { autorId: true } } },
    });

    if (!capitulo) {
      throw new AppError("Capítulo no encontrado", 404);
    }

    if (!capitulo.esPremium) {
      return { tieneAcceso: true };
    }

    if (!usuarioId) {
      return { tieneAcceso: false };
    }

    if (capitulo.comic.autorId === usuarioId) {
      return { tieneAcceso: true };
    }

    const compra = await prisma.compraCapituloComic.findUnique({
      where: { usuarioId_capituloId: { usuarioId, capituloId } },
    });

    if (!compra) {
      return { tieneAcceso: false };
    }

    if (compra.expiraEn && compra.expiraEn < new Date()) {
      return { tieneAcceso: false };
    }

    return { tieneAcceso: true };
  }

  async usuarioTieneAccesoLibro(usuarioId: string | null, libroId: string) {
    const libro = await prisma.libro.findUnique({
      where: { id: libroId },
      select: { id: true, autorId: true, esPremium: true, archivoKey: true, formato: true, precioUSDT: true },
    });

    if (!libro) {
      throw new AppError("Libro no encontrado", 404);
    }

    if (!libro.esPremium) {
      return { tieneAcceso: true, archivoKey: libro.archivoKey, libro };
    }

    if (!usuarioId) {
      return { tieneAcceso: false, libro };
    }

    if (libro.autorId === usuarioId) {
      return { tieneAcceso: true, archivoKey: libro.archivoKey, libro };
    }

    const compra = await prisma.compraLibro.findUnique({
      where: { usuarioId_libroId: { usuarioId, libroId } },
    });

    return { tieneAcceso: Boolean(compra), archivoKey: compra ? libro.archivoKey : null, libro };
  }

  private async obtenerHomeLibros() {
    const nuevosLibros = await prisma.libro.findMany({
      orderBy: { creadoEn: 'desc' },
      take: 10,
      select: {
        id: true,
        titulo: true,
        portada: true,
        precioUSDT: true,
        creadoEn: true,
        autor: { select: { id: true, nombre: true } },
      },
    });

    return {
      populares: [],
      nuevas: nuevosLibros,
      actualizadas: [],
      vistas: [],
      gustadas: [],
    };
  }

  async obtenerHome(tipo: "novela" | "comic" | "libro") {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    if (tipo === "novela") {
      return this.obtenerHomeNovelas(hace30Dias);
    }
    if (tipo === "comic") {
      return this.obtenerHomeComics(hace30Dias);
    }
    return this.obtenerHomeLibros();
  }

  private selectBasico = {
    id: true,
    titulo: true,
    portada: true,
    vistas: true,
    likes: true,
    generos: true,
    fechaPublicacion: true,
    autor: { select: { id: true, nombre: true } },
  };

  private async obtenerHomeNovelas(hace30Dias: Date) {
    const [populares, nuevas, actualizadas, vistas, gustadas, libros] = await Promise.all([
      prisma.novela.findMany({
        where: { fechaPublicacion: { gte: hace30Dias } },
        select: this.selectBasico,
        orderBy: { vistas: "desc" },
        take: 10,
      }),
      prisma.novela.findMany({
        select: this.selectBasico,
        orderBy: { fechaPublicacion: "desc" },
        take: 10,
      }),
      prisma.capituloNovela.findMany({
        select: { fechaPublicacion: true, novelaId: true },
        orderBy: { fechaPublicacion: "desc" },
        take: 50,
      }).then(async (caps) => {
        const ids = [...new Set(caps.map((c) => c.novelaId))];
        const obras = await prisma.novela.findMany({
          where: { id: { in: ids } },
          select: this.selectBasico,
        });
        return ids.slice(0, 10).map((id) => obras.find((o) => o.id === id)).filter(Boolean);
      }),
      prisma.novela.findMany({
        select: this.selectBasico,
        orderBy: { vistas: "desc" },
        take: 10,
      }),
      prisma.novela.findMany({
        select: this.selectBasico,
        where: { vistas: { gt: 0 } },
        take: 200,
      }).then((obras) => {
        return obras
          .map((o) => ({ ...o, porcentaje: o.vistas > 0 ? o.likes / o.vistas : 0 }))
          .sort((a, b) => b.porcentaje - a.porcentaje)
          .slice(0, 10);
      }),
      prisma.libro.findMany({
        orderBy: { creadoEn: "desc" },
        take: 10,
        select: {
          id: true,
          titulo: true,
          portada: true,
          precioUSDT: true,
          creadoEn: true,
          autor: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    return { populares, nuevas, actualizadas, vistas, gustadas, libros };
  }

  private async obtenerHomeComics(hace30Dias: Date) {
    const [populares, nuevas, actualizadas, vistas, gustadas, libros] = await Promise.all([
      prisma.comic.findMany({
        where: { fechaPublicacion: { gte: hace30Dias } },
        select: this.selectBasico,
        orderBy: { vistas: "desc" },
        take: 10,
      }),
      prisma.comic.findMany({
        select: this.selectBasico,
        orderBy: { fechaPublicacion: "desc" },
        take: 10,
      }),
      prisma.capituloComic.findMany({
        select: { fechaPublicacion: true, comicId: true },
        orderBy: { fechaPublicacion: "desc" },
        take: 50,
      }).then(async (caps) => {
        const ids = [...new Set(caps.map((c) => c.comicId))];
        const obras = await prisma.comic.findMany({
          where: { id: { in: ids } },
          select: this.selectBasico,
        });
        return ids.slice(0, 10).map((id) => obras.find((o) => o.id === id)).filter(Boolean);
      }),
      prisma.comic.findMany({
        select: this.selectBasico,
        orderBy: { vistas: "desc" },
        take: 10,
      }),
      prisma.comic.findMany({
        select: this.selectBasico,
        where: { vistas: { gt: 0 } },
        take: 200,
      }).then((obras) => {
        return obras
          .map((o) => ({ ...o, porcentaje: o.vistas > 0 ? o.likes / o.vistas : 0 }))
          .sort((a, b) => b.porcentaje - a.porcentaje)
          .slice(0, 10);
      }),
      prisma.libro.findMany({
        orderBy: { creadoEn: "desc" },
        take: 10,
        select: {
          id: true,
          titulo: true,
          portada: true,
          precioUSDT: true,
          creadoEn: true,
          autor: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    return { populares, nuevas, actualizadas, vistas, gustadas, libros };
  }

  async darLikeNovela(id: string) {
    return prisma.novela.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true }
    });
  }

  async darLikeComic(id: string) {
    return prisma.comic.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true }
    });
  }

  async quitarLikeNovela(id: string) {
    const novela = await prisma.novela.findUnique({ where: { id }, select: { likes: true } });
    if (!novela) throw new AppError("Novela no encontrada", 404);
    return prisma.novela.update({
      where: { id },
      data: { likes: { decrement: 1 } },
      select: { likes: true }
    });
  }

  async quitarLikeComic(id: string) {
    const comic = await prisma.comic.findUnique({ where: { id }, select: { likes: true } });
    if (!comic) throw new AppError("Comic no encontrado", 404);
    return prisma.comic.update({
      where: { id },
      data: { likes: { decrement: 1 } },
      select: { likes: true }
    });
  }

}
