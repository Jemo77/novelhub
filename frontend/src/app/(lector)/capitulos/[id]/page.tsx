import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import AdIframe from "@/components/monetizacion/AdIframe";
import Web3Paywall from "@/components/monetizacion/Web3Paywall";
import ComicReader from "@/components/contenido/ComicReader";
import { comprarCapituloComicAction, comprarCapituloNovelaAction } from "@/app/actions/monetizacion";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/server-auth";

interface CapituloNovelaDetalle {
  id: string;
  numero: number;
  titulo: string;
  contenido: string;
  esPremium: boolean;
  precioUSDT?: number | null;
  duracionHoras?: number | null;
  novela: {
    id: string;
    titulo: string;
    autor: {
      nombre: string;
    };
  };
}

interface CapituloComicDetalle {
  id: string;
  numero: number;
  titulo: string;
  imagenes: string[];
  esPremium: boolean;
  precioUSDT?: number | null;
  duracionHoras?: number | null;
  comic: {
    id: string;
    titulo: string;
    autor: {
      nombre: string;
    };
  };
}

interface PerfilAutorPublico {
  perfilAutor?: {
    walletWeb3?: string | null;
    adIdTop?: string | null;
    adIdBottom?: string | null;
    cafecito?: string | null;
    paypal?: string | null;
    kofi?: string | null;
    patreon?: string | null;
    buyMeACoffee?: string | null;
    githubSponsors?: string | null;
    mercadoPago?: string | null;
    twitter?: string | null;
  } | null;
}

export default async function CapituloPage({ params, searchParams }: { params: { id: string }; searchParams?: { tipo?: string } }) {
  const tipo = searchParams?.tipo === "comic" ? "comic" : "novela";
  const apiUrl = getApiBaseUrl();
  const headers = getAuthHeaders();

  const contentResponse = await fetch(
    apiUrl + (tipo === "comic" ? "/api/contenido/capitulos-comic/" : "/api/contenido/capitulos-novela/") + params.id,
    { headers, cache: "no-store" }
  );

  if (contentResponse.status === 404) {
    notFound();
  }

  if (!contentResponse.ok) {
    throw new Error("No se pudo cargar el capítulo");
  }

  const capitulo = tipo === "comic"
    ? (await contentResponse.json()) as CapituloComicDetalle
    : (await contentResponse.json()) as CapituloNovelaDetalle;

  const detalleComic = tipo === "comic" ? (capitulo as CapituloComicDetalle) : null;
  const detalleNovela = tipo === "novela" ? (capitulo as CapituloNovelaDetalle) : null;

  const accesoResponse = await fetch(apiUrl + (tipo === "comic" ? "/api/contenido/capitulos-comic/" : "/api/contenido/capitulos-novela/") + params.id + "/acceso", {
    headers,
    cache: "no-store",
  });

  const acceso = accesoResponse.ok ? await accesoResponse.json() : { tieneAcceso: false };
  const autorNombre = detalleComic ? detalleComic.comic.autor.nombre : detalleNovela!.novela.autor.nombre;
  const perfilResponse = await fetch(apiUrl + "/api/contenido/autores/" + autorNombre, {
    cache: "no-store",
  });

  const autor = perfilResponse.ok ? (await perfilResponse.json()) as PerfilAutorPublico : { perfilAutor: null };
  const adIdTop = autor.perfilAutor?.adIdTop;
  const adIdBottom = autor.perfilAutor?.adIdBottom;
  const destinoUSDT = autor.perfilAutor?.walletWeb3 || "";

  if (!acceso.tieneAcceso) {
    const accionCompra = tipo === "comic"
      ? comprarCapituloComicAction.bind(null, capitulo.id)
      : comprarCapituloNovelaAction.bind(null, capitulo.id);

    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contenido bloqueado</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{detalleComic ? detalleComic.comic.titulo : detalleNovela!.novela.titulo}</h1>
            <p className="mt-3 text-slate-600">Capítulo {capitulo.numero}: {capitulo.titulo}</p>
          </div>

          <Web3Paywall
            titulo={capitulo.titulo}
            descripcion={"Este capítulo requiere compra en USDT antes de mostrar el contenido."}
            precioUSDT={Number(capitulo.precioUSDT || 0)}
            tokenAddress={process.env.NEXT_PUBLIC_USDT_ADDRESS || ""}
            destino={destinoUSDT}
            onPagoExitoso={accionCompra}
            donaciones={autor.perfilAutor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lectura segura</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {detalleComic ? detalleComic.comic.titulo : detalleNovela!.novela.titulo}
          </h1>
          <p className="mt-2 text-slate-600">Capítulo {capitulo.numero}: {capitulo.titulo}</p>
        </div>
        <Link href={detalleComic ? "/comics/" + detalleComic.comic.id : "/novelas/" + detalleNovela!.novela.id}>
          <Button variant="secundario">Volver</Button>
        </Link>
      </div>

      {adIdTop ? <AdIframe adId={adIdTop} className="mb-6" /> : null}

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        {tipo === "comic" ? (
          <ComicReader titulo={capitulo.titulo} imagenes={(capitulo as CapituloComicDetalle).imagenes} />
        ) : (
          <div className="prose prose-slate max-w-none select-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: (capitulo as CapituloNovelaDetalle).contenido }} />
          </div>
        )}
      </article>

      {adIdBottom ? <AdIframe adId={adIdBottom} className="mt-6" /> : null}
    </div>
  );
}
