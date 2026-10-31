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
                alt="Collar fino de metal dorado con piedra clara en bisel, apoyado en una piedra clara sobre terciopelo verde."
                sizes="(min-width: 768px) 55vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </Parallax>
          </div>
        </figure>
        <div className="md:col-span-5">
          <Encabezado
            numero="03"
            titulo="Atelier"
            tituloId="titulo-atelier"
            texto="Miramos cada pieza de cerca: el perfil del metal, cómo se sostiene la piedra, cómo cae la cadena."
          />
          <p className="max-w-md text-base leading-relaxed text-muted">
            La medida, el material exacto y el precio se confirman en conversación. No hay cifras de taller en esta página.
          </p>
        </div>
      </div>
    </section>
  );
}
