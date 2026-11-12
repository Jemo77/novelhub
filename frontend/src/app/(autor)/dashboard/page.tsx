"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/authFetch";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Obra {
  id: string;
  titulo: string;
  tipo: string;
  vistas: number;
  likes: number;
  fecha: string;
  capitulosCount: number;
}

interface DashboardStats {
  vistasTotales: number;
  likesTotales: number;
  seguidores: number;
  obras: Obra[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await authFetch(`${apiUrl}/api/autor/dashboard`);

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          console.error("Error al cargar stats:", await res.json());
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarStats();
  }, []);

  if (cargando) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-gray-500 dark:text-gray-400 mt-20">Cargando dashboard...</div>;
  }

  // Si no hay datos por alguna razón, usamos 0
  const vistas = stats?.vistasTotales || 0;
  const likes = stats?.likesTotales || 0;
  const seguidores = stats?.seguidores || 0;
  const obras = stats?.obras || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-primario dark:text-primario-light mb-6">Dashboard de Autor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Vistas totales</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{vistas.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Likes</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{likes.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Seguidores</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{seguidores.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Mis obras</h2>
        <div className="flex gap-3">
          <Link href="/enlaces">
            <Button variant="secundario" className="shadow-md">
              Editar enlaces
            </Button>
          </Link>
          <Link href="/subir-obra">
            <Button variant="primario" className="shadow-md">
              + Subir nueva obra
            </Button>
          </Link>
        </div>
      </div>

      {obras.length === 0 ? (
        <div className="text-center p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
          <p className="mb-4">Aún no tienes obras publicadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <div key={obra.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg hover:border-primario transition bg-white dark:bg-gray-800 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg truncate mb-2 text-gray-800 dark:text-gray-100" title={obra.titulo}>{obra.titulo}</h3>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{obra.tipo}</span>
                  <span>{obra.tipo === "libro" ? "Archivo privado" : obra.capitulosCount + " capítulos"}</span>
                </div>
                <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400 border-t pt-3 mt-2 border-gray-100 dark:border-gray-700">
                  <span className="flex items-center">👁️ {obra.vistas}</span>
                  <span className="flex items-center">❤️ {obra.likes}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col space-y-2">
                {obra.tipo === "libro" ? (
                  <Link href={'/libros/' + obra.id}>
                    <Button variant="secundario" className="w-full text-sm">
                      Ver libro
                    </Button>
                  </Link>
                ) : (
                  <Link href={'/obras/' + obra.id + '/subir-capitulo?tipo=' + obra.tipo}>
                    <Button variant="secundario" className="w-full text-sm">
                      Subir Capítulo
                    </Button>
                  </Link>
                )}
                {obra.tipo !== "libro" ? (
                  <Link href={'/obras/' + obra.id + '/editar?tipo=' + obra.tipo}>
                    <Button className="w-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                      Editar Obra
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}