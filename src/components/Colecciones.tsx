import { colecciones, rejilla } from "../data/colecciones.ts";
import type { Categoria } from "../data/productos.ts";
import { Encabezado } from "./Encabezado.tsx";
import { Picture } from "./Picture.tsx";

type Props = {
  onElegir: (categoria: Categoria) => void;
};

export function Colecciones({ onElegir }: Props) {
  return (
    <section
      id="colecciones"
      className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-32"
      aria-labelledby="titulo-colecciones"
      data-testid="colecciones"
    >
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero="01"
          titulo="Colecciones"
          tituloId="titulo-colecciones"
          texto="Seis maneras de mirar la selección."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[260px_260px_280px_220px] md:gap-5">
          {colecciones.map((coleccion, index) => (
            <button
              key={coleccion.nombre}
              type="button"
              className={`group flex aspect-[4/5] flex-col bg-paper text-left md:aspect-auto md:h-full ${rejilla[index]}`}
              onClick={() => onElegir(coleccion.nombre)}
            >
              <span className="relative min-h-0 flex-1 overflow-hidden">
                <Picture
                  nombre={coleccion.imagen}
                  alt={coleccion.alt}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${coleccion.posicion}`}
                />
                <span className="pointer-events-none absolute inset-0 bg-ivory/90 transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0 max-md:opacity-0 motion-reduce:transition-none" />
              </span>
              <span className="flex items-end justify-between gap-4 border-t border-gold-line/50 px-4 py-4">
                <span>
                  <span className="block text-xs tracking-[0.18em] text-gold">{coleccion.numero}</span>
                  <span className="mt-1 block font-serif text-3xl leading-none font-medium text-ink">
                    {coleccion.nombre}
                  </span>
                </span>
                <span className="max-w-[14ch] text-right text-xs leading-relaxed text-muted">{coleccion.texto}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
