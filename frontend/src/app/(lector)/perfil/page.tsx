"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

interface Usuario {
  nombre: string;
  email?: string;
  avatarUrl?: string;
}

interface LibroLikeado {
  id: string;
  titulo: string;
  portada?: string;
  tipo: 'novela' | 'comic';
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [librosLikeados, setLibrosLikeados] = useState<LibroLikeado[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    // Obtener usuario del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }

    // Obtener libros likeados del localStorage (simulado por ahora)
    const libros = localStorage.getItem('librosLikeados');
    if (libros) {
      setLibrosLikeados(JSON.parse(libros));
    }
  }, []);

  if (!usuario) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Debes iniciar sesión para ver tu perfil.</p>
        <Link href="/login" className="mt-4 inline-block bg-primario text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-primario text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
          {usuario.avatarUrl ? (
            <Image src={usuario.avatarUrl} alt={usuario.nombre} className="w-full h-full object-cover" width={80} height={80} />
          ) : (
            usuario.nombre.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{usuario.nombre}</h1>
          {usuario.email && <p className="text-gray-600 dark:text-gray-400">{usuario.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-primario dark:text-primario-light">Mi Estante (Me gusta)</h2>
          {librosLikeados.length > 0 ? (
            <div className="space-y-4">
              {librosLikeados.map((libro) => (
                <Link href={`/${libro.tipo}s/${libro.id}`} key={libro.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                  <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                    {libro.portada ? (
                      <Image src={libro.portada} alt={libro.titulo} className="w-full h-full object-cover" width={48} height={64} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">Sin foto</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{libro.titulo}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{libro.tipo}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">Aún no tienes libros en tu estante.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Explora novelas y dales 'Me gusta' para que aparezcan aquí.</p>
              <Link href="/explorador" className="mt-4 inline-block text-primario hover:underline font-medium">
                Ir al Explorador
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}