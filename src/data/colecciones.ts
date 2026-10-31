import type { Categoria } from "./productos.ts";
import type { ImagenNombre } from "./medidas.ts";

export type Coleccion = {
  numero: string;
  nombre: Categoria;
  texto: string;
  imagen: ImagenNombre;
  alt: string;
  posicion: string;
};

export const colecciones: Coleccion[] = [
  {
    numero: "01",
    nombre: "Anillos",
    texto: "Aros lisos y piedras en garra.",
    imagen: "col-anillos",
    alt: "Anillo de metal dorado con piedra clara redonda en cuatro garras, sobre mármol.",
    posicion: "object-[center_42%]",
  },
  {
    numero: "02",
    nombre: "Collares",
    texto: "Cadenas finas y dijes de poco volumen.",
    imagen: "col-collares",
    alt: "Collar de cadena fina con dije de corazón en metal dorado, sobre tela clara.",
    posicion: "object-[center_40%]",
  },
  {
    numero: "03",
    nombre: "Aretes",
    texto: "Del punto de luz al pendiente largo.",
    imagen: "col-aretes",
    alt: "Aretes largos de metal dorado con perlas y piedras claras, sobre seda beige.",
    posicion: "object-center",
  },
  {
    numero: "04",
    nombre: "Pulseras",
    texto: "Eslabón o línea de piedras.",
    imagen: "col-pulseras",
    alt: "Pulsera de piedras claras en línea, de metal dorado, llevada en la muñeca.",
    posicion: "object-[center_35%]",
  },
  {
    numero: "05",
    nombre: "Compromiso",
    texto: "Solitarios para conversar con calma.",
    imagen: "col-compromiso",
    alt: "Anillo con piedra clara en cuatro garras, dentro de un estuche de terciopelo verde.",
    posicion: "object-[center_45%]",
  },
  {
    numero: "06",
    nombre: "Regalos",
    texto: "Piezas presentadas para ofrecer.",
    imagen: "col-regalos",
    alt: "Dije de piedras claras en un estuche de terciopelo verde, con un lazo de raso.",
    posicion: "object-[center_40%]",
  },
];

export const rejilla = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-6",
  "lg:col-span-6",
];
