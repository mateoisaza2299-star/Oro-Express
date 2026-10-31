import { medidas, type ImagenNombre } from "../data/medidas.ts";

export function fuentes(nombre: ImagenNombre) {
  const medida = medidas[nombre];
  const base = import.meta.env.BASE_URL;
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
