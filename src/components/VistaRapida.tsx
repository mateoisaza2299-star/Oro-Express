import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copy } from "../content/es.ts";
import type { Producto } from "../data/productos.ts";
import { fotoDe } from "../lib/imagen.ts";
import { setScrollLocked } from "../lib/scroll.ts";
import { useFocusTrap } from "../lib/useFocusTrap.ts";
import { useLite } from "../lib/useLite.ts";
import { mensajeConsulta, whatsappUrl } from "../lib/whatsapp.ts";

type Props = {
  producto: Producto;
  onClose: () => void;
};

export default function VistaRapida({ producto, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lite = useLite();
  const foto = fotoDe(producto.imagen, producto.imagenUrl);
  const galeria = producto.galeria?.length ? producto.galeria : foto ? [foto.src] : [];
  const [indice, setIndice] = useState(0);
  const actual = galeria[indice] ?? galeria[0] ?? null;
  const consulta = whatsappUrl(mensajeConsulta(producto.nombre, producto.categoria));
  const detalle = producto.detalle && producto.detalle !== producto.descripcion ? producto.detalle : "";

  useFocusTrap(true, ref, onClose);

  useEffect(() => {
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial={lite ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={lite ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label={copy.ui.cerrarVista} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vista-titulo"
        aria-describedby="vista-descripcion"
        data-testid="modal"
        data-lenis-prevent=""
        className="relative flex max-h-[100svh] w-full max-w-5xl flex-col overflow-y-auto bg-ivory sm:max-h-[90svh] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:overflow-hidden"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-paper md:aspect-auto md:min-h-[32rem]">
          {actual && galeria.length > 1 ? (
            <img
              src={actual}
              alt={producto.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          {actual && galeria.length <= 1 && foto ? (
            <motion.img
              {...foto}
              alt={producto.alt}
              sizes="(min-width: 768px) 40vw, 100vw"
              decoding="async"
              layoutId={lite ? undefined : `foto-${producto.id}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          {galeria.length > 1 ? (
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-ink/50 to-transparent p-3">
              {galeria.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Imagen ${i + 1} de ${galeria.length}`}
                  aria-pressed={i === indice}
                  className={`h-11 w-11 overflow-hidden border ${i === indice ? "border-ivory" : "border-transparent"}`}
                  onClick={() => setIndice(i)}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative px-5 py-6 md:overflow-y-auto md:px-8 md:py-8">
          <button
            type="button"
            className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center text-ink"
            aria-label={copy.ui.cerrar}
            onClick={onClose}
          >
            <X aria-hidden="true" size={22} strokeWidth={1.25} />
          </button>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">
            {producto.categoria}
            <span className="sr-only">. Imagen {Math.min(indice + 1, Math.max(galeria.length, 1))} de {Math.max(galeria.length, 1)}.</span>
          </p>
          <p aria-hidden="true" className="mt-2 text-xs tracking-[0.18em] text-muted uppercase">
            Imagen {Math.min(indice + 1, Math.max(galeria.length, 1))} de {Math.max(galeria.length, 1)}
          </p>
          <h2 id="vista-titulo" className="mt-3 pr-12 font-serif text-4xl leading-[1.05] font-medium text-ink">
            {producto.nombre}
          </h2>
          <dl className="mt-6 border-t border-gold-line/60">
            <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gold-line/40 py-3 text-sm">
              <dt className="text-gold">{copy.vista.material}</dt>
              <dd>{producto.material}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gold-line/40 py-3 text-sm">
              <dt className="text-gold">{copy.vista.precio}</dt>
              <dd>
                {producto.promoEtiqueta ? (
                  <span className="mr-2 text-xs tracking-[0.14em] text-gold uppercase">{producto.promoEtiqueta}</span>
                ) : null}
                {producto.precioAnterior ? (
                  <span className="mr-2 text-muted line-through">{producto.precioAnterior}</span>
                ) : null}
                <span>{producto.precio}</span>
              </dd>
            </div>
          </dl>
          <div id="vista-descripcion">
            {producto.descripcion ? <p className="mt-6 text-base leading-relaxed text-muted">{producto.descripcion}</p> : null}
            {detalle ? <p className="mt-4 text-base leading-relaxed text-muted">{detalle}</p> : null}
          </div>
          <a
            href={consulta}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-consulta"
            className="btn-shimmer mt-8 inline-flex min-h-12 items-center bg-ink px-5 text-xs tracking-[0.16em] text-ivory uppercase"
          >
            <span className="relative z-10">{copy.vista.asesoria}</span>
            <span className="shimmer" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
