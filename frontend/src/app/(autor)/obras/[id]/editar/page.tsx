"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/authFetch";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  vistas: number;
  fechaPublicacion: string;
}

interface Obra {
  id: string;
  titulo: string;
  sinopsis: string;
  portada?: string;
  tipo: string;
  capitulos: Capitulo[];
}

export default function EditarObraPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const tipo = searchParams.get("tipo");
  const { showToast } = useToast();

  const [obra, setObra] = useState<Obra | null>(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados de edicion
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [portada, setPortada] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estados de capitulo
  const [editandoCapitulo, setEditandoCapitulo] = useState<string | null>(null);
  const [nuevoTituloCap, setNuevoTituloCap] = useState("");

  useEffect(() => {
    const cargarObra = async () => {
      try {
        if (!tipo) return;
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autor/obras/${id}/editar?tipo=${tipo}`);

        if (res.ok) {
          const data = await res.json();
          setObra(data);
          setTitulo(data.titulo);
          setSinopsis(data.sinopsis);
        } else {
          console.error("Error al cargar obra");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarObra();
  }, [id, tipo]);

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const formData = new FormData();
      formData.append("tipo", tipo!);
      formData.append("titulo", titulo);
      formData.append("sinopsis", sinopsis);
      if (portada) formData.append("portada", portada);

      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autor/obras/${id}`, {
        method: "PATCH",
        body: formData
      });

      if (res.ok) {
        showToast({ type: "success", title: "Éxito", message: "Obra actualizada con éxito" });
        router.refresh();
      } else {
        showToast({ type: "error", title: "Error", message: "Error al actualizar la obra" });
      }
    } catch (error) {
      console.error(error);
      showToast({ type: "error", title: "Error", message: "Error al conectar con el servidor" });
    } finally {
      setGuardando(false);
    }
  };

  const guardarCapitulo = async (capId: string) => {
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autor/obras/${id}/capitulos/${capId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, titulo: nuevoTituloCap })
      });

      if (res.ok) {
        setObra(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            capitulos: prev.capitulos.map(c => c.id === capId ? { ...c, titulo: nuevoTituloCap } : c)
          };
        });
        setEditandoCapitulo(null);
      } else {
        showToast({ type: "error", title: "Error", message: "Error al actualizar el capítulo" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarCapitulo = async (capId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este capítulo? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autor/obras/${id}/capitulos/${capId}?tipo=${tipo}`, 
        { method: "DELETE" });

      if (res.ok) {
        setObra(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            capitulos: prev.capitulos.filter(c => c.id !== capId)
          };
        });
        showToast({ type: "success", title: "Éxito", message: "Capítulo eliminado" });
      } else {
        showToast({ type: "error", title: "Error", message: "Error al eliminar el capítulo" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (cargando) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Cargando...</div>;
  if (!obra) return <div className="text-center p-10 text-red-500 dark:text-red-400">Obra no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primario dark:text-primario-light">Editar Obra</h1>
        <Button onClick={() => router.push("/dashboard")} variant="secundario">Volver al Dashboard</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">Información Principal</h2>
        <form onSubmit={guardarCambios} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Título</label>
            <input 
              type="text" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white focus:outline-primario focus:border-primario"
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Sinopsis</label>
            <textarea 
              value={sinopsis} 
              onChange={(e) => setSinopsis(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded h-32 bg-white dark:bg-gray-700 dark:text-white focus:outline-primario focus:border-primario"
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Nueva Portada (Opcional, será redimensionada a 250x300)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPortada(e.target.files?.[0] || null)} 
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700"
            />
          </div>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar Cambios de Obra"}
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">Gestión de Capítulos</h2>
        {obra.capitulos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay capítulos publicados aún.</p>
        ) : (
          <div className="space-y-3">
            {obra.capitulos.map(cap => (
              <div key={cap.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-1 mb-2 sm:mb-0">
                  {editandoCapitulo === cap.id ? (
                    <input 
                      type="text" 
                      value={nuevoTituloCap} 
                      onChange={(e) => setNuevoTituloCap(e.target.value)}
                      className="w-full sm:w-3/4 border border-gray-300 dark:border-gray-600 p-1 rounded bg-white dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 mr-2">Capítulo {cap.numero}:</span> 
                      <span className="text-gray-800 dark:text-gray-100">{cap.titulo}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vistas: {cap.vistas} | Fecha: {new Date(cap.fechaPublicacion).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {editandoCapitulo === cap.id ? (
                    <>
                      <button onClick={() => guardarCapitulo(cap.id)} className="text-green-600 dark:text-green-400 font-semibold px-2 py-1 text-sm bg-green-100 dark:bg-green-900/20 rounded hover:bg-green-200 dark:hover:bg-green-900/30">Guardar</button>
                      <button onClick={() => setEditandoCapitulo(null)} className="text-gray-600 dark:text-gray-400 font-semibold px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditandoCapitulo(cap.id); setNuevoTituloCap(cap.titulo); }} className="text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30">Editar Título</button>
                      <button onClick={() => eliminarCapitulo(cap.id)} className="text-red-600 dark:text-red-400 font-semibold px-2 py-1 text-sm bg-red-100 dark:bg-red-900/20 rounded hover:bg-red-200 dark:hover:bg-red-900/30">Eliminar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}