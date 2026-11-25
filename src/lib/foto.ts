import type { SyntheticEvent } from "react";

/** Marca una foto como cargada para que aparezca con fundido y el esqueleto se apague. */
export function alCargarFoto(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.classList.add("is-loaded");
}

/** Si la foto ya estaba en caché al montarse, no esperar al evento load. */
export function alMontarFoto(el: HTMLImageElement | null) {
  if (el?.complete && el.naturalWidth > 0) el.classList.add("is-loaded");
}
