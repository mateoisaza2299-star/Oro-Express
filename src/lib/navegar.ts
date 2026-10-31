import { esPagina } from "../content/es.ts";
import { scrollToId } from "./scroll.ts";

export function irA(id: string) {
  const next = `#${id}`;
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = id;
}

export function seguirHash(hash: string) {
  if (esPagina(hash)) {
    window.scrollTo(0, 0);
    return;
  }
  if (!hash || hash === "inicio" || hash === "contenido") {
    window.scrollTo(0, 0);
    return;
  }
  window.setTimeout(() => scrollToId(hash), 80);
}
