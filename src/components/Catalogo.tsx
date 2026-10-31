import { motion } from "motion/react";
import { categorias, productos, type Filtro, type Producto } from "../data/productos.ts";
import { fuentes } from "../lib/imagen.ts";
import { useLite } from "../lib/useLite.ts";
import { Encabezado } from "./Encabezado.tsx";
import { GlowCard } from "./GlowCard.tsx";

type Props = {
  filtro: Filtro;
  onFiltro: (filtro: Filtro) => void;
  onAbrir: (producto: Producto) => void;
};

const filtros: Filtro[] = ["Todos", ...categorias];

export function Catalogo({ filtro, onFiltro, onAbrir }: Props) {
  const lite = useLite();
  const visibles = filtro === "Todos" ? productos : productos.filter((producto) => producto.categoria === filtro);

  return (
    <section id="catalogo" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-28" aria-labelledby="titulo-piezas">
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero="02"
          titulo="Piezas"
          tituloId="titulo-piezas"
          texto="Ocho piezas para consultar. El precio no está publicado."
        />
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {filtros.map((item) => {
            const activo = item === filtro;
            const id = item === "Todos" ? "todos" : item.toLowerCase();
            return (
              <button
                key={item}
                type="button"
                aria-pressed={activo}
                data-testid={`filtro-${id}`}
                className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase ${
                  activo ? "border-ink bg-ink text-ivory" : "border-gold-line bg-transparent text-ink"
                }`}
                onClick={() => onFiltro(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? "pieza" : "piezas"}
        </p>
        {visibles.length === 0 ? (
          <p role="status" className="text-base text-muted">
            No hay piezas en esta categoría por ahora.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((producto) => {
              const foto = fuentes(producto.imagen);
              return (
                <li key={producto.id}>
                  <GlowCard>
                    <button
                      type="button"
                      className="w-full text-left"
                      data-testid={`producto-${producto.id}`}
                      onClick={() => onAbrir(producto)}
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden bg-paper">
                        {lite ? (
                          <img
                            {...foto}
                            alt={producto.alt}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <motion.img
                            {...foto}
                            alt={producto.alt}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                            loading="lazy"
                            decoding="async"
                            layoutId={`foto-${producto.id}`}
                            className="absolute inset-0 h-full w-full object-cover"
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        )}
                      </span>
                      <span className="mt-4 flex items-baseline justify-between gap-4 border-t border-gold-line/70 pt-3">
                        <span>
                          <span className="block text-xs tracking-[0.16em] text-gold uppercase">
                            {producto.categoria}
                          </span>
                          <span className="mt-1 block font-serif text-[1.7rem] leading-tight font-medium text-ink">
                            {producto.nombre}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs tracking-[0.16em] text-ink uppercase">Consultar</span>
                      </span>
                      <span className="mt-3 block text-xs tracking-[0.16em] text-muted uppercase">Vista rápida</span>
                    </button>
                  </GlowCard>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
