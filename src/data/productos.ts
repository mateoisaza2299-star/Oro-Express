import type { ImagenNombre } from "./medidas.ts";
import { copy } from "../content/es.ts";

export const categorias = [
  "Anillos",
  "Collares",
  "Aretes",
  "Pulseras",
  "Compromiso",
  "Regalos",
] as const;

export type Categoria = (typeof categorias)[number];
export type Filtro = "Todos" | Categoria;

export type Producto = {
  id: keyof typeof copy.productos;
  nombre: string;
  categoria: Categoria;
  material: string;
  descripcion: string;
  precio: string;
  imagen: ImagenNombre;
  alt: string;
};

const ficha: { id: keyof typeof copy.productos; categoria: Categoria; imagen: ImagenNombre }[] = [
  { id: "prod-01", categoria: "Compromiso", imagen: "prod-01" },
  { id: "prod-02", categoria: "Anillos", imagen: "prod-02" },
  { id: "prod-03", categoria: "Regalos", imagen: "prod-03" },
  { id: "prod-04", categoria: "Collares", imagen: "prod-04" },
  { id: "prod-05", categoria: "Aretes", imagen: "prod-05" },
  { id: "prod-06", categoria: "Aretes", imagen: "prod-06" },
  { id: "prod-07", categoria: "Pulseras", imagen: "prod-07" },
  { id: "prod-08", categoria: "Pulseras", imagen: "prod-08" },
];

export const productos: Producto[] = ficha.map((item) => {
  const texto = copy.productos[item.id];
  return {
    id: item.id,
    nombre: texto.nombre,
    categoria: item.categoria,
    material: copy.catalogo.material,
    descripcion: texto.frase,
    precio: copy.catalogo.precio,
    imagen: item.imagen,
    alt: texto.alt,
  };
});
