"use client";

import { useBloqueoContextMenu } from "./useBloqueoContextMenu";

interface ComicReaderProps {
  titulo: string;
  imagenes: string[];
}

export default function ComicReader({ titulo, imagenes }: ComicReaderProps) {
  const bloqueo = useBloqueoContextMenu();

  return (
    <section className="select-none">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Lectura protegida de {titulo}
      </div>
      <div className="space-y-5">
        {imagenes.map((imagen, index) => (
          <div key={imagen + index} className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
            <img
              src={imagen}
              alt={"Página " + (index + 1)}
              className="block w-full select-none"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onContextMenu={bloqueo.onContextMenu}
            />
            <div className="absolute inset-0 bg-transparent" onContextMenu={bloqueo.onContextMenu} />
          </div>
        ))}
      </div>
    </section>
  );
}
