/** Pesos colombianos, sin espacio: $250.000. */
export function formatoPesos(valor: number): string {
  const texto = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.round(valor));
  return `$${texto}`;
}
