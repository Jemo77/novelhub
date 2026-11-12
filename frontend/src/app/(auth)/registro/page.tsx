"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const cumpleLongitud = password.length >= 12;
  const cumpleMayuscula = /[A-Z]/.test(password);
  const cumpleMinuscula = /[a-z]/.test(password);
  const cumpleNumero = /[0-9]/.test(password);
  const cumpleEspecial = /[$#@!%*?&.]/.test(password);
  const noTieneSecuencias = password.length > 0 && !/(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/.test(password);

  const passwordValida = cumpleLongitud && cumpleMayuscula && cumpleMinuscula && cumpleNumero && cumpleEspecial && noTieneSecuencias;

  const validarFormulario = () => {
    if (!nombre.trim()) {
      showToast({ type: "error", title: "Campo requerido", message: "El nombre de usuario es obligatorio" });
      return false;
    }
    if (!email.trim()) {
      showToast({ type: "error", title: "Campo requerido", message: "El correo electrónico es obligatorio" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast({ type: "error", title: "Email inválido", message: "Introduce un correo electrónico válido" });
      return false;
    }
    if (!passwordValida) {
      showToast({ type: "error", title: "Contraseña insegura", message: "La contraseña no cumple con todos los requisitos de seguridad" });
      return false;
    }
    if (password !== confirmarPassword) {
      showToast({ type: "error", title: "Contraseñas no coinciden", message: "Las contraseñas no coinciden. Por favor, verifícalas." });
      return false;
    }
    return true;
  };

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setIsLoading(true);

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          email: email.toLowerCase().trim(), 
          password 
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        showToast({ type: "success", title: "¡Cuenta creada!", message: "Ya puedes iniciar sesión con tus credenciales" });
        router.push("/login");
      } else {
        showToast({ type: "error", title: "Error en el registro", message: datos.error || datos.mensaje || "Revisa tus datos" });
      }
    } catch {
      showToast({ type: "error", title: "Error de conexión", message: "No se pudo conectar con el servidor. Inténtalo más tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  const CondicionItem = ({ cumple, texto }: { cumple: boolean; texto: string }) => {
    const dotClass = "h-2 w-2 rounded-full mr-2 " + (cumple ? "bg-green-500" : "bg-red-500");
    const textClass = cumple ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400";
    return (
      <div className="flex items-center text-xs mt-1">
        <span className={dotClass}></span>
        <span className={textClass}>{texto}</span>
      </div>
    );
  };

  const mainDotClass = "h-3 w-3 rounded-full " + (passwordValida ? "bg-green-500" : "bg-red-500");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-primario dark:text-primario-light mb-4">Crear cuenta</h2>

      <form className="space-y-4" onSubmit={manejarRegistro}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <div className="flex items-center text-xs" title={passwordValida ? "Contraseña segura" : "La contraseña no cumple los requisitos"}>
              <span className={mainDotClass}></span>
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Requisitos de seguridad:</p>
            <CondicionItem cumple={cumpleLongitud} texto="Mínimo 12 caracteres" />
            <CondicionItem cumple={cumpleMayuscula && cumpleMinuscula} texto="Letras mayúsculas y minúsculas" />
            <CondicionItem cumple={cumpleNumero} texto="Al menos un número" />
            <CondicionItem cumple={cumpleEspecial} texto="Caracteres especiales ($, #, @, etc.)" />
            <CondicionItem cumple={noTieneSecuencias || password.length === 0} texto="Sin secuencias numéricas (ej. 1234)" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primario focus:ring-primario bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || !passwordValida}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta? <a href="/login" className="text-primario hover:underline">Inicia sesión</a>
      </p>
    </div>
  );
}