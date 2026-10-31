import { Archive, Droplets, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { copy } from "../content/es.ts";
import { Encabezado } from "./Encabezado.tsx";
import { GlowCard } from "./GlowCard.tsx";

const iconos: LucideIcon[] = [Droplets, Archive, ShieldCheck];

export function Cuidado() {
  return (
    <section id="cuidado" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-28" aria-labelledby="titulo-cuidado">
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero={copy.cuidado.numero}
          lines={copy.cuidado.lines}
          tituloId="titulo-cuidado"
          texto={copy.cuidado.texto}
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {copy.cuidado.items.map((item, index) => {
            const Icono = iconos[index] ?? Droplets;
            const oscuro = index === copy.cuidado.items.length - 1;
            return (
              <li key={item.titulo}>
                <GlowCard
                  className={`h-full border-t px-1 pt-6 ${
                    oscuro ? "bg-emerald px-6 py-8 text-ivory" : "border-gold-line text-ink"
                  }`}
                >
                  <Icono
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.25}
                    className={oscuro ? "text-champagne" : "text-gold"}
                  />
                  <h3 className="mt-8 font-serif text-3xl font-medium">{item.titulo}</h3>
                  <p className={`mt-4 text-base leading-relaxed ${oscuro ? "text-ivory" : "text-muted"}`}>
                    {item.texto}
                  </p>
                </GlowCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
