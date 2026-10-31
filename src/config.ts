/**
 * Datos del negocio. Un campo vacío o en "PENDIENTE" no es un dato real
 * y no se muestra en la página.
 * `nombre` es el wordmark. "Maison" es provisional hasta confirmar el nombre real.
 *
 * REVISAR CON ABOGADO.
 * Los textos de privacidad, términos y ayuda son una guía general.
 * No hay razón social, NIT, plazos ni política de cookies:
 * el sitio no usa cookies, así que esa política no se publica.
 * Si responsable, nit, correoDatos, pais o ciudad siguen vacíos, esa línea no aparece.
 */
export const site: {
  nombre: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  direccion: string;
  horario: string;
  pais: string;
  ciudad: string;
} = {
  nombre: "Maison",
  whatsapp: "PENDIENTE",
  instagram: "PENDIENTE",
  tiktok: "",
  facebook: "",
  direccion: "PENDIENTE",
  horario: "PENDIENTE",
  pais: "",
  ciudad: "",
};

/** Cifras comerciales. Vacío = esa columna de beneficios no se muestra. */
export const comerciales: {
  envioGratisDesde: string;
  descuentoPrimeraCompra: string;
  tiempoGarantia: string;
  politicaCambios: string;
} = {
  envioGratisDesde: "",
  descuentoPrimeraCompra: "",
  tiempoGarantia: "",
  politicaCambios: "",
};

/** REVISAR CON ABOGADO. Vacío = la línea no se muestra. */
export const datos: {
  responsable: string;
  nit: string;
  correoDatos: string;
  finalidad: string;
} = {
  responsable: "",
  nit: "",
  correoDatos: "",
  finalidad: "Atender la consulta que envías y coordinar la pieza que preguntas.",
};
