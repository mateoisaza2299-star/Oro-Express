import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { Barra, Boton, Campo, ErrorCarga, Esqueleto } from "./ui.tsx";

const claves = ["hero_kicker", "hero_linea_1", "hero_linea_2", "hero_texto"] as const;

type Clave = (typeof claves)[number];
type Valores = Record<Clave, string>;
type Aviso = (texto: string, error?: boolean, detalle?: string) => void;
type Props = { avisar: Aviso; onSucio: (sucio: boolean) => void; onSesion: () => void };

function vacios(): Valores {
  return { hero_kicker: "", hero_linea_1: "", hero_linea_2: "", hero_texto: "" };
}

export function Portada({ avisar, onSucio, onSesion }: Props) {
  const [valores, setValores] = useState<Valores>(vacios);
  const [base, setBase] = useState<Valores>(vacios);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
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
          if (esSesionVencida(error)) onSesion();
          else setFallo(textoError(error ?? "Sin datos"));
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
  }, [intento, onSesion]);

  const sucio = claves.some((clave) => valores[clave].trim() !== base[clave].trim());

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function poner(clave: Clave, valor: string) {
    setValores((actual) => ({ ...actual, [clave]: valor }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando || !sucio) return;
    setGuardando(true);
    const filas = claves.map((clave) => ({ clave, valor: valores[clave].trim() }));
    const { data, error } = await supabase.from("ajustes").upsert(filas, { onConflict: "clave" }).select("clave");
    setGuardando(false);
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
      return;
    }
    const guardado = Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor])) as Valores;
    setValores(guardado);
    setBase(guardado);
    avisar("Portada guardada.");
  }

  if (!listo) return <Esqueleto filas={3} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudo cargar la portada."
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
    <form className="mt-6 min-w-0 pb-28" onSubmit={guardar}>
      <Campo
        id="hero-kicker"
        etiqueta="Kicker"
        value={valores.hero_kicker}
        conteo
        onChange={(valor) => poner("hero_kicker", valor)}
      />
      <Campo
        id="hero-linea-1"
        etiqueta="Línea 1"
        value={valores.hero_linea_1}
        conteo
        onChange={(valor) => poner("hero_linea_1", valor)}
      />
      <Campo
        id="hero-linea-2"
        etiqueta="Línea 2"
        value={valores.hero_linea_2}
        conteo
        onChange={(valor) => poner("hero_linea_2", valor)}
      />
      <Campo
        id="hero-texto"
        etiqueta="Texto"
        value={valores.hero_texto}
        conteo
        onChange={(valor) => poner("hero_texto", valor)}
      />
      <p className="mt-8 text-xs tracking-[0.16em] text-gold uppercase">Vista previa</p>
      <div className="mt-3 border border-gold-line bg-paper px-5 py-6">
        <p className="font-serif text-xl text-gold italic">{valores.hero_kicker}</p>
        <p className="mt-3 font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[1.02] font-medium tracking-[0.03em] break-words text-ink uppercase">
          {valores.hero_linea_1 || "Línea 1"}
        </p>
        <p className="font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[1.02] font-medium tracking-[0.03em] break-words text-ink uppercase">
          {valores.hero_linea_2 || "Línea 2"}
        </p>
        <p className="mt-4 max-w-sm text-base leading-snug break-words text-muted">{valores.hero_texto}</p>
      </div>
      <Barra>
        <div className="grid grid-cols-2 gap-2">
          <Boton type="submit" disabled={!sucio || guardando} className="sm:w-full">
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          <Boton secundario disabled={!sucio || guardando} className="sm:w-full" onClick={() => setValores(base)}>
            Descartar
          </Boton>
        </div>
      </Barra>
    </form>
  );
}
