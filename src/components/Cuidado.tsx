import { Archive, Droplets, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Encabezado } from "./Encabezado.tsx";
import { GlowCard } from "./GlowCard.tsx";

const cuidados: { titulo: string; texto: string; icono: LucideIcon; oscuro: boolean }[] = [
  {
    titulo: "Limpieza",
    texto: "Pasa un paño suave y seco. Evita químicos, abrasivos y ultrasonido si no te lo indicaron para esa pieza.",
    icono: Droplets,
    oscuro: false,
  },
  {
    titulo: "Almacenamiento",
    texto: "Guárdalas por separado, en un lugar seco, lejos de otras joyas que puedan rayarlas. Un estuche blando basta.",
    icono: Archive,
    oscuro: false,
  },
  {
    titulo: "Garantía",
    texto: "Las condiciones se confirman al momento de la compra. Esta página no publica plazos ni coberturas.",
    icono: ShieldCheck,
    oscuro: true,
  },
];

export function Cuidado() {
  return (
    <section id="cuidado" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-28" aria-labelledby="titulo-cuidado">
      <div className="mx-auto max-w-[1440px]">
        <Encabezado
          numero="04"
          titulo="Cuidado y garantía"
          tituloId="titulo-cuidado"
          texto="Indicaciones generales. No sustituyen lo que se acuerde al comprar una pieza."
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {cuidados.map((item) => {
            const Icono = item.icono;
            return (
              <li key={item.titulo}>
                <GlowCard
                  className={`h-full border-t px-1 pt-6 ${
                    item.oscuro ? "bg-emerald px-6 py-8 text-ivory" : "border-gold-line text-ink"
                  }`}
                >
                  <Icono
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.25}
                    className={item.oscuro ? "text-champagne" : "text-gold"}
                  />
                  <h3 className="mt-8 font-serif text-3xl font-medium">{item.titulo}</h3>
                  <p className={`mt-4 text-base leading-relaxed ${item.oscuro ? "text-ivory" : "text-muted"}`}>
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
