import { useEffect, useState } from "react";
import { esImagenNombre } from "../lib/imagen.ts";
import { supabase } from "../lib/supabase.ts";
import { borrarFoto, esFotoAdmitida, subirFoto } from "./foto.ts";
import { Area, Boton, FotoField } from "./ui.tsx";

const LIMITE_FRASE = 200;

type Categoria = {
  id: string;
  nombre: string;
  linea: string;
  imagen_url: string | null;
  imagen_local: string | null;
  activa: boolean;
};

type Props = { avisar: (texto: string, error?: boolean) => void };

export function Categorias({ avisar }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [base, setBase] = useState<Categoria[]>([]);
  const [archivos, setArchivos] = useState<Record<string, File | null>>({});
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("categorias")
      .select("id,nombre,linea,imagen_url,imagen_local,activa,orden")
      .order("orden", { ascending: true })
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          avisar("No se pudieron cargar las categorías.", true);
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
        setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, [avisar]);

  function actualizar(id: string, cambio: Partial<Categoria>) {
    setCategorias((lista) => lista.map((cat) => (cat.id === id ? { ...cat, ...cambio } : cat)));
  }

  async function guardar(cat: Categoria) {
    if (guardando) return;
    const anterior = base.find((item) => item.id === cat.id) ?? cat;
    const linea = cat.linea.trim();
    if (linea.length > LIMITE_FRASE) {
      avisar("La frase puede tener hasta 200 caracteres.", true);
      return;
    }
    const archivo = archivos[cat.id] ?? null;
    if (archivo && !esFotoAdmitida(archivo)) {
      avisar("La foto tiene que ser JPG, PNG o WebP.", true);
      return;
    }
    setGuardando(cat.id);
    let subida: string | null = null;
    try {
      if (archivo) subida = await subirFoto(archivo);
      const { data, error } = await supabase
        .from("categorias")
        .update({ linea, activa: cat.activa, ...(subida ? { imagen_url: subida } : {}) })
        .eq("id", cat.id)
        .select("id");
      if (error || !data?.length) {
        await borrarFoto(subida);
        setCategorias((lista) => lista.map((item) => (item.id === cat.id ? anterior : item)));
        setArchivos((mapa) => ({ ...mapa, [cat.id]: null }));
        avisar("No se pudo guardar.", true);
        return;
      }
      if (subida) await borrarFoto(anterior.imagen_url);
      const guardada = { ...cat, linea, imagen_url: subida ?? anterior.imagen_url };
      setCategorias((lista) => lista.map((item) => (item.id === cat.id ? guardada : item)));
      setBase((lista) => lista.map((item) => (item.id === cat.id ? guardada : item)));
      setArchivos((mapa) => ({ ...mapa, [cat.id]: null }));
      avisar("Categoría guardada.");
    } catch {
      await borrarFoto(subida);
      setCategorias((lista) => lista.map((item) => (item.id === cat.id ? anterior : item)));
      setArchivos((mapa) => ({ ...mapa, [cat.id]: null }));
      avisar("No se pudo guardar.", true);
    } finally {
      setGuardando(null);
    }
  }

  if (!listo) return <p className="mt-6 text-sm text-muted">Cargando categorías…</p>;

  return (
    <ul className="mt-6 min-w-0">
      {categorias.map((cat) => {
        const previa = archivos[cat.id]
          ? null
          : cat.imagen_url ||
            (esImagenNombre(cat.imagen_local) ? `${import.meta.env.BASE_URL}img/${cat.imagen_local}.webp` : null);
        return (
          <li key={cat.id} className="border-t border-gold-line py-6">
            <h2 className="font-serif text-3xl text-ink">{cat.nombre}</h2>
            <Area
              id={`linea-${cat.id}`}
              etiqueta="Frase"
              value={cat.linea}
              maxLength={LIMITE_FRASE}
              onChange={(linea) => actualizar(cat.id, { linea })}
            />
            <FotoField
              id={`foto-${cat.id}`}
              archivo={archivos[cat.id] ?? null}
              url={previa}
              onArchivo={(archivo) => setArchivos((mapa) => ({ ...mapa, [cat.id]: archivo }))}
            />
            <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={cat.activa}
                onChange={(event) => actualizar(cat.id, { activa: event.target.checked })}
                className="h-5 w-5 accent-ink"
              />
              Visible en la página
            </label>
            <div className="mt-4">
              <Boton disabled={guardando === cat.id} onClick={() => void guardar(cat)}>
                {guardando === cat.id ? "Guardando…" : "Guardar"}
              </Boton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
