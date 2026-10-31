/** Un valor vacío o marcado como pendiente no se muestra. */
export function datoVisible(valor: string | undefined | null): string | null {
  if (!valor) return null;
  const limpio = valor.trim();
  if (!limpio || limpio.toUpperCase() === "PENDIENTE") return null;
  return limpio;
}

export function redHref(valor: string | undefined, host: string): string | null {
  const visible = datoVisible(valor);
  if (!visible) return null;
  if (/^https?:\/\//i.test(visible)) return visible;
  return `https://${host}/${visible.replace(/^@/, "")}`;
}
