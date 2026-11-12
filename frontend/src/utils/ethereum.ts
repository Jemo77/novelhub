export function esDireccionEthereumValida(direccion?: string | null): boolean {
  if (!direccion) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(direccion.trim());
}