import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatoPesos } from "../lib/precio.ts";
import { estadoPromo, finIso, inicioIso, precioPromoPorcentaje } from "../lib/promo.ts";
import type { EstadoPromo } from "../lib/promo.ts";
import { supabase } from "../lib/supabase.ts";
import type { PanelProps } from "./comun.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { Boton, ErrorCarga, Esqueleto } from "./ui.tsx";

type JoyaPromo = {
  id: string;
  nombre: string;
  precio: number | null;
  precio_promo: number | null;
  promo_etiqueta: string | null;
  promo_inicio: string | null;
  promo_fin: string | null;
  estado: EstadoPromo;
};

const grupos: { id: EstadoPromo; etiqueta: string }[] = [
  { id: "vigente", etiqueta: "Vigentes" },
  { id: "programada", etiqueta: "Programadas" },
  { id: "vencida", etiqueta: "Vencidas" },
  { id: "ninguna", etiqueta: "Sin promoción" },
];

export function Promociones({ avisar, onSucio, onSesion }: PanelProps) {
  const [joyas, setJoyas] = useState<JoyaPromo[]>([]);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [porcentaje, setPorcentaje] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("joyas")
      .select("id,nombre,precio,precio_promo,promo_etiqueta,promo_inicio,promo_fin,orden")
      .order("orden", { ascending: true })
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          if (esSesionVencida(error)) onSesion();
          else setFallo(textoError(error ?? "Sin datos"));
          setListo(true);
          return;
        }
        setJoyas(data.map((fila) => aPromo(fila)));
        setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const sucio = Boolean(porcentaje || inicio || fin || elegidas.length);

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function alternar(id: string) {
    setElegidas((lista) => (lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id]));
  }

  async function quitar(joya: JoyaPromo) {
    const { data, error } = await supabase
      .from("joyas")
      .update({ precio_promo: null, promo_etiqueta: null, promo_inicio: null, promo_fin: null })
      .eq("id", joya.id)
      .select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo quitar la promoción.", true, textoError(error));
      return;
    }
    setJoyas((lista) =>
      lista.map((item) =>
        item.id === joya.id
          ? { ...item, precio_promo: null, promo_etiqueta: null, promo_inicio: null, promo_fin: null, estado: "ninguna" }
          : item,
      ),
    );
    setElegidas((lista) => lista.filter((item) => item !== joya.id));
    avisar("Promoción quitada.");
  }

  async function aplicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) return;
    const pct = Number(porcentaje);
    if (!elegidas.length) {
      avisar("Elige al menos una joya.", true);
      return;
    }
    if (!Number.isInteger(pct) || pct <= 0 || pct >= 100) {
      avisar("El porcentaje tiene que estar entre 1 y 99.", true);
      return;
    }
    if (inicio && fin && fin < inicio) {
      avisar("La fecha final tiene que ser posterior a la inicial.", true);
      return;
    }
    const elegidasFilas = joyas.filter((joya) => elegidas.includes(joya.id));
    const sinPrecio = elegidasFilas.filter((joya) => joya.precio == null);
    if (sinPrecio.length) {
      avisar(`«${sinPrecio[0]?.nombre ?? "Una joya"}» no tiene precio.`, true);
      return;
    }
    setGuardando(true);
    const etiqueta = `-${pct}%`;
    const promoInicio = inicioIso(inicio);
    const promoFin = finIso(fin);
    try {
      for (const joya of elegidasFilas) {
        const precio = joya.precio as number;
        const precioPromo = precioPromoPorcentaje(precio, pct);
        if (precioPromo == null) throw new Error(`No se pudo calcular la promoción de «${joya.nombre}».`);
        const { data, error } = await supabase
          .from("joyas")
          .update({
            precio_promo: precioPromo,
            promo_etiqueta: etiqueta,
            promo_inicio: promoInicio,
            promo_fin: promoFin,
          })
          .eq("id", joya.id)
          .select("id,nombre,precio,precio_promo,promo_etiqueta,promo_inicio,promo_fin");
        if (error || !data?.length) throw error ?? new Error("No se pudo aplicar la promoción.");
        const actualizada = aPromo(data[0]);
        setJoyas((lista) => lista.map((item) => (item.id === joya.id ? actualizada : item)));
      }
      setElegidas([]);
      setPorcentaje("");
      setInicio("");
      setFin("");
      avisar("Promoción aplicada.");
    } catch (error) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo aplicar la promoción.", true, textoError(error));
    } finally {
      setGuardando(false);
    }
  }

  if (!listo) return <Esqueleto filas={4} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudieron cargar las promociones."
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
      <h1 className="font-serif text-4xl text-ink">Promociones</h1>
      <form className="mt-6 border border-gold-line px-4 py-4" onSubmit={(event) => void aplicar(event)}>
        <p className="text-xs tracking-[0.16em] text-gold uppercase">Aplicar a las seleccionadas</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="min-w-0">
            <label htmlFor="promo-porcentaje" className="text-xs tracking-[0.14em] text-gold uppercase">
              Porcentaje
            </label>
            <input
              id="promo-porcentaje"
              inputMode="numeric"
              value={porcentaje}
              disabled={guardando}
              onChange={(event) => setPorcentaje(event.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-2 min-h-11 w-full border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="promo-inicio" className="text-xs tracking-[0.14em] text-gold uppercase">
              Inicio
            </label>
            <input
              id="promo-inicio"
              type="date"
              value={inicio}
              disabled={guardando}
              onChange={(event) => setInicio(event.target.value)}
              className="mt-2 min-h-11 w-full border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="promo-fin" className="text-xs tracking-[0.14em] text-gold uppercase">
              Fin
            </label>
            <input
              id="promo-fin"
              type="date"
              value={fin}
              disabled={guardando}
              onChange={(event) => setFin(event.target.value)}
              className="mt-2 min-h-11 w-full border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">El precio promocional se redondea a miles.</p>
        <div className="mt-4">
          <Boton type="submit" disabled={guardando || elegidas.length === 0}>
            {guardando ? "Guardando…" : "Aplicar"}
          </Boton>
        </div>
      </form>
      {joyas.length === 0 ? <p className="mt-6 text-sm text-muted">Todavía no hay joyas.</p> : null}
      {joyas.length > 0 && joyas.every((joya) => joya.estado === "ninguna") ? (
        <p className="mt-6 text-sm text-muted">No hay promociones.</p>
      ) : null}
      {grupos.map((grupo) => {
        const filas = joyas.filter((joya) => joya.estado === grupo.id);
        if (!filas.length) return null;
        return (
          <section key={grupo.id} className="mt-8" aria-labelledby={`promo-${grupo.id}`}>
            <h2 id={`promo-${grupo.id}`} className="font-serif text-2xl text-ink">
              {grupo.etiqueta}
            </h2>
            <ul className="mt-2 border-t border-gold-line">
              {filas.map((joya) => (
                <li key={joya.id} className="flex min-w-0 flex-wrap items-center gap-3 border-b border-gold-line py-3">
                  <label className="inline-flex min-h-11 min-w-11 items-center">
                    <input
                      type="checkbox"
                      checked={elegidas.includes(joya.id)}
                      onChange={() => alternar(joya.id)}
                      aria-label={`Seleccionar ${joya.nombre}`}
                      className="h-5 w-5 accent-ink"
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl text-ink">{joya.nombre}</p>
                    <p className="mt-1 text-xs text-muted">
                      {joya.precio != null ? <span className="mr-2 line-through">{formatoPesos(joya.precio)}</span> : null}
                      {joya.precio_promo != null ? <span>{formatoPesos(joya.precio_promo)}</span> : null}
                      {joya.promo_etiqueta ? <span> · {joya.promo_etiqueta}</span> : null}
                    </p>
                  </div>
                  {joya.estado === "ninguna" ? null : (
                    <Boton className="w-auto" secundario onClick={() => void quitar(joya)}>
                      Quitar promo
                    </Boton>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function aPromo(fila: {
  id: unknown;
  nombre: unknown;
  precio: unknown;
  precio_promo: unknown;
  promo_etiqueta: unknown;
  promo_inicio: unknown;
  promo_fin: unknown;
}): JoyaPromo {
  const precio = fila.precio == null || fila.precio === "" ? null : Number(fila.precio);
  const promo = fila.precio_promo == null || fila.precio_promo === "" ? null : Number(fila.precio_promo);
  const campos = {
    precio_promo: promo != null && Number.isFinite(promo) ? Math.round(promo) : null,
    promo_inicio: fila.promo_inicio ? String(fila.promo_inicio) : null,
    promo_fin: fila.promo_fin ? String(fila.promo_fin) : null,
  };
  return {
    id: String(fila.id),
    nombre: String(fila.nombre ?? ""),
    precio: precio != null && Number.isFinite(precio) ? Math.round(precio) : null,
    precio_promo: campos.precio_promo,
    promo_etiqueta: fila.promo_etiqueta ? String(fila.promo_etiqueta) : null,
    promo_inicio: campos.promo_inicio,
    promo_fin: campos.promo_fin,
    estado: estadoPromo(campos),
  };
}
