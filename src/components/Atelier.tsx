import { copy } from "../content/es.ts";
import { Encabezado } from "./Encabezado.tsx";
import { Parallax } from "./Parallax.tsx";
import { Picture } from "./Picture.tsx";

export function Atelier() {
  return (
    <section id="atelier" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-10 md:py-32" aria-labelledby="titulo-atelier">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 md:grid-cols-12 md:gap-12">
        <figure className="relative md:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper md:aspect-[5/6]">
            <Parallax>
              <Picture
                nombre="atelier"
                alt={copy.atelier.alt}
                sizes="(min-width: 768px) 55vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </Parallax>
          </div>
        </figure>
        <div className="md:col-span-5">
          <Encabezado
            numero={copy.atelier.numero}
            lines={copy.atelier.lines}
            tituloId="titulo-atelier"
            texto={copy.atelier.texto}
          />
          <p className="max-w-md text-base leading-relaxed text-muted">{copy.atelier.cuerpo}</p>
        </div>
      </div>
    </section>
  );
}
