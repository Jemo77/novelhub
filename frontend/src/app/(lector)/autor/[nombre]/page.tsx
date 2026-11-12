import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AdIframe from "@/components/monetizacion/AdIframe";
import DonationButtons from "@/components/monetizacion/DonationButtons";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/server-auth";

interface ObraPublica {
  id: string;
  titulo: string;
  sinopsis: string;
  portada?: string | null;
  fechaPublicacion?: string;
  creadoEn?: string;
  precioUSDT?: number;
  formato?: string;
  generos?: string[];
}

interface PerfilAutorPublico {
  id: string;
  nombre: string;
  avatar?: string | null;
  perfilAutor?: {
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
  } | null;
  novelas: ObraPublica[];
  comics: ObraPublica[];
  libros: ObraPublica[];
}

export default async function PerfilAutorPage({ params }: { params: { nombre: string } }) {
  const { nombre } = params;
  const apiUrl = getApiBaseUrl();
  const response = await fetch(apiUrl + "/api/contenido/autores/" + nombre, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("No se pudo cargar el perfil público");
  }

  const autor = (await response.json()) as PerfilAutorPublico;
  const obras = [
    ...autor.novelas.map((obra) => ({ ...obra, tipo: "novela" as const })),
    ...autor.comics.map((obra) => ({ ...obra, tipo: "comic" as const })),
    ...autor.libros.map((obra) => ({ ...obra, tipo: "libro" as const })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-3xl font-bold text-slate-700">
              {autor.avatar ? (
                <Image src={autor.avatar} alt={autor.nombre} width={96} height={96} className="h-full w-full object-cover" />
              ) : (
                autor.nombre.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Autor público</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{autor.nombre}</h1>
              <p className="text-sm text-slate-500">@{autor.nombre}</p>
              {autor.perfilAutor?.walletWeb3 ? <p className="text-sm text-slate-600">Wallet USDT: {autor.perfilAutor.walletWeb3}</p> : null}
            </div>
          </div>

          {autor.perfilAutor?.biografia ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Biografía</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{autor.perfilAutor.biografia}</p>
            </div>
          ) : null}

          {autor.perfilAutor?.adIdGeneral ? (
            <div className="mt-8">
              <AdIframe adId={autor.perfilAutor.adIdGeneral} />
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <DonationButtons
            cafecito={autor.perfilAutor?.cafecito}
            paypal={autor.perfilAutor?.paypal}
            kofi={autor.perfilAutor?.kofi}
            patreon={autor.perfilAutor?.patreon}
            buyMeACoffee={autor.perfilAutor?.buyMeACoffee}
            githubSponsors={autor.perfilAutor?.githubSponsors}
            mercadoPago={autor.perfilAutor?.mercadoPago}
            twitter={autor.perfilAutor?.twitter}
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Obras publicadas</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{obras.length}</p>
            <p className="mt-1 text-sm text-slate-500">Novelas, cómics y libros visibles públicamente.</p>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Obras</h2>
            <p className="mt-1 text-sm text-slate-500">Explora su catálogo público.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {obras.map((obra) => {
            const href = obra.tipo === "libro" ? "/libros/" + obra.id : "/" + obra.tipo + "s/" + obra.id;

            return (
              <Link key={obra.tipo + "-" + obra.id} href={href} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  {obra.portada ? (
                    <Image src={obra.portada} alt={obra.titulo} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin portada</div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{obra.tipo}</span>
                    {obra.tipo === "libro" ? (
                      <span className="text-sm font-semibold text-emerald-700">{obra.precioUSDT?.toFixed(2)} USDT</span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{obra.titulo}</h3>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">{obra.sinopsis}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
