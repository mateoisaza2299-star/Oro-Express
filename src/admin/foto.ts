import { supabase } from "../lib/supabase.ts";

const BUCKET = "joyas";
const MARCA = `/storage/v1/object/public/${BUCKET}/`;
const ANCHO_MAX = 1200;
const CALIDAD = 0.82;

const tipos = new Set(["image/jpeg", "image/png", "image/webp"]);

export function esFotoAdmitida(archivo: File) {
  return tipos.has(archivo.type);
}

export async function subirFoto(archivo: File): Promise<string> {
  if (!esFotoAdmitida(archivo)) throw new Error("La foto tiene que ser JPG, PNG o WebP.");
  const blob = await aWebp(archivo);
  const ruta = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la foto.");
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  if (!data.publicUrl) throw new Error("No se pudo subir la foto.");
  return data.publicUrl;
}

export async function borrarFoto(url: string | null | undefined) {
  const ruta = rutaEnBucket(url);
  if (!ruta) return;
  try {
    await supabase.storage.from(BUCKET).remove([ruta]);
  } catch {
    // Si el archivo ya no está, la pieza sigue guardada.
  }
}

export function rutaEnBucket(url: string | null | undefined): string | null {
  if (!url) return null;
  const indice = url.indexOf(MARCA);
  if (indice === -1) return null;
  const resto = url.slice(indice + MARCA.length).split("?")[0];
  if (!resto) return null;
  try {
    return decodeURIComponent(resto);
  } catch {
    return resto;
  }
}

async function aWebp(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  try {
    const ancho = Math.max(1, Math.min(ANCHO_MAX, bitmap.width));
    const alto = Math.max(1, Math.round(bitmap.height * (ancho / bitmap.width)));
    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar la foto.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((salida) => resolve(salida), "image/webp", CALIDAD);
    });
    if (!blob) throw new Error("No se pudo preparar la foto.");
    return blob;
  } finally {
    bitmap.close();
  }
}
