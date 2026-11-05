import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { Area, Boton, Campo } from "./ui.tsx";

const claves = ["hero_kicker", "hero_linea_1", "hero_linea_2", "hero_texto"] as const;

type Clave = (typeof claves)[number];
type Valores = Record<Clave, string>;
type Props = { avisar: (texto: string, error?: boolean) => void };

function vacios(): Valores {
  return { hero_kicker: "", hero_linea_1: "", hero_linea_2: "", hero_texto: "" };
}

export function Portada({ avisar }: Props) {
  const [valores, setValores] = useState<Valores>(vacios);
  const [base, setBase] = useState<Valores>(vacios);
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("ajustes")
      .select("clave,valor")
      .in("clave", [...claves])
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          avisar("No se pudo cargar la portada.", true);
          setListo(true);
          return;
        }
        const siguientes = vacios();
        for (const fila of data) {
          const clave = String(fila.clave) as Clave;
          if (clave in siguientes) siguientes[clave] = fila.valor == null ? "" : String(fila.valor);
        }
        setValores(siguientes);
        setBase(siguientes);
        setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, [avisar]);

  function poner(clave: Clave, valor: string) {
    setValores((actual) => ({ ...actual, [clave]: valor }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) return;
    setGuardando(true);
    const filas = claves.map((clave) => ({ clave, valor: valores[clave].trim() }));
    const { data, error } = await supabase.from("ajustes").upsert(filas, { onConflict: "clave" }).select("clave");
    setGuardando(false);
    if (error || !data?.length) {
      setValores(base);
      avisar("No se pudo guardar.", true);
      return;
    }
    const guardado = Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor])) as Valores;
    setValores(guardado);
    setBase(guardado);
    avisar("Portada guardada.");
  }

  if (!listo) return <p className="mt-6 text-sm text-muted">Cargando portada…</p>;

  return (
    <form className="mt-6 min-w-0" onSubmit={guardar}>
      <Campo id="hero-kicker" etiqueta="Kicker" value={valores.hero_kicker} onChange={(valor) => poner("hero_kicker", valor)} />
      <Campo id="hero-linea-1" etiqueta="Línea 1" value={valores.hero_linea_1} onChange={(valor) => poner("hero_linea_1", valor)} />
      <Campo id="hero-linea-2" etiqueta="Línea 2" value={valores.hero_linea_2} onChange={(valor) => poner("hero_linea_2", valor)} />
      <Area id="hero-texto" etiqueta="Texto" value={valores.hero_texto} onChange={(valor) => poner("hero_texto", valor)} />
      <p className="mt-8 text-xs tracking-[0.16em] text-gold uppercase">Vista previa</p>
      <div className="mt-3 border border-gold-line bg-paper px-5 py-6">
        <p className="font-serif text-xl text-gold italic">{valores.hero_kicker}</p>
        <p className="mt-3 font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[1.02] text-ink">{valores.hero_linea_1}</p>
        <p className="font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[1.02] text-ink">{valores.hero_linea_2}</p>
        <p className="mt-4 max-w-sm text-base leading-snug text-muted">{valores.hero_texto}</p>
      </div>
      <div className="mt-6">
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
      </div>
    </form>
  );
}
