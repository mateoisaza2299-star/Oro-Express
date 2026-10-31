import { copy } from "../content/es.ts";
import { site } from "../config.ts";
import { datoVisible } from "./dato.ts";

/** Dígitos del número solo si deja de estar pendiente. */
export function numeroWhatsapp(): string | null {
  const visible = datoVisible(site.whatsapp);
  if (!visible) return null;
  const digits = visible.replace(/\D/g, "");
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
  const value = datoVisible(site.instagram);
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

export function mensajeGeneral(): string {
  return copy.whatsapp.general;
}

export function mensajeConsulta(nombre: string, categoria: string): string {
  return copy.whatsapp.consulta(nombre, categoria);
}

export function mensajeContacto(nombre: string, mensaje: string, pieza: string): string {
  return copy.whatsapp.contacto(nombre, mensaje, pieza);
}
