"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import Button from "@/components/ui/Button";
import DonationButtons from "./DonationButtons";
import { esDireccionEthereumValida } from "@/utils/ethereum";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)",
];

interface Web3PaywallProps {
  titulo: string;
  descripcion?: string;
  precioUSDT: number;
  tokenAddress: string;
  destino: string;
  decimals?: number;
  onPagoExitoso: (txHash: string) => Promise<unknown>;
  donaciones?: {
    cafecito?: string | null;
    paypal?: string | null;
    kofi?: string | null;
    patreon?: string | null;
    buyMeACoffee?: string | null;
    githubSponsors?: string | null;
    mercadoPago?: string | null;
    twitter?: string | null;
  } | null;
}

export default function Web3Paywall({
  titulo,
  descripcion,
  precioUSDT,
  tokenAddress,
  destino,
  decimals = 6,
  onPagoExitoso,
  donaciones,
}: Web3PaywallProps) {
  const [cargando, setCargando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);

  const destinoValido = !!destino && esDireccionEthereumValida(destino);
  const tokenValido = !!tokenAddress && esDireccionEthereumValida(tokenAddress);
  const tieneDonaciones = donaciones && Object.values(donaciones).some((v) => Boolean(v));

  const comprar = async () => {
    if (!tokenValido) {
      setEstado("Falta configurar la dirección del token USDT en la plataforma.");
      return;
    }

    setCargando(true);
    setEstado(null);

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("Necesitas una wallet compatible con Ethereum");
      }

      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contrato = new Contract(tokenAddress, ERC20_ABI, signer);
      const cantidad = parseUnits(precioUSDT.toString(), decimals);
      const tx = await contrato.transfer(destino, cantidad);
      setEstado("Esperando confirmación en la red...");
      await tx.wait();
      const resultado = await onPagoExitoso(tx.hash);
      if (resultado && typeof resultado === "object" && "ok" in resultado && !(resultado as any).ok) {
        throw new Error((resultado as any).data?.error || "No se pudo registrar la compra");
      }
      setEstado("Pago confirmado. Desbloqueando contenido...");
    } catch (error: any) {
      setEstado(error?.message || "No se pudo completar el pago");
    } finally {
      setCargando(false);
    }
  };

  if (!destinoValido) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Contenido premium</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{titulo}</h2>
        {descripcion ? <p className="mt-2 text-sm leading-6 text-slate-600">{descripcion}</p> : null}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-slate-500">Precio</p>
          <p className="text-3xl font-extrabold text-slate-900">{precioUSDT.toFixed(2)} USDT</p>
        </div>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">Pago sin configurar</p>
          <p className="mt-1 text-sm text-amber-700">
            El autor aún no ha configurado su wallet para recibir pagos USDT.
          </p>
        </div>
        {tieneDonaciones ? (
          <div className="mt-5">
            <DonationButtons {...(donaciones as NonNullable<typeof donaciones>)} />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Contenido premium</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{titulo}</h2>
      {descripcion ? <p className="mt-2 text-sm leading-6 text-slate-600">{descripcion}</p> : null}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
        <p className="text-sm text-slate-500">Precio</p>
        <p className="text-3xl font-extrabold text-slate-900">{precioUSDT.toFixed(2)} USDT</p>
        <p className="mt-1 text-xs text-slate-400">
          El pago va directo a la wallet del autor: {destino.slice(0, 6)}...{destino.slice(-4)}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={comprar} disabled={cargando} className="shadow-md">
          {cargando ? "Procesando pago..." : "Pagar con Web3"}
        </Button>
      </div>
      {estado ? <p className="mt-4 text-sm text-slate-600">{estado}</p> : null}
    </section>
  );
}
