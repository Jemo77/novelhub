"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// Definimos la interfaz de lo que esperamos recibir
interface Obra {
  id: string;
  titulo: string;
  descripcion: string | null;
  portada: string | null;
  autor: { nombre: string };
  tipo: "novela" | "comic"; // Para saber qué es
}

export default function ExploradorPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [filtro, setFiltro] = useState<"Todos" | "Novelas" | "Cómics" | "Fantasía" | "Romance">("Todos");
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const cargarObras = async () => {
      setCargando(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // Hacemos ambas peticiones
        const resNovelas = await fetch(`${apiUrl}/api/contenido/novelas`);
        const resComics = await fetch(`${apiUrl}/api/contenido/comics`);

        let novelas = [];
        let comics = [];

        if (resNovelas.ok) {
          const data = await resNovelas.json();
          novelas = data.novelas || []; // Extraemos el array "novelas" del objeto
        }
        if (resComics.ok) {
          const data = await resComics.json();
          comics = data.comics || []; // Extraemos el array "comics" del objeto
        }

        // Les agregamos el "tipo" para diferenciarlas en el frontend si hace falta
        const novelasMapeadas = novelas.map((n: any) => ({ ...n, tipo: "novela" }));
        const comicsMapeados = comics.map((c: any) => ({ ...c, tipo: "comic" }));

        // Juntamos todas las obras
        setObras([...novelasMapeadas, ...comicsMapeados]);
      } catch (error) {
        console.error("Error cargando obras:", error);
        showToast({ type: "error", title: "Error", message: "No se pudieron cargar las obras" });
      } finally {
        setCargando(false);
      }
    };

    cargarObras();
  }, [showToast]);

  // Función para filtrar las obras
  const obrasFiltradas = obras.filter((obra) => {
    if (filtro === "Todos") return true;
    if (filtro === "Novelas") return obra.tipo === "novela";
    if (filtro === "Cómics") return obra.tipo === "comic";
    
    // Por ahora, si no tenemos género explícito en la DB, solo simulamos Fantasía/Romance 
    // pero si tuvieras `obra.genero`, podrías hacer `return obra.genero === "Fantasia"`
    return true; 
  }).filter((obra) => {
    if (!busqueda.trim()) return true;
    return obra.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
           obra.autor?.nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-primario dark:text-primario-light mb-6">Explorar obras</h1>
      
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar novelas o cómics..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-grow rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-primario dark:focus:border-primario-light focus:ring-primario dark:text-white text-gray-900"
        />
        <Button className="bg-primario text-white">Buscar</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["Todos", "Novelas", "Cómics", "Fantasía", "Romance"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFiltro(tag as any)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filtro === tag 
                ? "bg-primario text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Cargando obras...</p>
      ) : obrasFiltradas.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No hay obras disponibles con este filtro.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {obrasFiltradas.map((obra) => (
            <Link 
              href={`/${obra.tipo === "novela" ? "novelas" : "comics"}/${obra.id}`} 
              key={obra.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition block border border-gray-100 dark:border-gray-700"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
                  <span className="text-gray-400 dark:text-gray-500">Sin portada</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-primario dark:group-hover:text-primario-light transition" title={obra.titulo}>
                  {obra.titulo}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Autor: {obra.autor?.nombre || "Anónimo"}
                </p>
                <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 mt-2">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize text-xs">
                    {obra.tipo}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}