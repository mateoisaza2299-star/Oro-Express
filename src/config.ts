/**
 * Datos del negocio. Un campo en "PENDIENTE" no es un dato real:
 * no hay número, usuario, dirección ni horario confirmados.
 * El nombre visible del sitio sale de `nombre`.
 */
export const site: {
  nombre: string;
  whatsapp: string;
  instagram: string;
  direccion: string;
  horario: string;
} = {
  nombre: "PENDIENTE",
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
