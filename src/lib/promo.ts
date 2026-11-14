export type PromoCampos = {
  precio_promo: number | null;
  promo_inicio: string | null;
  promo_fin: string | null;
};

export type EstadoPromo = "ninguna" | "vigente" | "programada" | "vencida";

const DIA = /^(\d{4}-\d{2}-\d{2})/;

function instante(valor: string | null, fin: boolean): number | null {
  if (!valor) return null;
  const texto = valor.trim();
  if (!texto) return null;
  const dia = DIA.exec(texto);
  if (dia && texto.length === 10) {
    return new Date(`${dia[1]}T${fin ? "23:59:59" : "00:00:00"}-05:00`).getTime();
  }
  const tiempo = new Date(texto).getTime();
  return Number.isNaN(tiempo) ? null : tiempo;
}

export function estadoPromo(campos: PromoCampos, ahora = Date.now()): EstadoPromo {
  if (campos.precio_promo == null) return "ninguna";
  const inicio = instante(campos.promo_inicio, false);
  const fin = instante(campos.promo_fin, true);
  if (inicio != null && ahora < inicio) return "programada";
  if (fin != null && ahora > fin) return "vencida";
  return "vigente";
}

export function porcentajeDescuento(precio: number, promo: number): number | null {
  if (!(precio > 0) || !(promo > 0) || promo >= precio) return null;
  return Math.round((1 - promo / precio) * 100);
}

/** Precio promocional redondeado a miles, siempre menor que el precio. */
export function precioPromoPorcentaje(precio: number, porcentaje: number): number | null {
  if (!(precio > 0) || porcentaje <= 0 || porcentaje >= 100) return null;
  let valor = Math.round((precio * (1 - porcentaje / 100)) / 1000) * 1000;
  if (valor >= precio) valor -= 1000;
  if (valor <= 0 || valor >= precio) return null;
  return valor;
}

export function fechaInput(valor: string | null): string {
  if (!valor) return "";
  const texto = valor.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  const tiempo = new Date(texto).getTime();
  if (Number.isNaN(tiempo)) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tiempo);
}

export function inicioIso(fecha: string): string | null {
  if (!fecha) return null;
  return `${fecha}T00:00:00-05:00`;
}

export function finIso(fecha: string): string | null {
  if (!fecha) return null;
  return `${fecha}T23:59:59-05:00`;
}
