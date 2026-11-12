"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";

interface Usuario {
  nombre: string;
  rol: string;
  avatarUrl?: string;
  email?: string;
}

function NavbarInner() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const esInicio = pathname === "/inicio";
  const tipoActual = (searchParams.get("tipo") as "novela" | "comic" | "libro") || "novela";

  const cambiarTipo = (nuevoTipo: "novela" | "comic" | "libro") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tipo", nuevoTipo);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Dark mode handling
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ? JSON.parse(saved) : prefersDark;
    setDarkMode(initial);
    if (initial) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // Escuchar cambios en localStorage o carga inicial
  useEffect(() => {
    const revisarUsuario = () => {
      const usuarioGuardado = localStorage.getItem("usuario");
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      } else {
        setUsuario(null);
      }
    };

    revisarUsuario();
    
    // Escuchar el evento "storage" que se dispara si otra pestaña cambia localStorage
    window.addEventListener("storage", revisarUsuario);
    window.addEventListener("auth-change", revisarUsuario);
    return () => {
      window.removeEventListener("storage", revisarUsuario);
      window.removeEventListener("auth-change", revisarUsuario);
    };
  }, []);

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const manejarClicFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  const manejarCierreSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setMenuAbierto(false);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  // Extraemos la inicial del nombre para mostrarla si no hay foto de perfil
  const inicialNombre = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href={usuario ? "/inicio" : "/"} className="flex items-center space-x-2">
          <span className="font-bold text-xl text-primario dark:text-primario-light">Mi Plataforma</span>
        </Link>

        {esInicio && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex">
              <button
                onClick={() => cambiarTipo("novela")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  tipoActual === "novela" ? "bg-primario text-white shadow" : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Novelas
              </button>
              <button
                onClick={() => cambiarTipo("comic")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  tipoActual === "comic" ? "bg-primario text-white shadow" : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Comics
              </button>
              <button
                onClick={() => cambiarTipo("libro")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  tipoActual === "libro" ? "bg-primario text-white shadow" : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Libros
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Link href="/explorador" className="text-gray-700 dark:text-gray-300 hover:text-primario dark:hover:text-primario-light font-medium">
            Explorar
          </Link>
          
          {usuario ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primario text-white font-bold hover:ring-2 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-gray-900 hover:ring-primario transition overflow-hidden focus:outline-none"
              >
                {usuario.avatarUrl ? (
                  <img src={usuario.avatarUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span>{inicialNombre}</span>
                )}
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{usuario.nombre}</p>
                    {usuario.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{usuario.email}</p>}
                  </div>
                  
                  <div className="py-1">
                    {usuario.rol === "autor" && (
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primario dark:hover:text-primario-light"
                        onClick={() => setMenuAbierto(false)}
                      >
                        Dashboard de Autor
                      </Link>
                    )}
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primario dark:hover:text-primario-light"
                      onClick={() => setMenuAbierto(false)}
                    >
                      Perfil
                    </Link>
                    <button 
                      onClick={toggleDarkMode}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {darkMode ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        )}
                      </svg>
                      {darkMode ? "Modo claro" : "Modo noche"}
                    </button>
                    <button 
                      onClick={manejarCierreSesion}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primario dark:hover:text-primario-light font-medium">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-medium">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  );
}