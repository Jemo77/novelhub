import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import Web3Paywall from "@/components/monetizacion/Web3Paywall";
import { comprarLibroAction } from "@/app/actions/monetizacion";
import { generarPresignedUrl } from "@/lib/r2";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/server-auth";

interface LibroDetalle {
  id: string;
  titulo: string;
  sinopsis: string;
  portada?: string | null;
  precioUSDT: number;
  archivoKey: string;
  formato: string;
  autor: {
    id: string;
    nombre: string;
    username: string;
    avatar?: string | null;
    perfilAutor?: {
      walletWeb3?: string | null;
      cafecito?: string | null;
      paypal?: string | null;
      kofi?: string | null;
      patreon?: string | null;
      buyMeACoffee?: string | null;
      githubSponsors?: string | null;
      mercadoPago?: string | null;
      twitter?: string | null;
    } | null;
  };
}

export default async function LibroPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const apiUrl = getApiBaseUrl();

  const libroResponse = await fetch(apiUrl + "/api/contenido/libros/" + id, {
    cache: "no-store",
  });

  if (libroResponse.status === 404) {
    notFound();
  }

  if (!libroResponse.ok) {
    throw new Error("No se pudo cargar el libro");
  }

  const libro = (await libroResponse.json()) as LibroDetalle;
  const accesoResponse = await fetch(apiUrl + "/api/contenido/libros/" + id + "/acceso", {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const acceso = accesoResponse.ok ? await accesoResponse.json() : { tieneAcceso: false, archivoKey: null };

  if (!acceso.tieneAcceso) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] bg-slate-100">
              {libro.portada ? (
                <Image src={libro.portada} alt={libro.titulo} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Sin portada</div>
              )}
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Libro premium</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{libro.titulo}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{libro.sinopsis}</p>
            </div>
          </div>

          <Web3Paywall
            titulo={libro.titulo}
            descripcion={"Compra el libro para obtener acceso temporal a la descarga segura."}
            precioUSDT={libro.precioUSDT}
            tokenAddress={process.env.NEXT_PUBLIC_USDT_ADDRESS || ""}
            destino={libro.autor.perfilAutor?.walletWeb3 || ""}
            onPagoExitoso={comprarLibroAction.bind(null, libro.id)}
            donaciones={libro.autor.perfilAutor}
          />
        </div>
      </div>
    );
  }

  const archivoKey = acceso.archivoKey || libro.archivoKey;
  const descargaSegura = await generarPresignedUrl(archivoKey, 600);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[4/5] bg-slate-100">
            {libro.portada ? <Image src={libro.portada} alt={libro.titulo} fill className="object-cover" /> : null}
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{libro.formato}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{libro.titulo}</h1>
            <p className="mt-2 text-sm text-slate-500">por {libro.autor.nombre}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{libro.sinopsis}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={descargaSegura} target="_blank" rel="noreferrer">
                <Button>Descargar libro</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acceso seguro</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Tu enlace expira en 10 minutos.</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              El archivo se sirve desde Cloudflare R2 con una URL firmada temporal. El bucket sigue privado y no se expone la llave del archivo al cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
