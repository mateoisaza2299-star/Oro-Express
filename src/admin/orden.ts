export function moverElemento<T>(lista: T[], desde: number, hacia: number): T[] {
  if (desde < 0 || hacia < 0 || desde >= lista.length || hacia >= lista.length || desde === hacia) return lista;
  const next = [...lista];
  const [item] = next.splice(desde, 1);
  next.splice(hacia, 0, item);
  return next;
}
