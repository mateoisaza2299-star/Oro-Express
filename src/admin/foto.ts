import { supabase, supabaseAnon, supabaseUrl } from "../lib/supabase.ts";

const BUCKET = "joyas";
const MARCA = `/storage/v1/object/public/${BUCKET}/`;
const LADO_MAX = 1600;
const CALIDAD = 0.8;
const LIMITE_BYTES = 5 * 1024 * 1024;
const TOPE_ORIGINAL = 20 * 1024 * 1024;

const tipos = new Set(["image/jpeg", "image/png", "image/webp"]);

export function esFotoAdmitida(archivo: File) {
  return tipos.has(archivo.type) || /\.(jpe?g|png|webp)$/i.test(archivo.name);
}

/** Null si se puede subir. Si no, el texto que ve el dueño. */
export function validarArchivo(archivo: File): string | null {
  const tipo = archivo.type.toLowerCase();
  const pareceImagen = tipo.startsWith("image/") || /\.(jpe?g|png|webp|gif|avif|heic)$/i.test(archivo.name);
  if (!pareceImagen) return "El archivo no es una imagen.";
  if (archivo.size > TOPE_ORIGINAL) return "La foto es demasiado pesada. Elige una más liviana.";
  if (!esFotoAdmitida(archivo)) return "Usa una foto JPG, PNG o WebP.";
  return null;
}

export async function subirFoto(
  archivo: File,
  onProgreso?: (fraccion: number) => void,
  carpeta?: string,
): Promise<string> {
  const motivo = validarArchivo(archivo);
  if (motivo) throw new Error(motivo);
  onProgreso?.(0.05);
  const blob = await aWebp(archivo);
  onProgreso?.(0.2);
  const { data: sesion } = await supabase.auth.getSession();
  const token = sesion.session?.access_token;
  if (!token) {
    const vencida = new Error("Tu sesión terminó, entra de nuevo");
    (vencida as Error & { code?: string }).code = "SESION";
    throw vencida;
  }
  const ruta = rutaDe(carpeta);
  const cuerpo = new FormData();
  cuerpo.append("cacheControl", "3600");
  cuerpo.append("", new File([blob], ruta, { type: "image/webp" }));
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${ruta}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnon);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgreso?.(0.2 + (event.loaded / event.total) * 0.8);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgreso?.(1);
        resolve();
        return;
      }
      let mensaje = "No se pudo subir la foto.";
      try {
        const cuerpoError = JSON.parse(xhr.responseText) as { message?: string; code?: string; error?: string };
        mensaje = cuerpoError.message || cuerpoError.error || mensaje;
        if (cuerpoError.code) mensaje = `${cuerpoError.code} · ${mensaje}`;
      } catch {
        if (xhr.responseText) mensaje = xhr.responseText.slice(0, 180);
      }
      const fallo = new Error(mensaje);
      if (xhr.status === 401 && /jwt|session expired/i.test(mensaje)) {
        (fallo as Error & { code?: string }).code = "SESION";
      }
      reject(fallo);
    };
    xhr.onerror = () => reject(new Error("No se pudo subir la foto."));
    xhr.send(cuerpo);
  });
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  if (!data.publicUrl) throw new Error("No se pudo subir la foto.");
  return data.publicUrl;
}

export async function subirFotoDeJoya(
  archivo: File,
  joyaId: string,
  onProgreso?: (fraccion: number) => void,
): Promise<{ url: string; path: string }> {
  const url = await subirFoto(archivo, onProgreso, joyaId);
  const path = rutaEnBucket(url);
  if (!path) throw new Error("No se pudo subir la foto.");
  return { url, path };
}

export async function borrarRutas(rutas: Array<string | null | undefined>) {
  const unicas = [...new Set(rutas.filter((ruta): ruta is string => Boolean(ruta)))];
  if (!unicas.length) return;
  try {
    await supabase.storage.from(BUCKET).remove(unicas);
  } catch {
    // Si el archivo ya no está, la ficha sigue guardada.
  }
}

function rutaDe(carpeta?: string) {
  const nombre = `${crypto.randomUUID()}.webp`;
  const limpia = carpeta?.replace(/^\/+|\/+$/g, "");
  return limpia ? `${limpia}/${nombre}` : nombre;
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
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));
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
    if (blob.size > LIMITE_BYTES) throw new Error("La foto pasa de 5 MB. Elige una más liviana.");
    return blob;
  } finally {
    bitmap.close();
  }
}
