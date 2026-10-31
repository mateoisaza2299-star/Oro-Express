/**
 * Datos del negocio. Un campo en "PENDIENTE" no es un dato real:
 * no hay número, usuario, dirección ni horario confirmados.
 * `nombre` es el wordmark. "Maison" es provisional hasta confirmar el nombre real.
 */
export const site: {
  nombre: string;
  whatsapp: string;
  instagram: string;
  direccion: string;
  horario: string;
} = {
  nombre: "Maison",
  whatsapp: "PENDIENTE",
  instagram: "PENDIENTE",
  direccion: "PENDIENTE",
  horario: "PENDIENTE",
};

export const enlaces = [
  { id: "colecciones", etiqueta: "Colecciones" },
  { id: "atelier", etiqueta: "Atelier" },
  { id: "cuidado", etiqueta: "Cuidado" },
  { id: "contacto", etiqueta: "Contacto" },
] as const;
