"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

interface Obra {
  id: string;
  titulo: string;
  portada?: string;
  vistas?: number;
  likes?: number;
  generos?: string[];
  fechaPublicacion?: string;
  creadoEn?: string;
  autor: { id: string; nombre: string };
  precioUSDT?: number;
}

interface HomeData {
  populares: Obra[];
  nuevas: Obra[];
  actualizadas: Obra[];
  vistas: Obra[];
  gustadas: Obra[];
}

function Carousel({ titulo, obras, tipo }: { titulo: string; obras: Obra[]; tipo: "novela" | "comic" | "libro" }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!obras || obras.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{titulo}</h2>
        <div className="flex space-x-2">
          <button onClick={() => scroll("left")} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={() => scroll("right")} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
        {obras.map((obra) => (
          <Link
            key={obra.id}
            href={tipo === "libro" ? `/libros/${obra.id}` : `/${tipo === "novela" ? "novelas" : "comics"}/${obra.id}`}
            className="flex-shrink-0 w-40 group"
          >
            <div className="w-40 h-56 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition">
              {obra.portada ? (
                <Image
                  src={obra.portada}
                  alt={obra.titulo}
                  width={160}
                  height={224}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin portada</div>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-primario dark:group-hover:text-primario-light transition" title={obra.titulo}>
              {obra.titulo}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{obra.autor.nombre}</p>
            {tipo === "libro" && typeof obra.precioUSDT === "number" ? (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{obra.precioUSDT.toFixed(2)} USDT</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

function InicioContent() {
  const searchParams = useSearchParams();
  const tipo = (searchParams.get("tipo") as "novela" | "comic" | "libro") || "novela";
  const [data, setData] = useState<HomeData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    api.get(`/api/contenido/home?tipo=${tipo}`)
      .then((res) => { setData(res.data); setCargando(false); })
      .catch(() => setCargando(false));
  }, [tipo]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {cargando ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Cargando...</div>
      ) : data ? (
        <>
          <Carousel titulo="🔥 Más popular del mes" obras={data.populares} tipo={tipo} />
          <Carousel titulo="🆕 Nuevas" obras={data.nuevas} tipo={tipo} />
          <Carousel titulo="⏱️ Últimas actualizadas" obras={data.actualizadas} tipo={tipo} />
          <Carousel titulo="👁️ Más vistas" obras={data.vistas} tipo={tipo} />
          <Carousel titulo="❤️ Más gustadas" obras={data.gustadas} tipo={tipo} />
        </>
      ) : (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">No se pudo cargar el contenido.</div>
      )}
    </div>
  );
}

export default function InicioPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 dark:text-gray-400">Cargando...</div>}>
      <InicioContent />
    </Suspense>
  );
}