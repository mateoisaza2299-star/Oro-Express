import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { copy } from "../content/es.ts";
import { site } from "../config.ts";
import type { Categoria } from "../data/productos.ts";
import { datoVisible, redHref } from "../lib/dato.ts";
import { irA } from "../lib/navegar.ts";
import { numeroWhatsapp, whatsappUrl } from "../lib/whatsapp.ts";

type Enlace = {
  etiqueta: string;
  id: string;
  categoria?: Categoria;
};

const explorar: Enlace[] = [
  { etiqueta: "Anillos", id: "catalogo", categoria: "Anillos" },
  { etiqueta: "Collares", id: "catalogo", categoria: "Collares" },
  { etiqueta: "Aretes", id: "catalogo", categoria: "Aretes" },
  { etiqueta: "Pulseras", id: "catalogo", categoria: "Pulseras" },
  { etiqueta: "Compromiso", id: "catalogo", categoria: "Compromiso" },
  { etiqueta: "Regalos", id: "catalogo", categoria: "Regalos" },
];

const ayuda: Enlace[] = [
  { etiqueta: "Envíos", id: "envios" },
  { etiqueta: "Cambios y devoluciones", id: "cambios" },
  { etiqueta: "Garantía", id: "garantia" },
  { etiqueta: "Cuidado de tus joyas", id: "cuidado" },
  { etiqueta: "Guía de tallas", id: "tallas" },
  { etiqueta: "Preguntas frecuentes", id: "preguntas" },
  { etiqueta: "Contacto", id: "contacto" },
];

const atelier: Enlace[] = [
  { etiqueta: "Nuestra historia", id: "historia" },
  { etiqueta: "Visítanos", id: "visitanos" },
];

const legal: Enlace[] = [
  { etiqueta: "Política de privacidad y tratamiento de datos", id: "privacidad" },
  { etiqueta: "Términos y condiciones", id: "terminos" },
];

const year = new Date().getFullYear();

type Props = {
  onCategoria: (categoria: Categoria) => void;
};

export function Footer({ onCategoria }: Props) {
  const lugar = [datoVisible(site.ciudad), datoVisible(site.pais)].filter(Boolean).join(", ");
  const redes = [
    { nombre: "Instagram", href: redHref(site.instagram, "instagram.com") },
    { nombre: "TikTok", href: redHref(site.tiktok, "www.tiktok.com") },
    { nombre: "Facebook", href: redHref(site.facebook, "facebook.com") },
    {
      nombre: "WhatsApp",
      href: numeroWhatsapp() ? whatsappUrl(copy.whatsapp.general) : null,
    },
  ].filter((red): red is { nombre: string; href: string } => Boolean(red.href));

  function ir(enlace: Enlace) {
    if (enlace.categoria) onCategoria(enlace.categoria);
    irA(enlace.id);
  }

  return (
    <footer className="bg-emerald px-5 pt-12 pb-28 text-ivory lg:px-10 lg:pb-16" data-testid="footer">
      <div className="mx-auto max-w-[1440px]">
        <div className="lg:grid lg:grid-cols-4 lg:divide-x lg:divide-gold-line/40">
          <Columna titulo={copy.footer.explorar} enlaces={explorar} onIr={ir} />
          <Columna titulo={copy.footer.ayuda} enlaces={ayuda} onIr={ir} />
          <Columna titulo={copy.footer.atelier} enlaces={atelier} onIr={ir} />
          <Columna titulo={copy.footer.legal} enlaces={legal} onIr={ir} />
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-gold-line/40 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-serif text-4xl tracking-[0.14em]">{site.nombre}</p>
            {lugar ? <p className="mt-2 text-sm text-champagne">{lugar}</p> : null}
            <p className="mt-2 text-sm text-ivory/90">{copy.footer.derechos(year, site.nombre)}</p>
          </div>
          {redes.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label={copy.footer.pie}>
              {redes.map((red) => (
                <li key={red.nombre}>
                  <a
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={red.nombre}
                    className="inline-flex min-h-12 items-center text-sm tracking-[0.12em] text-champagne uppercase"
                  >
                    {red.nombre}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-col items-start gap-3">
            <a
              href={whatsappUrl(copy.whatsapp.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center border border-champagne/80 px-4 text-xs tracking-[0.14em] text-ivory uppercase"
            >
              {copy.footer.whatsapp}
            </a>
            <button
              type="button"
              className="inline-flex min-h-12 items-center text-xs tracking-[0.16em] text-champagne uppercase"
              onClick={() => irA("inicio")}
            >
              {copy.ui.volverArriba}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Columna({ titulo, enlaces, onIr }: { titulo: string; enlaces: Enlace[]; onIr: (enlace: Enlace) => void }) {
  const [abierto, setAbierto] = useState(false);
  const panelId = `pie-${titulo.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="border-b border-gold-line/40 lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <h2 className="hidden pt-1 font-serif text-2xl font-medium text-champagne lg:block">{titulo}</h2>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between py-2 text-left font-serif text-2xl text-champagne lg:hidden"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((valor) => !valor)}
      >
        {titulo}
        <ChevronDown
          aria-hidden="true"
          size={18}
          strokeWidth={1.25}
          className={`text-gold-line transition-transform duration-300 motion-reduce:transition-none ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      <ul id={panelId} className={`${abierto ? "grid" : "hidden"} pb-3 lg:mt-4 lg:grid lg:pb-0`}>
        {enlaces.map((enlace) => (
          <li key={enlace.etiqueta}>
            <a
              href={`#${enlace.id}`}
              className="inline-flex min-h-12 items-center text-sm leading-snug text-ivory lg:min-h-10"
              onClick={(event) => {
                event.preventDefault();
                onIr(enlace);
              }}
            >
              {enlace.etiqueta}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
