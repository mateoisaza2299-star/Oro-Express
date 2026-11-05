import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { copy } from "../content/es.ts";
import { esImagenNombre } from "../lib/imagen.ts";
import { formatoPesos } from "../lib/precio.ts";
import { supabase } from "../lib/supabase.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { borrarFoto, subirFoto, validarArchivo } from "./foto.ts";
import { Boton, ErrorCarga, Esqueleto, FotoField, VistaFoto } from "./ui.tsx";

const LIMITE_NOMBRE = 120;
const LIMITE_FRASE = 200;

type Categoria = { id: string; nombre: string };

type Joya = {
  id: string;
  categoria_id: string;
  nombre: string;
  frase: string;
  alt: string;
  material: string | null;
  precio: number | null;
  imagen_url: string | null;
  imagen_local: string | null;
  activa: boolean;
  orden: number;
};

type Borrador = {
  id: string | null;
  nombre: string;
  categoriaId: string;
  frase: string;
  material: string;
  precio: string;
  imagenUrl: string | null;
  imagenLocal: string | null;
  archivo: File | null;
  sinRemota: boolean;
};

type Aviso = (texto: string, error?: boolean, detalle?: string) => void;
type Props = { avisar: Aviso; onSucio: (sucio: boolean) => void; onSesion: () => void };

export function Piezas({ avisar, onSucio, onSesion }: Props) {
  const [piezas, setPiezas] = useState<Joya[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [origen, setOrigen] = useState<Borrador | null>(null);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");

  useEffect(() => {
    let vivo = true;
    void Promise.all([
      supabase.from("categorias").select("id,nombre,orden").order("orden", { ascending: true }),
      supabase
        .from("joyas")
        .select("id,categoria_id,nombre,frase,alt,material,precio,imagen_url,imagen_local,activa,orden")
        .order("orden", { ascending: true }),
    ]).then(([cats, joyas]) => {
      if (!vivo) return;
      const error = cats.error ?? joyas.error;
      if (error || !cats.data || !joyas.data) {
        if (esSesionVencida(error)) onSesion();
        else setFallo(textoError(error ?? "Sin datos"));
        setListo(true);
        return;
      }
      setCategorias(cats.data.map((fila) => ({ id: String(fila.id), nombre: String(fila.nombre) })));
      setPiezas(joyas.data.map((fila) => normalizar(fila)));
      setListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const sucio = borrador && origen ? distinto(borrador, origen) : false;

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function nombreCategoria(id: string) {
    return categorias.find((cat) => cat.id === id)?.nombre ?? "";
  }

  function abrir(siguiente: Borrador) {
    setFotoError(null);
    setProgreso(null);
    setBorrador(siguiente);
    setOrigen(siguiente);
  }

  function empezar() {
    abrir({
      id: null,
      nombre: "",
      categoriaId: categorias[0]?.id ?? "",
      frase: "",
      material: "",
      precio: "",
      imagenUrl: null,
      imagenLocal: null,
      archivo: null,
      sinRemota: false,
    });
  }

  function editar(pieza: Joya) {
    abrir({
      id: pieza.id,
      nombre: pieza.nombre,
      categoriaId: pieza.categoria_id,
      frase: pieza.frase,
      material: pieza.material ?? "",
      precio: pieza.precio == null ? "" : String(pieza.precio),
      imagenUrl: pieza.imagen_url,
      imagenLocal: pieza.imagen_local,
      archivo: null,
      sinRemota: false,
    });
  }

  const cerrar = useCallback(() => {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setBorrador(null);
    setOrigen(null);
    setFotoError(null);
  }, [sucio]);

  function elegirFoto(archivo: File | null) {
    if (!borrador) return;
    if (!archivo) {
      setBorrador({ ...borrador, archivo: null });
      return;
    }
    const motivo = validarArchivo(archivo);
    if (motivo) {
      setFotoError(motivo);
      return;
    }
    setFotoError(null);
    setBorrador({ ...borrador, archivo });
  }

  function quitarFoto() {
    if (!borrador) return;
    if (borrador.archivo) {
      setBorrador({ ...borrador, archivo: null });
      return;
    }
    if (!borrador.sinRemota && borrador.imagenUrl) setBorrador({ ...borrador, sinRemota: true });
  }

  async function cambiarActiva(pieza: Joya) {
    const activa = !pieza.activa;
    const { data, error } = await supabase.from("joyas").update({ activa }).eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo actualizar.", true, textoError(error));
      return;
    }
    setPiezas((lista) => lista.map((item) => (item.id === pieza.id ? { ...item, activa } : item)));
    avisar(activa ? "Pieza habilitada." : "Pieza deshabilitada.");
  }

  async function eliminar(pieza: Joya) {
    if (!window.confirm(`¿Eliminar «${pieza.nombre}»?`)) return;
    const { data, error } = await supabase.from("joyas").delete().eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo eliminar.", true, textoError(error));
      return;
    }
    await borrarFoto(pieza.imagen_url);
    setPiezas((lista) => lista.filter((item) => item.id !== pieza.id));
    avisar("Pieza eliminada.");
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borrador || guardando) return;
    const nombre = borrador.nombre.trim();
    const frase = borrador.frase.trim();
    if (!nombre) {
      avisar("Escribe el nombre.", true);
      return;
    }
    if (nombre.length > LIMITE_NOMBRE) {
      avisar("El nombre puede tener hasta 120 caracteres.", true);
      return;
    }
    if (frase.length > LIMITE_FRASE) {
      avisar("La frase puede tener hasta 200 caracteres.", true);
      return;
    }
    if (!borrador.categoriaId) {
      avisar("Elige una categoría.", true);
      return;
    }
    if (!/^\d*$/.test(borrador.precio)) {
      avisar("El precio solo admite números.", true);
      return;
    }
    if (!borrador.id && !borrador.archivo && !( !borrador.sinRemota && borrador.imagenUrl) && !borrador.imagenLocal) {
      avisar("Elige una foto.", true);
      return;
    }
    if (borrador.archivo) {
      const motivo = validarArchivo(borrador.archivo);
      if (motivo) {
        setFotoError(motivo);
        return;
      }
    }

    setGuardando(true);
    setProgreso(borrador.archivo ? 0 : null);
    let subida: string | null = null;
    const material = borrador.material.trim() || null;
    const precio = borrador.precio ? Number(borrador.precio) : null;
    const anterior = borrador.imagenUrl;
    try {
      if (borrador.archivo) subida = await subirFoto(borrador.archivo, setProgreso);
      const imagenUrl = subida ?? (borrador.sinRemota ? null : anterior);
      const campos = {
        categoria_id: borrador.categoriaId,
        nombre,
        frase,
        alt: nombre,
        material,
        precio,
        ...(subida || borrador.sinRemota ? { imagen_url: imagenUrl } : {}),
      };
      if (!borrador.id) {
        const orden = await siguienteOrden();
        const { data, error } = await supabase
          .from("joyas")
          .insert({ ...campos, imagen_url: subida, imagen_local: null, destacada: false, activa: true, orden })
          .select("id,categoria_id,nombre,frase,alt,material,precio,imagen_url,imagen_local,activa,orden")
          .single();
        if (error || !data) {
          await borrarFoto(subida);
          if (esSesionVencida(error)) onSesion();
          else avisar("No se pudo guardar.", true, textoError(error));
          return;
        }
        setPiezas((lista) => [...lista, normalizar(data)].sort((a, b) => a.orden - b.orden));
        setBorrador(null);
        setOrigen(null);
        avisar("Pieza guardada.");
        return;
      }
      const { data, error } = await supabase.from("joyas").update(campos).eq("id", borrador.id).select("id");
      if (error || !data?.length) {
        await borrarFoto(subida);
        if (esSesionVencida(error)) onSesion();
        else avisar("No se pudo guardar.", true, textoError(error));
        return;
      }
      if (subida || borrador.sinRemota) await borrarFoto(anterior);
      const id = borrador.id;
      setPiezas((lista) =>
        lista.map((item) =>
          item.id === id
            ? {
                ...item,
                categoria_id: campos.categoria_id,
                nombre,
                frase,
                alt: nombre,
                material,
                precio,
                imagen_url: subida ? subida : borrador.sinRemota ? null : item.imagen_url,
              }
            : item,
        ),
      );
      setBorrador(null);
      setOrigen(null);
      avisar("Pieza guardada.");
    } catch (error) {
      await borrarFoto(subida);
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
    } finally {
      setGuardando(false);
      setProgreso(null);
    }
  }

  if (!listo) return <Esqueleto filas={5} />;
  if (fallo) {
    return (
        <ErrorCarga
          texto="No se pudieron cargar las piezas."
          detalle={fallo}
          onReintentar={() => {
            setListo(false);
            setFallo("");
            setIntento((valor) => valor + 1);
          }}
        />
    );
  }

  const visibles = piezas.filter((pieza) => {
    if (busqueda.trim() && !pieza.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) return false;
    if (filtroCategoria && pieza.categoria_id !== filtroCategoria) return false;
    if (filtroEstado === "activas" && !pieza.activa) return false;
    if (filtroEstado === "deshabilitadas" && pieza.activa) return false;
    return true;
  });
  const cuenta = `${visibles.length} ${visibles.length === 1 ? "pieza" : "piezas"}`;

  return (
    <div className="mt-6 min-w-0">
      <Boton onClick={empezar}>Añadir pieza</Boton>
      <div className="mt-4 min-w-0">
        <label htmlFor="buscar-pieza" className="sr-only">
          Buscar por nombre
        </label>
        <input
          id="buscar-pieza"
          value={busqueda}
          placeholder="Buscar por nombre"
          onChange={(event) => setBusqueda(event.target.value)}
          className="w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none placeholder:text-[#9c968c]"
        />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            aria-label="Filtrar por categoría"
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            className="min-h-11 w-full min-w-0 border border-gold-line bg-ivory px-2 text-sm text-ink"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            className="min-h-11 w-full min-w-0 border border-gold-line bg-ivory px-2 text-sm text-ink"
          >
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="deshabilitadas">Deshabilitadas</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-muted">{cuenta}</p>
      </div>
      {visibles.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Ninguna pieza coincide.</p>
      ) : (
        <ul className="mt-2 border-t border-gold-line">
          {visibles.map((pieza) => (
            <li key={pieza.id} className="border-b border-gold-line py-3">
              <div className="flex min-w-0 gap-3">
                <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                  <VistaFoto
                    archivo={null}
                    url={urlPieza(pieza)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-serif text-xl leading-tight text-ink">{pieza.nombre}</p>
                  <p className="mt-1 text-xs tracking-[0.12em] text-gold uppercase">
                    {nombreCategoria(pieza.categoria_id) || "Sin categoría"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {pieza.precio == null ? copy.catalogo.precio : formatoPesos(pieza.precio)}
                    <span> · {pieza.activa ? "Activa" : "Deshabilitada"}</span>
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Boton className="w-auto" onClick={() => editar(pieza)}>
                  Editar
                </Boton>
                <Boton className="w-auto" secundario onClick={() => void cambiarActiva(pieza)}>
                  {pieza.activa ? "Deshabilitar" : "Habilitar"}
                </Boton>
                <Boton className="w-auto" secundario onClick={() => void eliminar(pieza)}>
                  Eliminar
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}
      {borrador ? (
        <Formulario
          borrador={borrador}
          categorias={categorias}
          guardando={guardando}
          progreso={progreso}
          fotoError={fotoError}
          onChange={setBorrador}
          onFoto={elegirFoto}
          onQuitar={quitarFoto}
          onCerrar={cerrar}
          onGuardar={(event) => void guardar(event)}
        />
      ) : null}
    </div>
  );
}

function Formulario({
  borrador,
  categorias,
  guardando,
  progreso,
  fotoError,
  onChange,
  onFoto,
  onQuitar,
  onCerrar,
  onGuardar,
}: {
  borrador: Borrador;
  categorias: Categoria[];
  guardando: boolean;
  progreso: number | null;
  fotoError: string | null;
  onChange: (borrador: Borrador) => void;
  onFoto: (archivo: File | null) => void;
  onQuitar: () => void;
  onCerrar: () => void;
  onGuardar: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const previa = urlBorrador(borrador);
  const categoria = categorias.find((cat) => cat.id === borrador.categoriaId)?.nombre ?? "";
  const precio = borrador.precio ? formatoPesos(Number(borrador.precio)) : copy.catalogo.precio;
  const puedeQuitar = Boolean(borrador.archivo || (!borrador.sinRemota && borrador.imagenUrl));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar el formulario" onClick={onCerrar} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-pieza"
        className="relative flex h-dvh w-full min-w-0 flex-col bg-ivory lg:w-[28rem] lg:border-l lg:border-gold-line"
        onSubmit={onGuardar}
        noValidate
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <h2 id="titulo-pieza" className="font-serif text-3xl text-ink">
            {borrador.id ? "Editar pieza" : "Nueva pieza"}
          </h2>
          <p className="mt-6 text-xs tracking-[0.16em] text-gold uppercase">Así se verá</p>
          <article className="mt-3 w-full max-w-[220px]">
            <span className="relative block aspect-[4/5] overflow-hidden bg-paper">
              <VistaFoto archivo={borrador.archivo} url={previa} className="absolute inset-0 h-full w-full object-cover" />
            </span>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gold-line/70 pt-3">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.16em] text-gold uppercase">{categoria || "Categoría"}</p>
                <p className="mt-1 font-serif text-[1.7rem] leading-tight font-medium break-words text-ink">
                  {borrador.nombre || "Nombre"}
                </p>
              </div>
              <p className="shrink-0 text-xs tracking-[0.16em] text-ink uppercase">{precio}</p>
            </div>
            <p className="mt-3 text-sm leading-snug break-words text-muted">{borrador.frase || "Frase corta"}</p>
          </article>
          <div className="mt-5 min-w-0">
            <label htmlFor="pieza-nombre" className="text-xs tracking-[0.16em] text-gold uppercase">
              Nombre
            </label>
            <input
              id="pieza-nombre"
              value={borrador.nombre}
              maxLength={LIMITE_NOMBRE}
              disabled={guardando}
              onChange={(event) => onChange({ ...borrador, nombre: event.target.value })}
              className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted">
              {borrador.nombre.length}/{LIMITE_NOMBRE}
            </p>
          </div>
          <div className="mt-5 min-w-0">
            <label htmlFor="pieza-categoria" className="text-xs tracking-[0.16em] text-gold uppercase">
              Categoría
            </label>
            <select
              id="pieza-categoria"
              value={borrador.categoriaId}
              disabled={guardando}
              onChange={(event) => onChange({ ...borrador, categoriaId: event.target.value })}
              className="mt-2 min-h-11 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 min-w-0">
            <label htmlFor="pieza-frase" className="text-xs tracking-[0.16em] text-gold uppercase">
              Frase corta
            </label>
            <textarea
              id="pieza-frase"
              rows={3}
              value={borrador.frase}
              maxLength={LIMITE_FRASE}
              disabled={guardando}
              onChange={(event) => onChange({ ...borrador, frase: event.target.value })}
              className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted">
              {borrador.frase.length}/{LIMITE_FRASE}
            </p>
          </div>
          <div className="mt-5 min-w-0">
            <label htmlFor="pieza-material" className="text-xs tracking-[0.16em] text-gold uppercase">
              Material (opcional)
            </label>
            <input
              id="pieza-material"
              value={borrador.material}
              disabled={guardando}
              onChange={(event) => onChange({ ...borrador, material: event.target.value })}
              className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
          </div>
          <div className="mt-5 min-w-0">
            <label htmlFor="pieza-precio" className="text-xs tracking-[0.16em] text-gold uppercase">
              Precio (opcional)
            </label>
            <input
              id="pieza-precio"
              inputMode="numeric"
              value={borrador.precio}
              disabled={guardando}
              onChange={(event) => onChange({ ...borrador, precio: event.target.value.replace(/\D/g, "") })}
              className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
            <p className="mt-1 text-xs text-muted">Si lo dejas vacío, en la página dice «Por WhatsApp».</p>
          </div>
          <FotoField
            id="pieza-foto"
            archivo={borrador.archivo}
            url={previa}
            onArchivo={onFoto}
            onQuitar={puedeQuitar ? onQuitar : undefined}
            progreso={progreso}
            error={fotoError}
            disabled={guardando}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-gold-line bg-ivory px-5 py-3">
          <Boton type="submit" disabled={guardando} className="sm:w-full">
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          <Boton secundario disabled={guardando} className="sm:w-full" onClick={onCerrar}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}

function distinto(a: Borrador, b: Borrador) {
  return (
    a.nombre !== b.nombre ||
    a.categoriaId !== b.categoriaId ||
    a.frase !== b.frase ||
    a.material !== b.material ||
    a.precio !== b.precio ||
    a.sinRemota !== b.sinRemota ||
    a.archivo !== b.archivo
  );
}

function urlLocal(nombre: string | null) {
  if (!esImagenNombre(nombre)) return null;
  return `${import.meta.env.BASE_URL}img/${nombre}.webp`;
}

function urlBorrador(borrador: Borrador) {
  if (!borrador.sinRemota && borrador.imagenUrl) return borrador.imagenUrl;
  return urlLocal(borrador.imagenLocal);
}

function urlPieza(pieza: Joya) {
  if (pieza.imagen_url) return pieza.imagen_url;
  return urlLocal(pieza.imagen_local);
}

async function siguienteOrden() {
  const { data, error } = await supabase.from("joyas").select("orden").order("orden", { ascending: false }).limit(1);
  if (error) throw error;
  const maximo = data?.[0] ? Number(data[0].orden) : 0;
  return (Number.isFinite(maximo) ? maximo : 0) + 1;
}

function normalizar(fila: {
  id: unknown;
  categoria_id: unknown;
  nombre: unknown;
  frase: unknown;
  alt: unknown;
  material: unknown;
  precio: unknown;
  imagen_url: unknown;
  imagen_local: unknown;
  activa: unknown;
  orden: unknown;
}): Joya {
  const precio = fila.precio == null || fila.precio === "" ? null : Number(fila.precio);
  return {
    id: String(fila.id),
    categoria_id: String(fila.categoria_id),
    nombre: String(fila.nombre ?? ""),
    frase: String(fila.frase ?? ""),
    alt: String(fila.alt ?? ""),
    material: fila.material == null || fila.material === "" ? null : String(fila.material),
    precio: precio != null && Number.isFinite(precio) ? Math.round(precio) : null,
    imagen_url: fila.imagen_url ? String(fila.imagen_url) : null,
    imagen_local: fila.imagen_local ? String(fila.imagen_local) : null,
    activa: fila.activa !== false,
    orden: Number(fila.orden) || 0,
  };
}
