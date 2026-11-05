import { categorias } from "./productos.ts";
import type { ImagenNombre } from "./medidas.ts";
import { copy } from "../content/es.ts";

type Nombre = (typeof categorias)[number];

export type Coleccion = {
  numero: string;
  nombre: string;
  texto: string;
  imagen: ImagenNombre | null;
  imagenUrl: string | null;
  alt: string;
  posicion: string;
};

const base: { numero: string; nombre: Nombre; imagen: ImagenNombre; posicion: string }[] = [
  { numero: "01", nombre: "Anillos", imagen: "col-anillos", posicion: "object-[center_42%]" },
  { numero: "02", nombre: "Collares", imagen: "col-collares", posicion: "object-[center_40%]" },
  { numero: "03", nombre: "Aretes", imagen: "col-aretes", posicion: "object-center" },
  { numero: "04", nombre: "Pulseras", imagen: "col-pulseras", posicion: "object-[center_35%]" },
  { numero: "05", nombre: "Compromiso", imagen: "col-compromiso", posicion: "object-[center_45%]" },
  { numero: "06", nombre: "Regalos", imagen: "col-regalos", posicion: "object-[center_40%]" },
];

export const colecciones: Coleccion[] = base.map((item) => ({
  ...item,
  texto: copy.colecciones.items[item.nombre].linea,
  alt: copy.colecciones.items[item.nombre].alt,
  imagenUrl: null,
}));

export const rejilla = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-6",
  "lg:col-span-6",
];
