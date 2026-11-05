import { useState } from "react";
import type { FormEvent } from "react";
import { copy } from "../content/es.ts";
import { useContenido } from "../lib/contenido.ts";
import { datoVisible } from "../lib/dato.ts";
import { instagramHref, mensajeContacto, numeroWhatsapp, whatsappUrl } from "../lib/whatsapp.ts";
import { Encabezado } from "./Encabezado.tsx";

export function Contacto() {
  const [nombre, setNombre] = useState("");
  const [pieza, setPieza] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const { site } = useContenido();
  const numero = numeroWhatsapp();
  const instagram = instagramHref();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) {
      setError(copy.contacto.error);
      return;
    }
    setError("");
    window.open(whatsappUrl(mensajeContacto(nombre, mensaje, pieza)), "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contacto" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-32" aria-labelledby="titulo-contacto">
      <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Encabezado
            numero={copy.contacto.numero}
            lines={copy.contacto.lines}
            tituloId="titulo-contacto"
            texto={copy.contacto.texto}
          />
          {!numero ? <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">{copy.contacto.sinNumero}</p> : null}
          <dl>
            <Dato etiqueta={copy.contacto.whatsapp} valor={site.whatsapp} href={numero ? `https://wa.me/${numero}` : null} />
            <Dato etiqueta={copy.contacto.instagram} valor={site.instagram} href={instagram} />
            <Dato etiqueta={copy.contacto.direccion} valor={site.direccion} />
            <Dato etiqueta={copy.contacto.horario} valor={site.horario} />
          </dl>
        </div>
        <form className="md:col-span-6 md:col-start-7" onSubmit={onSubmit} noValidate>
          <Campo
            id="nombre"
            etiqueta={copy.contacto.nombre}
            value={nombre}
            autoComplete="name"
            invalid={Boolean(error) && !nombre.trim()}
            onChange={setNombre}
          />
          <Campo
            id="pieza"
            etiqueta={copy.contacto.pieza}
            value={pieza}
            autoComplete="off"
            onChange={setPieza}
          />
          <div className="mt-6">
            <label htmlFor="mensaje" className="text-xs tracking-[0.16em] text-gold uppercase">
              {copy.contacto.mensaje}
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              aria-invalid={Boolean(error) && !mensaje.trim()}
              aria-describedby={error ? "contacto-error" : undefined}
              className="mt-2 w-full resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
            />
          </div>
          {error ? (
            <p id="contacto-error" role="alert" className="mt-4 text-sm text-ink">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-8 inline-flex min-h-12 items-center bg-ink px-5 text-xs tracking-[0.16em] text-ivory uppercase"
          >
            {copy.contacto.enviar}
          </button>
        </form>
      </div>
    </section>
  );
}

function Campo({
  id,
  etiqueta,
  value,
  onChange,
  autoComplete,
  invalid = false,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={invalid ? "contacto-error" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
      />
    </div>
  );
}

function Dato({ etiqueta, valor, href }: { etiqueta: string; valor: string; href?: string | null }) {
  const visible = datoVisible(valor);
  if (!visible) return null;
  return (
    <div className="border-t border-gold-line/60 py-4">
      <dt className="text-xs tracking-[0.16em] text-gold uppercase">{etiqueta}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            {visible}
          </a>
        ) : (
          visible
        )}
      </dd>
    </div>
  );
}
