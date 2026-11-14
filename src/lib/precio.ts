/** Pesos colombianos, sin espacio: $250.000. */
export function formatoPesos(valor: number): string {
  const texto = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.round(valor));
  return `$${texto}`;
}

export function digitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function miles(valor: string): string {
  const limpio = digitos(valor);
  if (!limpio) return "";
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Number(limpio));
}

export function aEntero(valor: string): number | null {
  const limpio = digitos(valor);
  if (!limpio) return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}
