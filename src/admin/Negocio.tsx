import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { Boton, Campo } from "./ui.tsx";

const grupos = [
  {
    titulo: "Contacto y redes",
    campos: [
      ["nombre", "Nombre"],
      ["whatsapp", "WhatsApp"],
      ["instagram", "Instagram"],
      ["tiktok", "TikTok"],
      ["facebook", "Facebook"],
      ["direccion", "Dirección"],
      ["horario", "Horario"],
      ["pais", "País"],
      ["ciudad", "Ciudad"],
    ],
  },
  {
    titulo: "Beneficios",
    campos: [
      ["envio_gratis_desde", "Envío gratis desde"],
      ["descuento_primera_compra", "Descuento de la primera compra"],
      ["tiempo_garantia", "Tiempo de garantía"],
      ["politica_cambios", "Política de cambios"],
    ],
  },
  {
    titulo: "Datos legales",
    campos: [
      ["responsable", "Responsable"],
      ["nit", "NIT"],
      ["correo_datos", "Correo de datos"],
      ["finalidad", "Finalidad"],
    ],
  },
] as const;

const claves = grupos.flatMap((grupo) => grupo.campos.map(([clave]) => clave));

type Valores = Record<(typeof claves)[number], string>;
type Props = { avisar: (texto: string, error?: boolean) => void };

function vacios(): Valores {
  return Object.fromEntries(claves.map((clave) => [clave, ""])) as Valores;
}

export function Negocio({ avisar }: Props) {
  const [valores, setValores] = useState<Valores>(vacios);
  const [base, setBase] = useState<Valores>(vacios);
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("ajustes")
      .select("clave,valor")
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          avisar("No se pudieron cargar los datos.", true);
          setListo(true);
          return;
        }
        const siguientes = vacios();
        for (const fila of data) {
          const clave = String(fila.clave) as keyof Valores;
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
    avisar("Datos guardados.");
  }

  if (!listo) return <p className="mt-6 text-sm text-muted">Cargando datos…</p>;

  return (
    <form className="mt-6 min-w-0" onSubmit={guardar}>
      <p className="text-sm leading-relaxed text-muted">Si dejas un campo vacío, esa línea no aparece en la página.</p>
      {grupos.map((grupo) => (
        <fieldset key={grupo.titulo} className="mt-8 min-w-0 border-t border-gold-line pt-4">
          <legend className="font-serif text-3xl text-ink">{grupo.titulo}</legend>
          {grupo.campos.map(([clave, etiqueta]) => (
            <Campo
              key={clave}
              id={`ajuste-${clave}`}
              etiqueta={etiqueta}
              value={valores[clave]}
              onChange={(valor) => setValores((actual) => ({ ...actual, [clave]: valor }))}
            />
          ))}
        </fieldset>
      ))}
      <div className="mt-6">
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
      </div>
    </form>
  );
}
