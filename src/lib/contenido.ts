import { useEffect, useSyncExternalStore } from "react";
import { comerciales as comercialesLocal, datos as datosLocal, site as siteLocal } from "../config.ts";
import { copy } from "../content/es.ts";
import { colecciones as coleccionesLocales } from "../data/colecciones.ts";
import type { Coleccion } from "../data/colecciones.ts";
import { categorias as categoriasLocales, productos as productosLocales } from "../data/productos.ts";
import type { Producto } from "../data/productos.ts";
import { esImagenNombre } from "./imagen.ts";
import { formatoPesos } from "./precio.ts";
import { estadoPromo } from "./promo.ts";
import { supabase } from "./supabase.ts";

export type Contenido = {
  site: typeof siteLocal;
  comerciales: typeof comercialesLocal;
  datos: typeof datosLocal;
  hero: { kicker: string; lines: string[]; texto: string };
  banner: string;
  categorias: string[];
  colecciones: Coleccion[];
  productos: Producto[];
};

const ESPERA_MS = 3000;

function crearLocal(): Contenido {
  return {
    site: { ...siteLocal },
    comerciales: { ...comercialesLocal },
    datos: { ...datosLocal },
    hero: {
      kicker: copy.hero.kicker,
      lines: [copy.hero.lines[0], copy.hero.lines[1]],
      texto: copy.hero.texto,
    },
    banner: "",
    categorias: [...categoriasLocales],
    colecciones: coleccionesLocales.map((item) => ({ ...item })),
    productos: productosLocales.map((item) => ({ ...item })),
  };
}

const local = crearLocal();
let actual: Contenido = local;
const oyentes = new Set<() => void>();

export function leerContenido(): Contenido {
  return actual;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

function publicar(siguiente: Contenido) {
  actual = siguiente;
  oyentes.forEach((oyente) => oyente());
}

export function useContenido(): Contenido {
  return useSyncExternalStore(suscribir, leerContenido, () => local);
}

let carga: Promise<void> | null = null;
let ticket = 0;

export function useCargarContenido() {
  useEffect(() => {
    if (!carga) carga = cargarRemoto();
  }, []);
}

export function recargarContenido() {
  carga = cargarRemoto();
}

async function cargarRemoto() {
  const mio = ++ticket;
  try {
    const remoto = await Promise.race([traer(), esperar(ESPERA_MS)]);
    if (mio !== ticket) return;
    if (remoto) publicar(remoto);
  } catch {
    // Sin red o Supabase caído: se quedan los datos locales.
  }
}

function esperar(ms: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}

type FilaCategoria = {
  id: string;
  nombre: string;
  linea: string | null;
  alt: string | null;
  imagen_url: string | null;
  imagen_local: string | null;
  posicion: string | null;
  orden: number | null;
};

type FilaJoya = {
  id: string;
  categoria_id: string;
  nombre: string;
  frase: string | null;
  descripcion: string | null;
  alt: string | null;
  material: string | null;
  precio: number | string | null;
  precio_promo: number | string | null;
  promo_etiqueta: string | null;
  promo_inicio: string | null;
  promo_fin: string | null;
  imagen_url: string | null;
  imagen_local: string | null;
  destacada: boolean | null;
  orden: number | null;
};

type FilaFoto = {
  joya_id: string;
  url: string | null;
  orden: number | null;
  es_principal: boolean | null;
};

type FilaAjuste = { clave: string; valor: string | null };

async function traer(): Promise<Contenido | null> {
  const [cats, joyas, ajustes, fotos] = await Promise.all([
    supabase
      .from("categorias")
      .select("id,nombre,linea,alt,imagen_url,imagen_local,posicion,orden")
      .eq("activa", true)
      .order("orden", { ascending: true }),
    supabase
      .from("joyas")
      .select(
        "id,categoria_id,nombre,frase,descripcion,alt,material,precio,precio_promo,promo_etiqueta,promo_inicio,promo_fin,imagen_url,imagen_local,destacada,orden",
      )
      .eq("activa", true)
      .order("orden", { ascending: true }),
    supabase.from("ajustes").select("clave,valor"),
    supabase.from("joya_fotos").select("joya_id,url,orden,es_principal").order("orden", { ascending: true }),
  ]);
  if (cats.error || joyas.error || ajustes.error || !cats.data || !joyas.data || !ajustes.data) return null;
  const galeria = fotos.error || !fotos.data ? [] : (fotos.data as FilaFoto[]);
  return armar(cats.data as FilaCategoria[], joyas.data as FilaJoya[], ajustes.data as FilaAjuste[], galeria);
}

function armar(cats: FilaCategoria[], joyas: FilaJoya[], ajustes: FilaAjuste[], fotos: FilaFoto[]): Contenido {
  const mapa = new Map(ajustes.map((fila) => [fila.clave, fila.valor ?? ""]));
  const leer = (clave: string, respaldo: string) => (mapa.has(clave) ? (mapa.get(clave) ?? "") : respaldo);
  const nombres = new Map(cats.map((cat) => [cat.id, cat.nombre]));
  const base = crearLocal();

  return {
    site: {
      nombre: leer("nombre", base.site.nombre),
      whatsapp: leer("whatsapp", base.site.whatsapp),
      instagram: leer("instagram", base.site.instagram),
      tiktok: leer("tiktok", base.site.tiktok),
      facebook: leer("facebook", base.site.facebook),
      direccion: leer("direccion", base.site.direccion),
      horario: leer("horario", base.site.horario),
      pais: leer("pais", base.site.pais),
      ciudad: leer("ciudad", base.site.ciudad),
    },
    comerciales: {
      envioGratisDesde: leer("envio_gratis_desde", base.comerciales.envioGratisDesde),
      descuentoPrimeraCompra: leer("descuento_primera_compra", base.comerciales.descuentoPrimeraCompra),
      tiempoGarantia: leer("tiempo_garantia", base.comerciales.tiempoGarantia),
      politicaCambios: leer("politica_cambios", base.comerciales.politicaCambios),
    },
    datos: {
      responsable: leer("responsable", base.datos.responsable),
      nit: leer("nit", base.datos.nit),
      correoDatos: leer("correo_datos", base.datos.correoDatos),
      finalidad: leer("finalidad", base.datos.finalidad),
    },
    hero: {
      kicker: leer("hero_kicker", base.hero.kicker),
      lines: [leer("hero_linea_1", base.hero.lines[0] ?? ""), leer("hero_linea_2", base.hero.lines[1] ?? "")],
      texto: leer("hero_texto", base.hero.texto),
    },
    banner: leer("banner_promo", ""),
    categorias: cats.map((cat) => cat.nombre),
    colecciones: cats.map((cat, index) => aColeccion(cat, index)),
    productos: joyas.map((joya) => aProducto(joya, nombres.get(joya.categoria_id) ?? "", fotos)),
  };
}

function aColeccion(cat: FilaCategoria, index: number): Coleccion {
  const imagenUrl = limpio(cat.imagen_url);
  const local = imagenUrl ? null : esImagenNombre(cat.imagen_local) ? cat.imagen_local : null;
  const posicion = limpio(cat.posicion);
  return {
    numero: String(index + 1).padStart(2, "0"),
    nombre: cat.nombre,
    texto: limpio(cat.linea) ?? "",
    imagen: local,
    imagenUrl,
    alt: limpio(cat.alt) ?? cat.nombre,
    posicion: posicion?.startsWith("object-") ? posicion : "object-center",
  };
}

function aProducto(joya: FilaJoya, categoria: string, fotos: FilaFoto[]): Producto {
  const imagenUrl = limpio(joya.imagen_url);
  const material = limpio(joya.material);
  const normal = precioTexto(joya.precio);
  const promo = aNumero(joya.precio_promo);
  const vigente = promo != null && estadoPromo({
    precio_promo: promo,
    promo_inicio: joya.promo_inicio,
    promo_fin: joya.promo_fin,
  }) === "vigente";
  const galeria = galeriaDe(joya.id, fotos, imagenUrl);
  return {
    id: joya.id,
    nombre: joya.nombre,
    categoria,
    material: material ?? copy.catalogo.material,
    descripcion: limpio(joya.frase) ?? "",
    detalle: limpio(joya.descripcion) ?? "",
    precio: vigente ? formatoPesos(promo) : normal,
    precioAnterior: vigente ? normal : null,
    promoEtiqueta: vigente ? limpio(joya.promo_etiqueta) : null,
    imagen: imagenUrl ? null : esImagenNombre(joya.imagen_local) ? joya.imagen_local : null,
    imagenUrl: galeria[0] ?? imagenUrl,
    alt: limpio(joya.alt) ?? joya.nombre,
    galeria,
    destacada: joya.destacada === true,
  };
}

function galeriaDe(id: string, fotos: FilaFoto[], imagenUrl: string | null): string[] {
  const propias = fotos
    .filter((foto) => foto.joya_id === id && limpio(foto.url))
    .sort((a, b) => Number(b.es_principal) - Number(a.es_principal) || (a.orden ?? 0) - (b.orden ?? 0))
    .map((foto) => limpio(foto.url) as string);
  if (propias.length) return propias;
  return imagenUrl ? [imagenUrl] : [];
}

function aNumero(valor: number | string | null): number | null {
  if (valor == null || valor === "") return null;
  const numero = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function precioTexto(valor: number | string | null): string {
  if (valor === null || valor === "") return copy.catalogo.precio;
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(numero)) return copy.catalogo.precio;
  return formatoPesos(numero);
}

function limpio(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const texto = valor.trim();
  return texto || null;
}
