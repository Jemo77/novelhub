"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/utils/authFetch";
import { esDireccionEthereumValida } from "@/utils/ethereum";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface PerfilEnlaces {
  biografia?: string | null;
  walletWeb3?: string | null;
  cafecito?: string | null;
  paypal?: string | null;
  kofi?: string | null;
  patreon?: string | null;
  buyMeACoffee?: string | null;
  githubSponsors?: string | null;
  mercadoPago?: string | null;
  twitter?: string | null;
  adIdGeneral?: string | null;
  adIdTop?: string | null;
  adIdBottom?: string | null;
}

const CAMPOS_INICIALES: PerfilEnlaces = {
  biografia: null,
  walletWeb3: null,
  cafecito: null,
  paypal: null,
  kofi: null,
  patreon: null,
  buyMeACoffee: null,
  githubSponsors: null,
  mercadoPago: null,
  twitter: null,
  adIdGeneral: null,
  adIdTop: null,
  adIdBottom: null,
};

interface Campo {
  clave: keyof PerfilEnlaces;
  etiqueta: string;
  placeholder: string;
}

const CAMPOS_REDES: Campo[] = [
  { clave: "cafecito", etiqueta: "Cafecito", placeholder: "https://cafecito.app/tu-usuario" },
  { clave: "paypal", etiqueta: "PayPal", placeholder: "https://paypal.me/tu-usuario" },
  { clave: "kofi", etiqueta: "Ko-fi", placeholder: "https://ko-fi.com/tu-usuario" },
  { clave: "patreon", etiqueta: "Patreon", placeholder: "https://patreon.com/tu-usuario" },
  { clave: "buyMeACoffee", etiqueta: "Buy Me a Coffee", placeholder: "https://buymeacoffee.com/tu-usuario" },
  { clave: "githubSponsors", etiqueta: "GitHub Sponsors", placeholder: "https://github.com/sponsors/tu-usuario" },
  { clave: "mercadoPago", etiqueta: "Mercado Pago", placeholder: "https://..." },
  { clave: "twitter", etiqueta: "Twitter / X", placeholder: "https://x.com/tu-usuario" },
];

const CAMPOS_ADS: Campo[] = [
  { clave: "adIdGeneral", etiqueta: "Ad General (página de obra)", placeholder: "ID del widget de anuncio" },
  { clave: "adIdTop", etiqueta: "Ad Superior (arriba del capítulo)", placeholder: "ID del widget de anuncio" },
  { clave: "adIdBottom", etiqueta: "Ad Inferior (abajo del capítulo)", placeholder: "ID del widget de anuncio" },
];

function CampoTexto({ valor, onChange, placeholder }: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
    />
  );
}

export default function EditarEnlacesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [valores, setValores] = useState<PerfilEnlaces>(CAMPOS_INICIALES);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await authFetch(`${apiUrl}/api/autor/perfil/enlaces`);

        if (res.ok) {
          const data = await res.json();
          setValores({ ...CAMPOS_INICIALES, ...data });
        } else {
          console.error("Error al cargar enlaces:", await res.json());
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const setCampo = (clave: keyof PerfilEnlaces) => (valor: string) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const wallet = (valores.walletWeb3 || "").trim();
    if (wallet && !esDireccionEthereumValida(wallet)) {
      showToast({
        type: "error",
        title: "Wallet inválida",
        message: "La dirección debe ser una wallet Ethereum válida (0x + 40 caracteres hexadecimales).",
      });
      return;
    }
    setGuardando(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await authFetch(`${apiUrl}/api/autor/perfil/enlaces`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });

      if (res.ok) {
        showToast({ type: "success", title: "Enlaces guardados", message: "Tus enlaces y anuncios se actualizaron correctamente." });
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      showToast({
        type: "error",
        title: "Error al guardar",
        message: data.error || data.mensaje || "Error desconocido",
      });
    } catch (error) {
      console.error(error);
      showToast({ type: "error", title: "Error de conexión", message: "Inténtalo de nuevo." });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Cargando enlaces...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Enlaces del autor</h1>
            <p className="mt-2 text-sm text-slate-500">Redes, métodos de donación y tus 3 espacios de anuncios.</p>
          </div>
          <Button variant="secundario" onClick={() => router.push("/dashboard")}>
            Volver
          </Button>
        </div>

        <form className="mt-8 space-y-8" onSubmit={manejarEnvio}>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Biografía</h2>
            <p className="mt-1 text-sm text-slate-500">Se muestra en tu perfil público.</p>
            <textarea
              rows={4}
              value={valores.biografia || ""}
              onChange={(e) => setCampo("biografia")(e.target.value)}
              className="mt-3 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:ring-slate-400"
            />
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Wallet Web3</h2>
            <p className="mt-1 text-sm text-slate-500">Dirección pública (ej. 0x...) para recibir USDT directamente.</p>
            <CampoTexto valor={valores.walletWeb3 || ""} onChange={setCampo("walletWeb3")} placeholder="0x..." />
            <p className="mt-2 text-xs text-slate-400">Debe ser una dirección Ethereum válida (0x + 40 caracteres hexadecimales). Si no la configuras, se mostrará "Pago sin configurar" a los lectores.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Redes y donaciones</h2>
            <p className="mt-1 text-sm text-slate-500">Enlaces a tus redes sociales y plataformas de donación.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {CAMPOS_REDES.map((campo) => (
                <div key={campo.clave}>
                  <label className="block text-sm font-medium text-slate-700">{campo.etiqueta}</label>
                  <CampoTexto valor={valores[campo.clave] || ""} onChange={setCampo(campo.clave)} placeholder={campo.placeholder} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Anuncios (Ads)</h2>
            <p className="mt-1 text-sm text-slate-500">Ingresa solo el ID del widget de cada anuncio.</p>
            <div className="mt-3 space-y-4">
              {CAMPOS_ADS.map((campo) => (
                <div key={campo.clave}>
                  <label className="block text-sm font-medium text-slate-700">{campo.etiqueta}</label>
                  <CampoTexto valor={valores[campo.clave] || ""} onChange={setCampo(campo.clave)} placeholder={campo.placeholder} />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3 border-t border-slate-200 pt-6">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="secundario" type="button" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}