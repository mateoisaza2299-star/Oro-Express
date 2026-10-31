import { site } from "../config.ts";

/** Dígitos del número solo si deja de estar pendiente. */
export function numeroWhatsapp(): string | null {
  if (site.whatsapp === "PENDIENTE") return null;
  const digits = site.whatsapp.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return digits;
}

/** Arma el enlace con el mensaje en UTF-8 vía encodeURIComponent. */
export function whatsappUrl(mensaje: string): string {
  const text = encodeURIComponent(mensaje);
  const numero = numeroWhatsapp();
  if (numero) return `https://wa.me/${numero}?text=${text}`;
  return `https://api.whatsapp.com/send?text=${text}`;
}

export function instagramHref(): string | null {
  if (site.instagram === "PENDIENTE") return null;
  const value = site.instagram.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

export function mensajeGeneral(): string {
  return "Hola. Quiero conocer las colecciones.";
}

export function mensajeConsulta(nombre: string, categoria: string): string {
  return `Hola. Quiero consultar la pieza «${nombre}» (${categoria}).`;
}

export function mensajeContacto(nombre: string, mensaje: string, pieza: string): string {
  const lineaPieza = pieza.trim() ? `\nPieza: ${pieza.trim()}.` : "";
  return `Hola. Soy ${nombre.trim()}.${lineaPieza}\n${mensaje.trim()}`;
}
