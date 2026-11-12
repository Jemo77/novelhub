"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import Web3Paywall from "@/components/monetizacion/Web3Paywall";
import { comprarCapituloNovelaAction } from "@/app/actions/monetizacion";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  esPremium?: boolean;
  precioUSDT?: number | null;
  duracionHoras?: number | null;
  tieneAcceso?: boolean;
}

interface Novela {
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

export default function NovelaPage() {
  const params = useParams();
  const [novela, setNovela] = useState<Novela | null>(null);
  const [cargando, setCargando] = useState(true);
  const [likeado, setLikeado] = useState(false);
  const [guardandoLike, setGuardandoLike] = useState(false);
  const [capituloCompra, setCapituloCompra] = useState<Capitulo | null>(null);

  const cargarNovela = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }
      const res = await fetch(`${apiUrl}/api/contenido/novelas/${params.id}`, { headers });
      if (res.ok) {
        setNovela(await res.json());
      } else {
        console.error("No se pudo cargar la novela");
      }
    } catch (error) {
      console.error("Error de conexión", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      cargarNovela();
      const librosGuardados = JSON.parse(localStorage.getItem("librosLikeados") || "[]");
      const estaLikeado = librosGuardados.some((l: any) => l.id === params.id && l.tipo === "novela");
      setLikeado(estaLikeado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const manejarLike = async () => {
    if (guardandoLike || !novela) return;
    setGuardandoLike(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = "Bearer " + token;

      const method = likeado ? "DELETE" : "POST";
      const res = await fetch(apiUrl + "/api/contenido/novelas/" + params.id + "/like", { method, headers });
      if (res.ok) {
        const data = await res.json();
        setLikeado(!likeado);
        setNovela({ ...novela, likes: data.likes });

        const librosGuardados = JSON.parse(localStorage.getItem("librosLikeados") || "[]");
        if (likeado) {
          const filtrados = librosGuardados.filter((l: any) => !(l.id === novela.id && l.tipo === "novela"));
          localStorage.setItem("librosLikeados", JSON.stringify(filtrados));
        } else {
          if (!librosGuardados.some((l: any) => l.id === novela.id && l.tipo === "novela")) {
            librosGuardados.push({
              id: novela.id,
              titulo: novela.titulo,
              portada: novela.portada,
              tipo: "novela"
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

  if (cargando) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400 font-medium">Cargando novela...</div>;
  if (!novela) return <div className="text-center mt-20 text-red-500 dark:text-red-400 font-medium">No se encontró la novela.</div>;

  const destinoUSDT = novela.autor.perfilAutor?.walletWeb3 || "";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-64 h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
          {novela.portada ? (
             <Image src={novela.portada} alt={novela.titulo} className="w-full h-full object-cover" width={256} height={320} />
          ) : (
             <span className="text-gray-400 dark:text-gray-500">Sin portada</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primario dark:text-primario-light mb-1">{novela.titulo}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">por {novela.autor?.nombre || "Anónimo"}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg inline-flex">
            <span className="flex items-center">👁️ <span className="ml-1">{novela.vistas} vistas</span></span>
            <span className="flex items-center">❤️ <span className="ml-1">{novela.likes} likes</span></span>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Sinopsis</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {novela.sinopsis}
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            {novela.capitulos.length > 0 ? (
               novela.capitulos[0].esPremium && !novela.capitulos[0].tieneAcceso ? (
                 <Button className="shadow-md" onClick={() => setCapituloCompra(novela.capitulos[0])}>Adquirir</Button>
               ) : (
                 <Link href={`/capitulos/${novela.capitulos[0].id}?tipo=novela`}>
                   <Button className="shadow-md">Empezar a leer</Button>
                 </Link>
               )
            ) : (
               <Button disabled className="opacity-50 cursor-not-allowed shadow-sm">Próximamente</Button>
            )}
            <Button
              variant="secundario"
              className={likeado ? "shadow-sm bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800" : "shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"}
              onClick={manejarLike}
              disabled={guardandoLike}
            >
              {likeado ? "❤️ Te gusta" : "🤍 Me gusta"}
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Índice de Capítulos</h2>
        {novela.capitulos.length === 0 ? (
           <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
             El autor aún no ha publicado capítulos.
           </div>
        ) : (
           <ul className="space-y-2">
             {novela.capitulos.map((cap) => {
               const esPremium = Boolean(cap.esPremium);
               const estasComprando = capituloCompra?.id === cap.id;

               if (esPremium && !cap.tieneAcceso) {
                 return (
                   <li key={cap.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex justify-between items-center gap-3">
                     <div className="min-w-0">
                       <p className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                         <Lock size={16} className="text-amber-600" />
                         Capítulo {cap.numero}: {cap.titulo}
                       </p>
                       {cap.precioUSDT ? (
                         <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold mt-1">
                           {Number(cap.precioUSDT).toFixed(2)} USDT · {formatDuracion(cap.duracionHoras)}
                         </p>
                       ) : null}
                     </div>
                     <Button
                       onClick={() => setCapituloCompra({...cap, precioUSDT: cap.precioUSDT, duracionHoras: cap.duracionHoras, esPremium})}
                       className="shrink-0 shadow-sm"
                     >
                       Adquirir
                     </Button>
                   </li>
                 );
               }

               return (
                 <Link key={cap.id} href={`/capitulos/${cap.id}?tipo=novela`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primario hover:text-white cursor-pointer flex justify-between transition-colors border border-gray-100 dark:border-gray-600 hover:border-primario group block">
                   <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-white">
                     Capítulo {cap.numero}: {cap.titulo}
                     {esPremium ? <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-white">{Number(cap.precioUSDT || 0).toFixed(2)} USDT · {formatDuracion(cap.duracionHoras)}</span> : null}
                   </span>
                   <span className="text-gray-400 dark:text-gray-500 group-hover:text-white transition-colors">Leer →</span>
                 </Link>
               );
             })}
           </ul>
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
                const resultado = await comprarCapituloNovelaAction(capituloCompra.id, txHash);
                if ((resultado as any)?.ok) {
                  setCapituloCompra(null);
                  cargarNovela();
                }
                return resultado;
              }}
              donaciones={novela.autor.perfilAutor}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}