import { useEffect, useState } from "react";
import { esImagenNombre } from "../lib/imagen.ts";
import { supabase } from "../lib/supabase.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { borrarFoto, subirFoto, validarArchivo } from "./foto.ts";
import { Barra, Boton, ErrorCarga, Esqueleto, Progreso, VistaFoto } from "./ui.tsx";

const LIMITE_FRASE = 200;

type Categoria = {
  id: string;
  nombre: string;
  linea: string;
  imagen_url: string | null;
  imagen_local: string | null;
  activa: boolean;
};

type Aviso = (texto: string, error?: boolean, detalle?: string) => void;
type Props = { avisar: Aviso; onSucio: (sucio: boolean) => void; onSesion: () => void };

export function Categorias({ avisar, onSucio, onSesion }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [base, setBase] = useState<Categoria[]>([]);
  const [archivos, setArchivos] = useState<Record<string, File | null>>({});
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("categorias")
      .select("id,nombre,linea,imagen_url,imagen_local,activa,orden")
      .order("orden", { ascending: true })
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          if (esSesionVencida(error)) onSesion();
          else setFallo(textoError(error ?? "Sin datos"));
          setListo(true);
          return;
        }
        const filas = data.map((fila) => ({
          id: String(fila.id),
          nombre: String(fila.nombre ?? ""),
          linea: String(fila.linea ?? ""),
          imagen_url: fila.imagen_url ? String(fila.imagen_url) : null,
          imagen_local: fila.imagen_local ? String(fila.imagen_local) : null,
          activa: fila.activa !== false,
        }));
        setCategorias(filas);
        setBase(filas);
        setArchivos({});
        setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const sucio = categorias.some((cat) => {
    const origen = base.find((item) => item.id === cat.id);
    if (!origen) return false;
    return origen.linea !== cat.linea || origen.activa !== cat.activa || Boolean(archivos[cat.id]);
  });

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function actualizar(id: string, cambio: Partial<Categoria>) {
    setCategorias((lista) => lista.map((cat) => (cat.id === id ? { ...cat, ...cambio } : cat)));
  }

  function descartar() {
    setCategorias(base);
    setArchivos({});
  }

  function elegir(id: string, archivo: File | null) {
    if (!archivo) {
      setArchivos((mapa) => ({ ...mapa, [id]: null }));
      return;
    }
    const motivo = validarArchivo(archivo);
    if (motivo) {
      avisar(motivo, true);
      return;
    }
    setArchivos((mapa) => ({ ...mapa, [id]: archivo }));
  }

  async function guardar() {
    if (guardando || !sucio) return;
    const pendientes = categorias.filter((cat) => {
      const origen = base.find((item) => item.id === cat.id);
      if (!origen) return false;
      return origen.linea !== cat.linea || origen.activa !== cat.activa || Boolean(archivos[cat.id]);
    });
    if (pendientes.some((cat) => cat.linea.trim().length > LIMITE_FRASE)) {
      avisar("La frase puede tener hasta 200 caracteres.", true);
      return;
    }
    setGuardando(true);
    const guardadas: Categoria[] = [];
    try {
      for (const cat of pendientes) {
        const origen = base.find((item) => item.id === cat.id);
        if (!origen) continue;
        const linea = cat.linea.trim();
        const archivo = archivos[cat.id] ?? null;
        let subida: string | null = null;
        if (archivo) {
          setProgreso(0);
          subida = await subirFoto(archivo, setProgreso);
        }
        const { data, error } = await supabase
          .from("categorias")
          .update({ linea, activa: cat.activa, ...(subida ? { imagen_url: subida } : {}) })
          .eq("id", cat.id)
          .select("id");
        if (error || !data?.length) {
          await borrarFoto(subida);
          if (esSesionVencida(error)) onSesion();
          else avisar("No se pudo guardar.", true, textoError(error));
          return;
        }
        if (subida) await borrarFoto(origen.imagen_url);
        guardadas.push({ ...cat, linea, imagen_url: subida ?? origen.imagen_url });
        setArchivos((mapa) => ({ ...mapa, [cat.id]: null }));
      }
      avisar("Categorías guardadas.");
    } catch (error) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
    } finally {
      if (guardadas.length > 0) {
        const mapa = new Map(guardadas.map((cat) => [cat.id, cat]));
        setBase((actual) => actual.map((cat) => mapa.get(cat.id) ?? cat));
        setCategorias((lista) => lista.map((cat) => mapa.get(cat.id) ?? cat));
      }
      setGuardando(false);
      setProgreso(null);
    }
  }

  if (!listo) return <Esqueleto filas={6} />;
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
    <div className="mt-6 min-w-0 pb-28">
      <ul>
        {categorias.map((cat) => {
          const local = esImagenNombre(cat.imagen_local)
            ? `${import.meta.env.BASE_URL}img/${cat.imagen_local}.webp`
            : null;
          return (
            <li key={cat.id} className="flex min-w-0 gap-3 border-t border-gold-line py-4">
              <VistaFoto
                archivo={archivos[cat.id] ?? null}
                url={cat.imagen_url || local}
                className="aspect-[4/5] w-16 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate font-serif text-2xl text-ink">{cat.nombre}</h2>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cat.activa}
                    aria-label={cat.activa ? `Desactivar ${cat.nombre}` : `Activar ${cat.nombre}`}
                    onClick={() => actualizar(cat.id, { activa: !cat.activa })}
                    className="inline-flex min-h-11 min-w-11 items-center justify-end"
                  >
                    <span className={`relative h-7 w-12 rounded-full ${cat.activa ? "bg-ink" : "border border-gold-line bg-paper"}`}>
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full ${cat.activa ? "left-5 bg-ivory" : "left-0.5 bg-ink"}`}
                      />
                    </span>
                  </button>
                </div>
                <label htmlFor={`linea-${cat.id}`} className="mt-2 block text-xs tracking-[0.16em] text-gold uppercase">
                  Frase
                </label>
                <textarea
                  id={`linea-${cat.id}`}
                  rows={2}
                  value={cat.linea}
                  maxLength={LIMITE_FRASE}
                  onChange={(event) => actualizar(cat.id, { linea: event.target.value })}
                  className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-2 text-base text-ink outline-none"
                />
                <p className="mt-1 text-right text-xs text-muted">
                  {cat.linea.length}/{LIMITE_FRASE}
                </p>
                <label className="mt-1 inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const archivo = event.target.files?.[0] ?? null;
                      event.currentTarget.value = "";
                      elegir(cat.id, archivo);
                    }}
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ul>
      <Barra>
        {progreso != null ? <Progreso valor={progreso} /> : null}
        <div className="grid grid-cols-2 gap-2">
          <Boton disabled={!sucio || guardando} className="sm:w-full" onClick={() => void guardar()}>
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          <Boton secundario disabled={!sucio || guardando} className="sm:w-full" onClick={descartar}>
            Cancelar
          </Boton>
        </div>
      </Barra>
    </div>
  );
}
