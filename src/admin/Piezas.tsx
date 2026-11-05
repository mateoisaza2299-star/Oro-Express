import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { esImagenNombre } from "../lib/imagen.ts";
import { supabase } from "../lib/supabase.ts";
import { borrarFoto, esFotoAdmitida, subirFoto } from "./foto.ts";
import { Area, Boton, Campo, FotoField } from "./ui.tsx";

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
  archivo: File | null;
};

type Props = { avisar: (texto: string, error?: boolean) => void };

export function Piezas({ avisar }: Props) {
  const [piezas, setPiezas] = useState<Joya[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

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
      if (cats.error || joyas.error || !cats.data || !joyas.data) {
        avisar("No se pudieron cargar las piezas.", true);
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
  }, [avisar]);

  function nombreCategoria(id: string) {
    return categorias.find((cat) => cat.id === id)?.nombre ?? "";
  }

  function empezar() {
    setBorrador({
      id: null,
      nombre: "",
      categoriaId: categorias[0]?.id ?? "",
      frase: "",
      material: "",
      precio: "",
      imagenUrl: null,
      archivo: null,
    });
  }

  function editar(pieza: Joya) {
    setBorrador({
      id: pieza.id,
      nombre: pieza.nombre,
      categoriaId: pieza.categoria_id,
      frase: pieza.frase,
      material: pieza.material ?? "",
      precio: pieza.precio == null ? "" : String(pieza.precio),
      imagenUrl: urlVisible(pieza),
      archivo: null,
    });
  }

  async function cambiarActiva(pieza: Joya) {
    const activa = !pieza.activa;
    const { data, error } = await supabase.from("joyas").update({ activa }).eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      avisar("No se pudo actualizar.", true);
      return;
    }
    setPiezas((lista) => lista.map((item) => (item.id === pieza.id ? { ...item, activa } : item)));
    avisar(activa ? "Pieza habilitada." : "Pieza deshabilitada.");
  }

  async function eliminar(pieza: Joya) {
    if (!window.confirm(`¿Eliminar «${pieza.nombre}»?`)) return;
    const { data, error } = await supabase.from("joyas").delete().eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      avisar("No se pudo eliminar.", true);
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
    if (!borrador.id && !borrador.archivo) {
      avisar("Elige una foto.", true);
      return;
    }
    if (borrador.archivo && !esFotoAdmitida(borrador.archivo)) {
      avisar("La foto tiene que ser JPG, PNG o WebP.", true);
      return;
    }

    setGuardando(true);
    let subida: string | null = null;
    const material = borrador.material.trim() || null;
    const precio = borrador.precio ? Number(borrador.precio) : null;
    try {
      if (borrador.archivo) subida = await subirFoto(borrador.archivo);
      const campos = {
        categoria_id: borrador.categoriaId,
        nombre,
        frase,
        alt: nombre,
        material,
        precio,
        ...(subida ? { imagen_url: subida } : {}),
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
          avisar("No se pudo guardar.", true);
          return;
        }
        setPiezas((lista) => [...lista, normalizar(data)].sort((a, b) => a.orden - b.orden));
        setBorrador(null);
        avisar("Pieza guardada.");
        return;
      }
      const { data, error } = await supabase.from("joyas").update(campos).eq("id", borrador.id).select("id");
      if (error || !data?.length) {
        await borrarFoto(subida);
        avisar("No se pudo guardar.", true);
        return;
      }
      if (subida) await borrarFoto(borrador.imagenUrl);
      const id = borrador.id;
      setPiezas((lista) =>
        lista.map((item) =>
          item.id === id
            ? { ...item, categoria_id: campos.categoria_id, nombre, frase, alt: nombre, material, precio, imagen_url: subida ?? item.imagen_url }
            : item,
        ),
      );
      setBorrador(null);
      avisar("Pieza guardada.");
    } catch {
      await borrarFoto(subida);
      avisar("No se pudo guardar.", true);
    } finally {
      setGuardando(false);
    }
  }

  if (!listo) return <p className="mt-6 text-sm text-muted">Cargando piezas…</p>;

  if (borrador) {
    return (
      <form className="mt-6 min-w-0" onSubmit={guardar} noValidate>
        <Campo
          id="pieza-nombre"
          etiqueta="Nombre"
          value={borrador.nombre}
          maxLength={LIMITE_NOMBRE}
          onChange={(nombre) => setBorrador({ ...borrador, nombre })}
        />
        <div className="mt-5 min-w-0">
          <label htmlFor="pieza-categoria" className="text-xs tracking-[0.16em] text-gold uppercase">
            Categoría
          </label>
          <select
            id="pieza-categoria"
            value={borrador.categoriaId}
            onChange={(event) => setBorrador({ ...borrador, categoriaId: event.target.value })}
            className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <Area
          id="pieza-frase"
          etiqueta="Frase corta"
          value={borrador.frase}
          maxLength={LIMITE_FRASE}
          onChange={(frase) => setBorrador({ ...borrador, frase })}
        />
        <Campo
          id="pieza-material"
          etiqueta="Material (opcional)"
          value={borrador.material}
          onChange={(material) => setBorrador({ ...borrador, material })}
        />
        <Campo
          id="pieza-precio"
          etiqueta="Precio (opcional)"
          value={borrador.precio}
          inputMode="numeric"
          onChange={(precio) => setBorrador({ ...borrador, precio: precio.replace(/\D/g, "") })}
        />
        <FotoField
          id="pieza-foto"
          archivo={borrador.archivo}
          url={borrador.imagenUrl}
          onArchivo={(archivo) => setBorrador({ ...borrador, archivo })}
        />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          <Boton secundario disabled={guardando} onClick={() => setBorrador(null)}>
            Cancelar
          </Boton>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-6 min-w-0">
      <Boton onClick={empezar}>Añadir pieza</Boton>
      <ul className="mt-4 border-t border-gold-line">
        {piezas.map((pieza) => (
          <li key={pieza.id} className="border-b border-gold-line py-4">
            <div className="flex min-w-0 gap-3">
              <Miniatura pieza={pieza} />
              <div className="min-w-0">
                <p className="truncate font-serif text-2xl leading-tight text-ink">{pieza.nombre}</p>
                <p className="mt-1 text-xs tracking-[0.14em] text-gold uppercase">
                  {nombreCategoria(pieza.categoria_id) || "Sin categoría"}
                  <span className="text-muted"> · {pieza.activa ? "Visible" : "Oculta"}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Boton onClick={() => editar(pieza)}>Editar</Boton>
              <Boton secundario onClick={() => void cambiarActiva(pieza)}>
                {pieza.activa ? "Deshabilitar" : "Habilitar"}
              </Boton>
              <Boton secundario onClick={() => void eliminar(pieza)}>
                Eliminar
              </Boton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Miniatura({ pieza }: { pieza: Joya }) {
  const src = urlVisible(pieza);
  return (
    <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
      {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
    </span>
  );
}

function urlVisible(pieza: Joya) {
  if (pieza.imagen_url) return pieza.imagen_url;
  if (esImagenNombre(pieza.imagen_local)) return `${import.meta.env.BASE_URL}img/${pieza.imagen_local}.webp`;
  return null;
}

async function siguienteOrden() {
  const { data, error } = await supabase.from("joyas").select("orden").order("orden", { ascending: false }).limit(1);
  if (error) throw new Error("orden");
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
