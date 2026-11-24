import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import type { PanelProps } from "./comun.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { redValida, whatsappValido } from "./validar.ts";
import { Boton, Campo, ErrorCarga, Esqueleto } from "./ui.tsx";

const claves = ["whatsapp", "instagram", "direccion", "horario", "banner_promo"] as const;
type Clave = (typeof claves)[number];
type Valores = Record<Clave, string>;

const vacios = (): Valores => ({
  whatsapp: "",
  instagram: "",
  direccion: "",
  horario: "",
  banner_promo: "",
});

export function Ajustes({ avisar, onSucio, onSesion }: PanelProps) {
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
          if (!claves.includes(clave)) continue;
          const texto = fila.valor == null ? "" : String(fila.valor);
          siguientes[clave] = clave === "whatsapp" ? texto.replace(/\D/g, "").slice(0, 15) : texto;
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
  const errorWhatsapp = whatsappValido(valores.whatsapp) ? null : "Escribe el indicativo y el número, solo dígitos, entre 10 y 15.";
  const errorInstagram = redValida(valores.instagram) ? null : "Usa @usuario o un enlace.";

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando || !sucio || errorWhatsapp || errorInstagram) return;
    setGuardando(true);
    const filas = claves.map((clave) => ({ clave, valor: valores[clave].trim() }));
    const { data, error } = await supabase.from("ajustes").upsert(filas, { onConflict: "clave" }).select("clave");
    setGuardando(false);
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
      return;
    }
    const guardado = { ...valores, ...Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor])) } as Valores;
    setValores(guardado);
    setBase(guardado);
    avisar("Ajustes guardados.");
  }

  if (!listo) return <Esqueleto filas={4} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudieron cargar los ajustes."
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
    <form className="min-w-0 pb-8" onSubmit={(event) => void guardar(event)}>
      <h1 className="font-serif text-4xl text-ink">Ajustes</h1>
      <Campo
        id="ajuste-whatsapp"
        etiqueta="WhatsApp"
        value={valores.whatsapp}
        inputMode="numeric"
        placeholder="573001234567"
        ayuda="Solo dígitos, con indicativo. Entre 10 y 15. Vacío: no se muestra."
        error={errorWhatsapp}
        onChange={(valor) => setValores((actual) => ({ ...actual, whatsapp: valor.replace(/\D/g, "").slice(0, 15) }))}
      />
      <Campo
        id="ajuste-instagram"
        etiqueta="Instagram"
        value={valores.instagram}
        placeholder="@salem"
        ayuda="Acepta @usuario o un enlace."
        error={errorInstagram}
        onChange={(valor) => setValores((actual) => ({ ...actual, instagram: valor }))}
      />
      <Campo
        id="ajuste-direccion"
        etiqueta="Dirección"
        value={valores.direccion}
        ayuda="Si la dejas vacía, la línea no aparece."
        onChange={(valor) => setValores((actual) => ({ ...actual, direccion: valor }))}
      />
      <Campo
        id="ajuste-horario"
        etiqueta="Horario"
        value={valores.horario}
        ayuda="Si lo dejas vacío, la línea no aparece."
        onChange={(valor) => setValores((actual) => ({ ...actual, horario: valor }))}
      />
      <Campo
        id="ajuste-banner"
        etiqueta="Texto del banner de promoción"
        value={valores.banner_promo}
        ayuda="Se muestra sobre el sitio cuando tiene texto."
        onChange={(valor) => setValores((actual) => ({ ...actual, banner_promo: valor }))}
      />
      <div className="mt-6">
        <Boton type="submit" disabled={!sucio || guardando || Boolean(errorWhatsapp || errorInstagram)}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
      </div>
    </form>
  );
}
