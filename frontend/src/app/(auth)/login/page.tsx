"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const validarFormulario = () => {
    if (!email.trim()) {
      showToast({ type: "error", title: "Campo requerido", message: "El correo electrónico es obligatorio" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast({ type: "error", title: "Email inválido", message: "Introduce un correo electrónico válido" });
      return false;
    }
    if (!password) {
      showToast({ type: "error", title: "Campo requerido", message: "La contraseña es obligatoria" });
      return false;
    }
    return true;
  };

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (datos.token) {
          localStorage.setItem("token", datos.token);
          localStorage.setItem("usuario", JSON.stringify(datos.usuario));
          document.cookie = "token=" + datos.token + "; path=/; max-age=604800; samesite=lax";
          window.dispatchEvent(new Event("auth-change"));
        }
        showToast({ type: "success", title: "¡Bienvenido!", message: `Hola, ${datos.usuario.nombre}` });
        router.push("/inicio");
        router.refresh();
      } else {
        showToast({ type: "error", title: "Credenciales incorrectas", message: datos.error || "Verifica tu email y contraseña" });
      }
    } catch {
      showToast({ type: "error", title: "Error de conexión", message: "No se pudo conectar con el servidor. Inténtalo más tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primario dark:text-primario-light mb-4">Iniciar sesión</h2>

      <form className="space-y-4" onSubmit={manejarLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="tu@email.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta? <a href="/registro" className="text-primario hover:underline">Regístrate</a>
      </p>
    </div>
  );
}