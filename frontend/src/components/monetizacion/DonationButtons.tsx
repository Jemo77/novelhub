"use client";

import { Heart, Coffee, Globe, MessageCircleMore, Wallet, BadgeDollarSign, GitFork } from "lucide-react";

interface DonationButtonsProps {
  cafecito?: string | null;
  paypal?: string | null;
  kofi?: string | null;
  patreon?: string | null;
  buyMeACoffee?: string | null;
  githubSponsors?: string | null;
  mercadoPago?: string | null;
  twitter?: string | null;
}

const items = [
  { key: "cafecito", label: "Cafecito", icon: Coffee, tone: "bg-amber-500", border: "border-amber-200" },
  { key: "paypal", label: "PayPal", icon: Wallet, tone: "bg-blue-600", border: "border-blue-200" },
  { key: "kofi", label: "Ko-fi", icon: Heart, tone: "bg-rose-500", border: "border-rose-200" },
  { key: "patreon", label: "Patreon", icon: BadgeDollarSign, tone: "bg-orange-600", border: "border-orange-200" },
  { key: "buyMeACoffee", label: "Buy Me a Coffee", icon: Coffee, tone: "bg-yellow-600", border: "border-yellow-200" },
  { key: "githubSponsors", label: "GitHub Sponsors", icon: GitFork, tone: "bg-slate-800", border: "border-slate-200" },
  { key: "mercadoPago", label: "Mercado Pago", icon: Globe, tone: "bg-cyan-600", border: "border-cyan-200" },
  { key: "twitter", label: "Red social", icon: MessageCircleMore, tone: "bg-sky-500", border: "border-sky-200" },
] as const;

export default function DonationButtons(props: DonationButtonsProps) {
  const available = items.filter((item) => Boolean(props[item.key]));

  if (available.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Donaciones</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {available.map((item) => {
          const href = props[item.key] as string;
          const Icon = item.icon;

          return (
            <a
              key={item.key}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={"group flex items-center gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md " + item.border}
            >
              <span className={"flex h-10 w-10 items-center justify-center rounded-xl text-white " + item.tone}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium text-slate-900">{item.label}</span>
                <span className="text-sm text-slate-500">Apoyar al autor</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
