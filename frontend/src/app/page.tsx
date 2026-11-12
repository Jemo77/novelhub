import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Pasarela descentralizada para autores
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              Monetiza novelas, cómics y libros con lectura segura y pagos USDT.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Una sola entrada para leer, publicar y vender contenido premium con R2 privado, paywall Web3 y donaciones externas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/explorador">
              <Button variant="primario" className="w-full sm:w-auto px-6 py-3 text-base shadow-lg shadow-slate-900/10">
                Entrar a leer
              </Button>
            </Link>
            <Link href="/registro">
              <Button variant="secundario" className="w-full sm:w-auto px-6 py-3 text-base shadow-lg shadow-amber-900/10">
                Publicar como autor
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Capítulos premium</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Bloqueo por compra, expiración opcional y acceso validado en servidor.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Libros privados</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Archivos firmados temporalmente desde Cloudflare R2.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Donaciones y Ads</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Monetización híbrida con enlaces externos e iframe seguro.</p>
            </div>
          </div>
        </section>

        <aside className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 opacity-90 blur-2xl dark:opacity-95" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-8 text-white shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
              <span>Acceso central</span>
              <span>Web3 + R2</span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm font-semibold text-emerald-300">Autor</p>
                <p className="mt-1 text-sm text-slate-300">Panel para subir obras, capítulos y libros.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm font-semibold text-sky-300">Lector</p>
                <p className="mt-1 text-sm text-slate-300">Leer con paywall, anuncios y protección básica.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm font-semibold text-amber-300">Libros</p>
                <p className="mt-1 text-sm text-slate-300">Descarga con URL firmada temporal y bucket privado.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}