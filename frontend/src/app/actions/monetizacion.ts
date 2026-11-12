"use server";

import { getApiBaseUrl, getAuthHeaders } from "@/lib/server-auth";

async function enviarJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export async function subirObraAction(formData: FormData) {
  const apiUrl = getApiBaseUrl();
  return enviarJson(apiUrl + "/api/autor/obra", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function subirCapituloAction(formData: FormData) {
  const apiUrl = getApiBaseUrl();
  const obraId = String(formData.get("obraId") || "");
  const tipo = String(formData.get("tipo") || "novela");
  const endpoint = tipo === "comic"
    ? "/api/autor/obras/" + obraId + "/capitulos/comic"
    : "/api/autor/obras/" + obraId + "/capitulos/novela";

  return enviarJson(apiUrl + endpoint, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function comprarCapituloNovelaAction(capituloId: string, txHash: string) {
  const apiUrl = getApiBaseUrl();
  return enviarJson(apiUrl + "/api/contenido/capitulos-novela/" + capituloId + "/comprar", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ txHash }),
  });
}

export async function comprarCapituloComicAction(capituloId: string, txHash: string) {
  const apiUrl = getApiBaseUrl();
  return enviarJson(apiUrl + "/api/contenido/capitulos-comic/" + capituloId + "/comprar", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ txHash }),
  });
}

export async function comprarLibroAction(libroId: string, txHash: string) {
  const apiUrl = getApiBaseUrl();
  return enviarJson(apiUrl + "/api/contenido/libros/" + libroId + "/comprar", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ txHash }),
  });
}
