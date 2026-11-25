import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { copy } from "../content/es.ts";
import { rejilla } from "../data/colecciones.ts";
import type { Categoria } from "../data/productos.ts";
import { useContenido } from "../lib/contenido.ts";
import { Encabezado } from "./Encabezado.tsx";
import { Picture } from "./Picture.tsx";

type Props = {
  onElegir: (categoria: Categoria) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Colecciones({ onElegir }: Props) {
  const reduce = useReducedMotion();
  const { colecciones } = useContenido();

  return (
    <section
      id="colecciones"
      className="scroll-mt-24 bg-ivory px-5 py-16 lg:px-10 lg:py-28"
      aria-labelledby="titulo-colecciones"
      data-testid="colecciones"
    >
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero={copy.colecciones.numero}
          lines={copy.colecciones.lines}
          tituloId="titulo-colecciones"
          texto={copy.colecciones.texto}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[320px]">
          {colecciones.map((coleccion, index) => (
            <motion.button
              key={coleccion.nombre}
              type="button"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.55, delay: reduce ? 0 : index * 0.07, ease }}
              className={`col-card group relative aspect-[4/5] w-full text-left lg:aspect-auto lg:h-full ${rejilla[index] ?? "lg:col-span-6"}`}
              onClick={() => onElegir(coleccion.nombre)}
            >
              <span className="col-press absolute inset-0 overflow-hidden border border-gold-line/80">
                <Picture
                  nombre={coleccion.imagen}
                  src={coleccion.imagenUrl}
                  alt={coleccion.alt}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className={`col-photo absolute inset-0 h-full w-full object-cover ${coleccion.posicion}`}
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-[linear-gradient(to_top,#120e0b_0%,rgba(18,14,11,0.94)_68%,rgba(18,14,11,0.28)_84%,transparent_100%)] px-5 pt-8 pb-5 text-ivory">
                  <span className="text-xs tracking-[0.2em] text-champagne">{coleccion.numero}</span>
                  <span className="mt-1 font-serif text-[2rem] leading-none font-medium">{coleccion.nombre}</span>
                  <span className="mt-2 max-w-[32ch] text-sm leading-snug text-ivory">{coleccion.texto}</span>
                  <span className="mt-3 hidden items-center gap-3 text-xs tracking-[0.16em] uppercase opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100 lg:inline-flex">
                    <span
                      aria-hidden="true"
                      className="col-rule inline-block h-px w-10 origin-left bg-champagne"
                    />
                    {copy.colecciones.ver}
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.25} />
                  </span>
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
