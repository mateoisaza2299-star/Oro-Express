import { Gift, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { copy } from "../content/es.ts";
import { comerciales } from "../config.ts";
import { datoVisible } from "../lib/dato.ts";

type Item = {
  id: string;
  titulo: string;
  texto: string;
  icono: LucideIcon;
};

const ease = [0.22, 1, 0.36, 1] as const;

function items(): Item[] {
  const lista: Item[] = [];
  const envio = datoVisible(comerciales.envioGratisDesde);
  const descuento = datoVisible(comerciales.descuentoPrimeraCompra);
  const garantia = datoVisible(comerciales.tiempoGarantia);
  const cambios = datoVisible(comerciales.politicaCambios);
  if (envio) lista.push({ id: "envio", titulo: copy.beneficios.envio.titulo, texto: copy.beneficios.envio.texto(envio), icono: Truck });
  if (descuento) {
    lista.push({
      id: "registro",
      titulo: copy.beneficios.registro.titulo,
      texto: copy.beneficios.registro.texto(descuento),
      icono: Gift,
    });
  }
  if (garantia) {
    lista.push({
      id: "garantia",
      titulo: copy.beneficios.garantia.titulo,
      texto: copy.beneficios.garantia.texto(garantia),
      icono: ShieldCheck,
    });
  }
  if (cambios) {
    lista.push({
      id: "cambios",
      titulo: copy.beneficios.cambios.titulo,
      texto: copy.beneficios.cambios.texto(cambios),
      icono: Undo2,
    });
  }
  return lista;
}

export function Beneficios() {
  const reduce = useReducedMotion();
  const lista = items();
  if (lista.length === 0) return null;

  const columnas = lista.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <section className="bg-ivory px-5 lg:px-10" aria-label={copy.beneficios.etiqueta} data-testid="beneficios">
      <ul className={`mx-auto grid max-w-[1440px] border-t border-gold-line ${columnas} lg:grid-cols-4`}>
        {lista.map((item, index) => {
          const Icono = item.icono;
          const borde = index % 2 === 0 ? "border-r" : "";
          return (
            <motion.li
              key={item.id}
              className={`beneficio border-b border-gold-line px-5 py-8 lg:border-b-0 lg:border-r lg:px-8 last:lg:border-r-0 ${borde}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.5, delay: reduce ? 0 : index * 0.08, ease }}
            >
              <Icono aria-hidden="true" className="beneficio-icono text-gold" size={26} strokeWidth={1.15} />
              <h2 className="mt-4 font-serif text-2xl leading-none font-medium text-ink">{item.titulo}</h2>
              <p className="mt-2 max-w-[28ch] text-sm leading-snug text-muted">{item.texto}</p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
