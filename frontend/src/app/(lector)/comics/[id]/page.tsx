"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Lock } from "lucide-react";
import Web3Paywall from "@/components/monetizacion/Web3Paywall";
import { comprarCapituloComicAction } from "@/app/actions/monetizacion";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  imagenes: string[];
  esPremium?: boolean;
  precioUSDT?: number | null;
  duracionHoras?: number | null;
  tieneAcceso?: boolean;
}

interface Comic {
  id: string;
  titulo: string;
  sinopsis: string;
  portada?: string;
  autor: {
    id: string;
    nombre: string;
    perfilAutor?: {
      walletWeb3?: string | null;
      cafecito?: string | null;
      paypal?: string | null;
      kofi?: string | null;
      patreon?: string | null;
      buyMeACoffee?: string | null;
      githubSponsors?: string | null;
      mercadoPago?: string | null;
      twitter?: string | null;
    } | null;
  };
  capitulos: Capitulo[];
  vistas: number;
  likes: number;
}

function formatDuracion(duracionHoras?: number | null): string {
  if (!duracionHoras) return "Acceso permanente";
  if (duracionHoras % 24 === 0) {
    const dias = duracionHoras / 24;
    return `Acceso por ${dias} ${dias === 1 ? "día" : "días"}`;
  }
  return `Acceso por ${duracionHoras} horas`;
}

export default function ComicPage() {
  const params = useParams();
  const [comic, setComic] = useState<Comic | null>(null);
  const [cargando, setCargando] = useState(true);
  const [likeado, setLikeado] = useState(false);
  const [guardandoLike, setGuardandoLike] = useState(false);
  const [capituloCompra, setCapituloCompra] = useState<Capitulo | null>(null);

  const cargarComic = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }
      const res = await fetch(`${apiUrl}/api/contenido/comics/${params.id}`, { headers });
      if (res.ok) {
        setComic(await res.json());
      } else {
        console.error("No se pudo cargar el cómic");
      }
    } catch (error) {
      console.error("Error de conexión", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      cargarComic();
      const librosGuardados = JSON.parse(localStorage.getItem("librosLikeados") || "[]");
      const estaLikeado = librosGuardados.some((l: any) => l.id === params.id && l.tipo === "comic");
      setLikeado(estaLikeado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const manejarLike = async () => {
    if (guardandoLike || !comic) return;
    setGuardandoLike(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = "Bearer " + token;

      const method = likeado ? "DELETE" : "POST";
      const res = await fetch(apiUrl + "/api/contenido/comics/" + params.id + "/like", { method, headers });
      if (res.ok) {
        const data = await res.json();
        setLikeado(!likeado);
        setComic({ ...comic, likes: data.likes });

        const librosGuardados = JSON.parse(localStorage.getItem("librosLikeados") || "[]");
        if (likeado) {
          const filtrados = librosGuardados.filter((l: any) => !(l.id === comic.id && l.tipo === "comic"));
          localStorage.setItem("librosLikeados", JSON.stringify(filtrados));
        } else {
          if (!librosGuardados.some((l: any) => l.id === comic.id && l.tipo === "comic")) {
            librosGuardados.push({
              id: comic.id,
              titulo: comic.titulo,
              portada: comic.portada,
              tipo: "comic"
            });
          }
          localStorage.setItem("librosLikeados", JSON.stringify(librosGuardados));
        }
      }
    } catch (error) {
      console.error("Error al manejar like", error);
    } finally {
      setGuardandoLike(false);
    }
  };

  if (cargando) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400 font-medium">Cargando cómic...</div>;
  if (!comic) return <div className="text-center mt-20 text-red-500 font-medium">No se encontró el cómic.</div>;

  const destinoUSDT = comic.autor.perfilAutor?.walletWeb3 || "";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-64 h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-600">
          {comic.portada ? (
             <img src={comic.portada} alt={comic.titulo} className="w-full h-full object-cover" />
          ) : (
             <span className="text-gray-400 dark:text-gray-500">Sin portada</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primario dark:text-primario-light mb-1">{comic.titulo}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">por {comic.autor?.nombre || "Anónimo"}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg inline-flex">
            <span className="flex items-center">👁️ <span className="ml-1">{comic.vistas} vistas</span></span>
            <span className="flex items-center">❤️ <span className="ml-1">{comic.likes} likes</span></span>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Sinopsis</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {comic.sinopsis}
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            {comic.capitulos.length > 0 ? (
               comic.capitulos[0].esPremium && !comic.capitulos[0].tieneAcceso ? (
                 <Button className="shadow-md" onClick={() => setCapituloCompra(comic.capitulos[0])}>Adquirir</Button>
               ) : (
                 <Link href={`/capitulos/${comic.capitulos[0].id}?tipo=comic`}>
                   <Button className="shadow-md">Leer ahora</Button>
                 </Link>
               )
            ) : (
               <Button disabled className="opacity-50 cursor-not-allowed shadow-sm">Próximamente</Button>
            )}
            <Button
              variant="secundario"
              className={likeado ? "shadow-sm bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900" : "shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"}
              onClick={manejarLike}
              disabled={guardandoLike}
            >
              {likeado ? "❤️ Te gusta" : "🤍 Me gusta"}
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Capítulos / Volúmenes</h2>
        {comic.capitulos.length === 0 ? (
           <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
             El artista aún no ha subido capítulos.
           </div>
        ) : (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {comic.capitulos.map((cap) => {
               const esPremium = Boolean(cap.esPremium);

               if (esPremium && !cap.tieneAcceso) {
                 return (
                   <div key={cap.id} className="block bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 group text-center">
                     <div className="w-full aspect-square bg-gray-200 dark:bg-gray-600 rounded mb-3 flex items-center justify-center overflow-hidden border border-amber-200 dark:border-amber-800">
                       {cap.imagenes && cap.imagenes.length > 0 ? (
                         <img src={cap.imagenes[0]} alt={`Portada Cap ${cap.numero}`} className="w-full h-full object-cover" />
                       ) : (
                         <Lock size={28} className="text-amber-600" />
                       )}
                     </div>
                     <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" title={cap.titulo}>
                       {cap.titulo || `Capítulo ${cap.numero}`}
                     </p>
                     {cap.precioUSDT ? (
                       <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                         {Number(cap.precioUSDT).toFixed(2)} USDT
                       </p>
                     ) : null}
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDuracion(cap.duracionHoras)}</p>
                     <Button
                       onClick={() => setCapituloCompra({...cap, esPremium, precioUSDT: cap.precioUSDT, duracionHoras: cap.duracionHoras})}
                       className="mt-3 w-full shadow-sm"
                     >
                       Adquirir
                     </Button>
                   </div>
                 );
               }

               return (
                 <Link key={cap.id} href={`/capitulos/${cap.id}?tipo=comic`} className="block bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primario transition-all group text-center">
                   <div className="w-full aspect-square bg-gray-200 dark:bg-gray-600 rounded mb-3 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 group-hover:border-primario transition-colors">
                     {cap.imagenes && cap.imagenes.length > 0 ? (
                       <img src={cap.imagenes[0]} alt={`Portada Cap ${cap.numero}`} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-gray-400 dark:text-gray-500 text-sm">Capítulo {cap.numero}</span>
                     )}
                   </div>
                   <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" title={cap.titulo}>
                     {cap.titulo || `Capítulo ${cap.numero}`}
                   </p>
                   {esPremium ? (
                     <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                       {Number(cap.precioUSDT || 0).toFixed(2)} USDT · {formatDuracion(cap.duracionHoras)}
                     </p>
                   ) : null}
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Leer</p>
                 </Link>
               );
             })}
           </div>
        )}
      </section>

      {capituloCompra ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setCapituloCompra(null)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg">
            <button
              onClick={() => setCapituloCompra(null)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-700"
              aria-label="Cerrar"
            >
              ×
            </button>
            <Web3Paywall
              titulo={"Capítulo " + capituloCompra.numero + ": " + capituloCompra.titulo}
              descripcion={"Este capítulo es premium. Adquiere acceso temporal en USDT."}
              precioUSDT={Number(capituloCompra.precioUSDT || 0)}
              tokenAddress={process.env.NEXT_PUBLIC_USDT_ADDRESS || ""}
              destino={destinoUSDT}
              onPagoExitoso={async (txHash: string) => {
                const resultado = await comprarCapituloComicAction(capituloCompra.id, txHash);
                if ((resultado as any)?.ok) {
                  setCapituloCompra(null);
                  cargarComic();
                }
                return resultado;
              }}
              donaciones={comic.autor.perfilAutor}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}