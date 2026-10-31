import { site } from "../config.ts";
import { mensajeGeneral, whatsappUrl } from "../lib/whatsapp.ts";
import { scrollToId } from "../lib/scroll.ts";
import { Picture } from "./Picture.tsx";
import { Reveal } from "./Reveal.tsx";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[100svh] bg-ivory" data-testid="hero" aria-labelledby="titulo-principal">
      <div className="absolute inset-0 overflow-hidden md:left-[46%]">
        <Picture
          nombre="hero"
          alt="Collar de perlas y anillo con piedra clara sobre terciopelo verde, con cortinas claras al fondo."
          sizes="(min-width: 768px) 58vw, 100vw"
          priority
          className="hero-zoom absolute inset-0 h-full w-full object-cover object-[76%_center]"
        />
      </div>
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col justify-end md:w-[48%] md:border-r md:border-gold-line/40 md:bg-ivory md:px-12 md:pt-28 md:pb-20">
        <div aria-hidden="true" className="h-20 bg-gradient-to-t from-ivory to-transparent md:hidden" />
        <div className="bg-ivory px-5 pb-10 md:bg-transparent md:px-0 md:pb-0">
          <p className="font-serif text-2xl text-gold italic">Para consulta</p>
          <Reveal
            as="h1"
            id="titulo-principal"
            inmediato
            lines={["Una luz ", "que no apura"]}
            className="mt-4 max-w-[12ch] font-serif text-[3.15rem] leading-[1.02] font-medium tracking-[-0.03em] text-ink md:text-[5.4rem]"
          />
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
            Anillos, collares, aretes y pulseras. El precio y el material exacto se confirman en conversación.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#colecciones"
              className="btn-shimmer inline-flex min-h-11 items-center bg-ink px-5 text-xs tracking-[0.18em] text-ivory uppercase"
              onClick={(event) => {
                event.preventDefault();
                scrollToId("colecciones");
              }}
            >
              <span className="relative z-10">Ver colecciones</span>
              <span className="shimmer" aria-hidden="true" />
            </a>
            <a
              href={whatsappUrl(mensajeGeneral())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center border border-gold-line px-5 text-xs tracking-[0.16em] text-ink uppercase"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
          <p className="mt-8 text-xs tracking-[0.18em] text-gold uppercase">{site.nombre}</p>
        </div>
      </div>
    </section>
  );
}
