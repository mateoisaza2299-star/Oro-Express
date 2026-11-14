import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.ts";
import { estadoPromo } from "../lib/promo.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { Boton, ErrorCarga, Esqueleto } from "./ui.tsx";

type Conteo = {
  activas: number;
  ocultas: number;
  promo: number;
  destacadas: number;
  sinFoto: number;
};

const vacio: Conteo = { activas: 0, ocultas: 0, promo: 0, destacadas: 0, sinFoto: 0 };

export function Resumen({
  onNueva,
  onVerSitio,
  onSesion,
}: {
  onNueva: () => void;
  onVerSitio: () => void;
  onSesion: () => void;
}) {
  const [conteo, setConteo] = useState<Conteo>(vacio);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    void Promise.all([
      supabase
        .from("joyas")
        .select("id,activa,destacada,precio_promo,promo_inicio,promo_fin,imagen_url,imagen_local"),
      supabase.from("joya_fotos").select("joya_id"),
    ]).then(([joyas, fotos]) => {
      if (!vivo) return;
      const error = joyas.error ?? fotos.error;
      if (error || !joyas.data) {
        if (esSesionVencida(error)) onSesion();
        else setFallo(textoError(error ?? "Sin datos"));
        setListo(true);
        return;
      }
      const conFoto = new Set((fotos.data ?? []).map((fila) => String(fila.joya_id)));
      const siguiente = { ...vacio };
      for (const fila of joyas.data) {
        const activa = fila.activa !== false;
        if (activa) siguiente.activas += 1;
        else siguiente.ocultas += 1;
        if (fila.destacada === true) siguiente.destacadas += 1;
        const promo = fila.precio_promo == null || fila.precio_promo === "" ? null : Number(fila.precio_promo);
        if (
          promo != null &&
          Number.isFinite(promo) &&
          estadoPromo({
            precio_promo: promo,
            promo_inicio: fila.promo_inicio ? String(fila.promo_inicio) : null,
            promo_fin: fila.promo_fin ? String(fila.promo_fin) : null,
          }) === "vigente"
        ) {
          siguiente.promo += 1;
        }
        const tieneFoto = Boolean(fila.imagen_url || fila.imagen_local || conFoto.has(String(fila.id)));
        if (!tieneFoto) siguiente.sinFoto += 1;
      }
      setConteo(siguiente);
      setListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  if (!listo) return <Esqueleto filas={4} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudo cargar el resumen."
        detalle={fallo}
        onReintentar={() => {
          setListo(false);
          setFallo("");
          setIntento((valor) => valor + 1);
        }}
      />
    );
  }

  const filas: { etiqueta: string; valor: number }[] = [
    { etiqueta: "Joyas activas", valor: conteo.activas },
    { etiqueta: "Ocultas", valor: conteo.ocultas },
    { etiqueta: "En promo", valor: conteo.promo },
    { etiqueta: "Destacadas", valor: conteo.destacadas },
    { etiqueta: "Sin foto", valor: conteo.sinFoto },
  ];

  return (
    <div className="min-w-0">
      <h1 className="font-serif text-4xl text-ink">Resumen</h1>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filas.map((fila) => (
          <li key={fila.etiqueta} className="border border-gold-line px-4 py-4">
            <p className="font-serif text-3xl text-ink">{fila.valor}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-gold uppercase">{fila.etiqueta}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <Boton onClick={onNueva}>Nueva joya</Boton>
        <Boton secundario onClick={onVerSitio}>
          Ver sitio
        </Boton>
      </div>
    </div>
  );
}
