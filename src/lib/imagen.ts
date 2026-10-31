import { medidas, type ImagenNombre } from "../data/medidas.ts";

export function fuentes(nombre: ImagenNombre) {
  const base = import.meta.env.BASE_URL;
  if (nombre === "hero") {
    return {
      src: `${base}img/hero-1280.webp`,
      srcSet: [
        `${base}img/hero-640.webp 640w`,
        `${base}img/hero-1000.webp 1000w`,
        `${base}img/hero-1280.webp 1280w`,
        `${base}img/hero-1920.webp 1920w`,
      ].join(", "),
      width: 1920,
      height: 1072,
    };
  }
  const medida = medidas[nombre];
  const large = `${base}img/${nombre}.webp`;
  const small = `${base}img/${nombre}-640.webp`;
  const srcSet =
    medida.ancho > 640 ? `${small} 640w, ${large} ${medida.ancho}w` : `${large} ${medida.ancho}w`;
  return {
    src: large,
    srcSet,
    width: medida.ancho,
    height: medida.alto,
  };
}
