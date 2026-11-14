import { motion } from "motion/react";
import { copy } from "../content/es.ts";
import { type Filtro, type Producto } from "../data/productos.ts";
import { useContenido } from "../lib/contenido.ts";
import { fotoDe } from "../lib/imagen.ts";
import { useLite } from "../lib/useLite.ts";
import { Encabezado } from "./Encabezado.tsx";
import { GlowCard } from "./GlowCard.tsx";

type Props = {
  filtro: Filtro;
  onFiltro: (filtro: Filtro) => void;
  onAbrir: (producto: Producto) => void;
};

export function Catalogo({ filtro, onFiltro, onAbrir }: Props) {
  const lite = useLite();
  const { categorias, productos } = useContenido();
  const filtros: Filtro[] = ["Todos", ...categorias];
  const lista = filtro === "Todos" ? productos : productos.filter((producto) => producto.categoria === filtro);
  const visibles = primeroEnCategoria(lista);

  return (
    <section id="catalogo" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-28" aria-labelledby="titulo-piezas">
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero={copy.catalogo.numero}
          lines={copy.catalogo.lines}
          tituloId="titulo-piezas"
          texto={copy.catalogo.texto}
        />
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label={copy.ui.filtrar}>
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
                {item === "Todos" ? copy.catalogo.todos : item}
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? copy.catalogo.una : copy.catalogo.varias}
        </p>
        {visibles.length === 0 ? (
          <p role="status" className="text-base text-muted">
            {copy.catalogo.vacio}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((producto) => {
              const foto = fotoDe(producto.imagen, producto.imagenUrl);
              return (
                <li key={producto.id}>
                  <GlowCard className={producto.destacada ? "ring-1 ring-gold-line" : ""}>
                    <button
                      type="button"
                      className="w-full text-left"
                      data-testid={`producto-${producto.id}`}
                      onClick={() => onAbrir(producto)}
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden bg-paper">
                        {producto.destacada ? (
                          <span className="absolute top-2 left-2 z-10 max-w-[70%] bg-gold-line px-2 py-1 text-xs tracking-[0.14em] text-ivory uppercase">
                            {copy.catalogo.recomendado}
                          </span>
                        ) : null}
                        {foto && lite ? (
                          <img
                            {...foto}
                            alt={producto.alt}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        {foto && !lite ? (
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
                        ) : null}
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
                        <span className="flex shrink-0 flex-col items-end text-right">
                          {producto.promoEtiqueta ? (
                            <span className="text-[10px] tracking-[0.14em] text-gold uppercase">{producto.promoEtiqueta}</span>
                          ) : null}
                          {producto.precioAnterior ? (
                            <span className="text-[10px] tracking-[0.12em] text-muted line-through">{producto.precioAnterior}</span>
                          ) : null}
                          <span className="text-xs tracking-[0.16em] text-ink uppercase">{producto.precio}</span>
                        </span>
                      </span>
                      <span className="mt-3 block text-xs tracking-[0.16em] text-muted uppercase">{copy.catalogo.ver}</span>
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

function primeroEnCategoria(lista: Producto[]): Producto[] {
  const grupos = new Map<string, Producto[]>();
  for (const producto of lista) {
    const grupo = grupos.get(producto.categoria);
    if (grupo) grupo.push(producto);
    else grupos.set(producto.categoria, [producto]);
  }
  const ordenados = new Map<string, Producto[]>();
  for (const [categoria, grupo] of grupos) {
    const recomendadas: Producto[] = [];
    const resto: Producto[] = [];
    for (const producto of grupo) {
      if (producto.destacada) recomendadas.push(producto);
      else resto.push(producto);
    }
    ordenados.set(categoria, recomendadas.length ? [...recomendadas, ...resto] : grupo);
  }
  const cursor = new Map<string, number>();
  return lista.map((producto) => {
    const grupo = ordenados.get(producto.categoria) ?? [];
    const indice = cursor.get(producto.categoria) ?? 0;
    cursor.set(producto.categoria, indice + 1);
    return grupo[indice] ?? producto;
  });
}
