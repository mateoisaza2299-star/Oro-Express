import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { esImagenNombre } from "../lib/imagen.ts";
import { supabase } from "../lib/supabase.ts";
import type { PanelProps } from "./comun.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { borrarFoto, subirFoto, validarArchivo } from "./foto.ts";
import { Boton, ErrorCarga, Esqueleto, Interruptor, Progreso, VistaFoto } from "./ui.tsx";

const LIMITE_NOMBRE = 80;
const LIMITE_LINEA = 200;

type Categoria = {
  id: string;
  nombre: string;
  linea: string;
  alt: string;
  imagen_url: string | null;
  imagen_local: string | null;
  activa: boolean;
  orden: number;
  joyas: number;
};

type Borrador = {
  id: string | null;
  nombre: string;
  linea: string;
  alt: string;
  imagenUrl: string | null;
  imagenLocal: string | null;
  archivo: File | null;
  quitar: boolean;
  activa: boolean;
};

export function Categorias({ avisar, onSucio, onSesion }: PanelProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [origen, setOrigen] = useState("");
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    void Promise.all([
      supabase.from("categorias").select("id,nombre,linea,alt,imagen_url,imagen_local,activa,orden").order("orden", { ascending: true }),
      supabase.from("joyas").select("categoria_id"),
    ]).then(([cats, joyas]) => {
      if (!vivo) return;
      if (cats.error || !cats.data) {
        if (esSesionVencida(cats.error)) onSesion();
        else setFallo(textoError(cats.error ?? "Sin datos"));
        setListo(true);
        return;
      }
      const cuentas = new Map<string, number>();
      for (const fila of joyas.data ?? []) {
        const id = String(fila.categoria_id);
        cuentas.set(id, (cuentas.get(id) ?? 0) + 1);
      }
      setCategorias(
        cats.data.map((fila) => ({
          id: String(fila.id),
          nombre: String(fila.nombre ?? ""),
          linea: String(fila.linea ?? ""),
          alt: String(fila.alt ?? ""),
          imagen_url: fila.imagen_url ? String(fila.imagen_url) : null,
          imagen_local: fila.imagen_local ? String(fila.imagen_local) : null,
          activa: fila.activa !== false,
          orden: Number(fila.orden) || 0,
          joyas: cuentas.get(String(fila.id)) ?? 0,
        })),
      );
      setListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const sucio = borrador ? firma(borrador) !== origen : false;

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function abrir(siguiente: Borrador) {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setProgreso(null);
    setBorrador(siguiente);
    setOrigen(firma(siguiente));
  }

  function cerrar() {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setBorrador(null);
    setOrigen("");
  }

  async function cambiarActiva(cat: Categoria, activa: boolean) {
    const { data, error } = await supabase.from("categorias").update({ activa }).eq("id", cat.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo actualizar.", true, textoError(error));
      return;
    }
    setCategorias((lista) => lista.map((item) => (item.id === cat.id ? { ...item, activa } : item)));
    avisar(activa ? "Categoría activa." : "Categoría oculta.");
  }

  async function eliminar(cat: Categoria) {
    if (cat.joyas > 0) {
      const ocultar = window.confirm(`«${cat.nombre}» tiene ${cat.joyas} ${cat.joyas === 1 ? "joya" : "joyas"}. No se puede eliminar. ¿Ocultarla?`);
      if (ocultar) await cambiarActiva(cat, false);
      return;
    }
    if (!window.confirm(`¿Eliminar «${cat.nombre}»?`)) return;
    const { data, error } = await supabase.from("categorias").delete().eq("id", cat.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo eliminar.", true, textoError(error));
      return;
    }
    await borrarFoto(cat.imagen_url);
    setCategorias((lista) => lista.filter((item) => item.id !== cat.id));
    avisar("Categoría eliminada.");
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borrador || guardando) return;
    const nombre = borrador.nombre.trim();
    const linea = borrador.linea.trim();
    if (!nombre) {
      avisar("Escribe el nombre.", true);
      return;
    }
    if (nombre.length > LIMITE_NOMBRE) {
      avisar("El nombre puede tener hasta 80 caracteres.", true);
      return;
    }
    if (linea.length > LIMITE_LINEA) {
      avisar("La frase puede tener hasta 200 caracteres.", true);
      return;
    }
    if (borrador.archivo) {
      const motivo = validarArchivo(borrador.archivo);
      if (motivo) {
        avisar(motivo, true);
        return;
      }
    }
    setGuardando(true);
    setProgreso(borrador.archivo ? 0 : null);
    let subida: string | null = null;
    try {
      const alt = borrador.alt.trim() || nombre;
      let id = borrador.id;
      if (!id) {
        const orden = categorias.reduce((max, item) => Math.max(max, item.orden), -1) + 1;
        const { data, error } = await supabase
          .from("categorias")
          .insert({
            nombre,
            linea,
            alt,
            imagen_url: null,
            imagen_local: null,
            posicion: "object-center",
            activa: borrador.activa,
            orden,
          })
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("No se pudo guardar.");
        id = String(data.id);
      }
      if (borrador.archivo) subida = await subirFoto(borrador.archivo, setProgreso, `categorias/${id}`);
      const imagenUrl = subida ?? (borrador.quitar ? null : borrador.imagenUrl);
      const { data, error } = await supabase
        .from("categorias")
        .update({
          nombre,
          linea,
          alt,
          activa: borrador.activa,
          imagen_url: imagenUrl,
          ...(subida || borrador.quitar ? { imagen_local: null } : {}),
        })
        .eq("id", id)
        .select("id,nombre,linea,alt,imagen_url,imagen_local,activa,orden")
        .single();
      if (error || !data) {
        await borrarFoto(subida);
        throw error ?? new Error("No se pudo guardar.");
      }
      if ((subida || borrador.quitar) && borrador.imagenUrl && borrador.imagenUrl !== imagenUrl) await borrarFoto(borrador.imagenUrl);
      const guardada: Categoria = {
        id,
        nombre: String(data.nombre ?? nombre),
        linea: String(data.linea ?? ""),
        alt: String(data.alt ?? alt),
        imagen_url: data.imagen_url ? String(data.imagen_url) : null,
        imagen_local: data.imagen_local ? String(data.imagen_local) : null,
        activa: data.activa !== false,
        orden: Number(data.orden) || 0,
        joyas: categorias.find((cat) => cat.id === id)?.joyas ?? 0,
      };
      setCategorias((lista) => {
        const existe = lista.some((cat) => cat.id === id);
        const siguiente = existe ? lista.map((cat) => (cat.id === id ? guardada : cat)) : [...lista, guardada];
        return siguiente.sort((a, b) => a.orden - b.orden);
      });
      setBorrador(null);
      setOrigen("");
      avisar("Categoría guardada.");
    } catch (error) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
    } finally {
      setGuardando(false);
      setProgreso(null);
    }
  }

  if (!listo) return <Esqueleto filas={4} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudieron cargar las categorías."
        detalle={fallo}
        onReintentar={() => {
          setListo(false);
          setFallo("");
          setIntento((valor) => valor + 1);
        }}
      />
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl text-ink">Categorías</h1>
        <Boton
          onClick={() =>
            abrir({
              id: null,
              nombre: "",
              linea: "",
              alt: "",
              imagenUrl: null,
              imagenLocal: null,
              archivo: null,
              quitar: false,
              activa: true,
            })
          }
        >
          Nueva categoría
        </Boton>
      </div>
      {categorias.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Todavía no hay categorías.</p>
      ) : (
        <ul className="mt-4 border-t border-gold-line">
          {categorias.map((cat) => (
            <li key={cat.id} className="border-b border-gold-line py-3">
              <div className="flex min-w-0 gap-3">
                <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                  <VistaFoto archivo={null} url={urlCategoria(cat)} className="absolute inset-0 h-full w-full object-cover" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-serif text-xl text-ink">{cat.nombre}</p>
                  <p className="mt-1 text-xs text-muted">
                    {cat.activa ? "Activa" : "Oculta"}
                    {cat.joyas ? ` · ${cat.joyas} ${cat.joyas === 1 ? "joya" : "joyas"}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Interruptor
                  activo={cat.activa}
                  etiqueta={cat.activa ? `Ocultar ${cat.nombre}` : `Activar ${cat.nombre}`}
                  onChange={(activa) => void cambiarActiva(cat, activa)}
                />
                <Boton className="w-auto" onClick={() => abrir(desdeCategoria(cat))}>
                  Editar
                </Boton>
                <Boton className="w-auto" secundario onClick={() => void eliminar(cat)}>
                  Eliminar
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}
      {borrador ? (
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-categoria"
          className="fixed inset-0 z-50 flex justify-end bg-ink/40"
          onSubmit={(event) => void guardar(event)}
          noValidate
        >
          <button type="button" className="absolute inset-0" aria-label="Cerrar el formulario" onClick={cerrar} />
          <div className="relative flex h-dvh w-full min-w-0 flex-col bg-ivory lg:w-[28rem] lg:border-l lg:border-gold-line">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              <h2 id="titulo-categoria" className="font-serif text-3xl text-ink">
                {borrador.id ? "Editar categoría" : "Nueva categoría"}
              </h2>
              <label htmlFor="categoria-nombre" className="mt-6 block text-xs tracking-[0.16em] text-gold uppercase">
                Nombre *
              </label>
              <input
                id="categoria-nombre"
                value={borrador.nombre}
                maxLength={LIMITE_NOMBRE}
                disabled={guardando}
                onChange={(event) => setBorrador({ ...borrador, nombre: event.target.value })}
                className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
              />
              <p className="mt-1 text-right text-xs text-muted">
                {borrador.nombre.length}/{LIMITE_NOMBRE}
              </p>
              <label htmlFor="categoria-linea" className="mt-5 block text-xs tracking-[0.16em] text-gold uppercase">
                Frase
              </label>
              <textarea
                id="categoria-linea"
                rows={3}
                value={borrador.linea}
                maxLength={LIMITE_LINEA}
                disabled={guardando}
                onChange={(event) => setBorrador({ ...borrador, linea: event.target.value })}
                className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
              />
              <p className="mt-1 text-right text-xs text-muted">
                {borrador.linea.length}/{LIMITE_LINEA}
              </p>
              <div className="mt-5">
                <p className="text-xs tracking-[0.16em] text-gold uppercase">Imagen</p>
                <VistaFoto
                  archivo={borrador.archivo}
                  url={borrador.quitar ? null : borrador.imagenUrl || urlLocal(borrador.imagenLocal)}
                  className="mt-3 aspect-[4/5] w-28 object-cover"
                />
                <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center bg-ink px-4 text-xs tracking-[0.12em] text-ivory uppercase">
                  Elegir imagen
                  <input
                    id="categoria-foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={guardando}
                    onChange={(event) => {
                      const archivo = event.target.files?.[0] ?? null;
                      event.currentTarget.value = "";
                      if (!archivo || !borrador) return;
                      const motivo = validarArchivo(archivo);
                      if (motivo) {
                        avisar(motivo, true);
                        return;
                      }
                      setBorrador({ ...borrador, archivo, quitar: false });
                    }}
                  />
                </label>
                {borrador.archivo || (!borrador.quitar && (borrador.imagenUrl || borrador.imagenLocal)) ? (
                  <button
                    type="button"
                    className="mt-2 ml-3 inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase"
                    onClick={() => setBorrador({ ...borrador, archivo: null, quitar: true })}
                  >
                    Quitar imagen
                  </button>
                ) : null}
                {progreso != null ? (
                  <div className="mt-3">
                    <Progreso valor={progreso} />
                  </div>
                ) : null}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-ink">Activa</span>
                <Interruptor activo={borrador.activa} etiqueta="Categoría activa" onChange={(activa) => setBorrador({ ...borrador, activa })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-gold-line px-5 py-3">
              <Boton type="submit" disabled={guardando} className="sm:w-full">
                {guardando ? "Guardando…" : "Guardar"}
              </Boton>
              <Boton secundario disabled={guardando} className="sm:w-full" onClick={cerrar}>
                Cancelar
              </Boton>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function desdeCategoria(cat: Categoria): Borrador {
  return {
    id: cat.id,
    nombre: cat.nombre,
    linea: cat.linea,
    alt: cat.alt,
    imagenUrl: cat.imagen_url,
    imagenLocal: cat.imagen_local,
    archivo: null,
    quitar: false,
    activa: cat.activa,
  };
}

function firma(borrador: Borrador) {
  return JSON.stringify({
    ...borrador,
    archivo: borrador.archivo ? `${borrador.archivo.name}:${borrador.archivo.size}` : "",
  });
}

function urlLocal(nombre: string | null) {
  if (!esImagenNombre(nombre)) return null;
  return `${import.meta.env.BASE_URL}img/${nombre}.webp`;
}

function urlCategoria(cat: Categoria) {
  return cat.imagen_url || urlLocal(cat.imagen_local);
}
