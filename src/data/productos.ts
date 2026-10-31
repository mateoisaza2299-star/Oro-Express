import type { ImagenNombre } from "./medidas.ts";

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
  id: string;
  nombre: string;
  categoria: Categoria;
  material: string;
  descripcion: string;
  precio: "Consultar";
  imagen: ImagenNombre;
  alt: string;
};

export const productos: Producto[] = [
  {
    id: "prod-01",
    nombre: "Anillo de cuatro garras",
    categoria: "Compromiso",
    material: "Metal dorado y piedra clara",
    descripcion:
      "Piedra clara redonda sujeta por cuatro garras, sobre un aro liso. La foto está tomada sobre mármol. Medida, material exacto y precio se confirman por consulta.",
    precio: "Consultar",
    imagen: "prod-01",
    alt: "Anillo de metal dorado con una piedra clara redonda sujeta en cuatro garras, sobre mármol claro.",
  },
  {
    id: "prod-02",
    nombre: "Argolla de perfil abombado",
    categoria: "Anillos",
    material: "Metal dorado",
    descripcion:
      "Argolla lisa, pulida, de perfil abombado y sin piedras. El material exacto y el precio se confirman por consulta.",
    precio: "Consultar",
    imagen: "prod-02",
    alt: "Argolla lisa de metal dorado pulido, de perfil abombado, sobre tela clara.",
  },
  {
    id: "prod-03",
    nombre: "Collar con dije de corazón",
    categoria: "Regalos",
    material: "Metal dorado",
    descripcion:
      "Cadena fina y dije de corazón liso, sin piedras. El largo de la cadena y el precio se confirman por consulta.",
    precio: "Consultar",
    imagen: "prod-03",
    alt: "Collar de cadena fina con un dije de corazón en metal dorado, sobre tela clara.",
  },
  {
    id: "prod-04",
    nombre: "Collar con piedra en bisel",
    categoria: "Collares",
    material: "Metal dorado y piedra clara",
    descripcion:
      "Cadena fina y una piedra clara pequeña en engaste de bisel redondo. No se publican quilates ni precio.",
    precio: "Consultar",
    imagen: "prod-04",
    alt: "Collar fino de metal dorado con una piedra clara en bisel, sobre una piedra clara y terciopelo verde.",
  },
  {
    id: "prod-05",
    nombre: "Aretes de piedra en bisel",
    categoria: "Aretes",
    material: "Metal dorado y piedra clara",
    descripcion:
      "Par de aretes con una piedra clara redonda rodeada por un aro de metal. El tipo de cierre y el precio se confirman por consulta.",
    precio: "Consultar",
    imagen: "prod-05",
    alt: "Par de aretes de metal dorado con piedra clara redonda en bisel, sobre tela clara.",
  },
  {
    id: "prod-06",
    nombre: "Aretes de perla",
    categoria: "Aretes",
    material: "Metal dorado, perlas y piedras claras",
    descripcion:
      "Pendientes largos con una piedra clara arriba, perlas pequeñas en la cadena y una perla mayor al final. El precio se consulta.",
    precio: "Consultar",
    imagen: "prod-06",
    alt: "Aretes largos de metal dorado con perlas y pequeñas piedras claras, sobre seda beige.",
  },
  {
    id: "prod-07",
    nombre: "Pulsera de eslabones",
    categoria: "Pulseras",
    material: "Metal dorado",
    descripcion:
      "Eslabones ovalados entrelazados, de superficie pulida. El largo y el precio se confirman por consulta.",
    precio: "Consultar",
    imagen: "prod-07",
    alt: "Pulsera de eslabones ovalados en metal dorado, sobre fondo marfil.",
  },
  {
    id: "prod-08",
    nombre: "Pulsera de piedras en línea",
    categoria: "Pulseras",
    material: "Metal dorado y piedras claras",
    descripcion:
      "Hilera continua de piedras claras en engaste de metal. No se indica cantidad ni quilates. El precio se consulta.",
    precio: "Consultar",
    imagen: "prod-08",
    alt: "Pulsera de piedras claras en línea, de metal dorado, llevada en la muñeca.",
  },
];
