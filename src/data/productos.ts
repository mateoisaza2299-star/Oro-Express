import type { ImagenNombre } from "./medidas.ts";
import { copy } from "../content/es.ts";
import { fuentes } from "../lib/imagen.ts";

export const categorias = [
  "Anillos",
  "Collares",
  "Aretes",
  "Pulseras",
  "Compromiso",
  "Regalos",
] as const;

export type Categoria = string;
export type Filtro = "Todos" | Categoria;

export type Producto = {
  id: string;
  nombre: string;
  categoria: Categoria;
  material: string;
  descripcion: string;
  precio: string;
  imagen: ImagenNombre | null;
  imagenUrl: string | null;
  alt: string;
  precioAnterior?: string | null;
  promoEtiqueta?: string | null;
  detalle?: string;
  galeria?: string[];
  destacada?: boolean;
  creada?: string | null;
};

const ficha: {
  id: keyof typeof copy.productos;
  categoria: Categoria;
  imagen: ImagenNombre;
  /** Más fotos de la misma joya: la tarjeta las va cambiando. */
  fotos?: ImagenNombre[];
}[] = [
  { id: "sal-flor", categoria: "Anillos", imagen: "flor-1" },
  { id: "sal-halo", categoria: "Compromiso", imagen: "halo-1", fotos: ["halo-1", "halo-2"] },
  { id: "sal-hoja", categoria: "Compromiso", imagen: "hoja-1" },
  { id: "sal-infinito", categoria: "Anillos", imagen: "infinito-1" },
  { id: "sal-doble", categoria: "Compromiso", imagen: "doble-1" },
  { id: "sal-catedral", categoria: "Compromiso", imagen: "catedral-1" },
  { id: "sal-fino", categoria: "Compromiso", imagen: "fino-1" },
  { id: "prod-01", categoria: "Compromiso", imagen: "prod-01" },
  { id: "prod-02", categoria: "Anillos", imagen: "prod-02" },
  { id: "prod-03", categoria: "Regalos", imagen: "prod-03" },
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
    imagenUrl: null,
    alt: texto.alt,
    galeria: item.fotos?.map((nombre) => fuentes(nombre).src),
  };
});
