"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { subirObraAction } from "@/app/actions/monetizacion";

export default function SubirObraPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"novela" | "comic" | "libro">("novela");
  const [sinopsis, setSinopsis] = useState("");
  const [precioUSDT, setPrecioUSDT] = useState("");
  const [generosSeleccionados, setGenerosSeleccionados] = useState<string[]>([]);
  const [portada, setPortada] = useState<File | null>(null);
  const [archivoLibro, setArchivoLibro] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  const generosDisponibles = ["Fantasía", "Romance", "Ciencia ficción", "Terror", "Aventura", "Misterio"];

  const toggleGenero = (gen: string) => {
    setGenerosSeleccionados((actual) =>
      actual.includes(gen) ? actual.filter((item) => item !== gen) : [...actual, gen]
    );
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const formData = new FormData();
      formData.append("titulo", titulo.trim());
      formData.append("tipo", tipo);
      formData.append("sinopsis", sinopsis.trim());
      formData.append("generos", JSON.stringify(generosSeleccionados));

      if (portada) {
        formData.append("portada", portada);
      }

      if (tipo === "libro") {
        if (!archivoLibro) {
          showToast({ type: "error", title: "Archivo requerido", message: "Sube un PDF o EPUB para el libro." });
          return;
        }

        formData.append("precioUSDT", precioUSDT);
        formData.append("archivo", archivoLibro);
      }

      const result = await subirObraAction(formData);

      if (result.ok) {
        showToast({ type: "success", title: "¡Obra publicada!", message: "Tu contenido ya está disponible." });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      showToast({
        type: "error",
        title: "Error al publicar",
        message: result.data?.error || result.data?.mensaje || "Error desconocido",
      });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Error de conexión", message: "Inténtalo de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Publicar nueva obra</h1>
        <p className="mt-2 text-sm text-slate-500">Novelas, cómics y libros premium en una sola publicación.</p>

        <form className="mt-8 space-y-6" onSubmit={manejarEnvio}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tipo de obra</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "novela" | "comic" | "libro")}
                className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:ring-slate-400"
              >
                <option value="novela">Novela</option>
                <option value="comic">Cómic</option>
                <option value="libro">Libro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Sinopsis</label>
            <textarea
              rows={5}
              value={sinopsis}
              onChange={(e) => setSinopsis(e.target.value)}
              required
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:ring-slate-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Portada opcional</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPortada(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
              />
            </div>

            {tipo === "libro" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio (USDT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioUSDT}
                  onChange={(e) => setPrecioUSDT(e.target.value)}
                  className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
            ) : null}
          </div>

          {tipo === "libro" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700">Archivo del libro (.pdf, .epub)</label>
              <input
                type="file"
                accept=".pdf,.epub,application/pdf,application/epub+zip"
                onChange={(e) => setArchivoLibro(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Géneros</label>
            <div className="flex flex-wrap gap-2">
              {generosDisponibles.map((gen) => (
                <button
                  key={gen}
                  type="button"
                  onClick={() => toggleGenero(gen)}
                  className={"rounded-full border px-4 py-2 text-sm font-medium transition " + (generosSeleccionados.includes(gen) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600")}
                >
                  {gen}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={cargando} className="w-full sm:w-auto">
            {cargando ? "Publicando..." : "Publicar obra"}
          </Button>
        </form>
      </div>
    </div>
  );
}