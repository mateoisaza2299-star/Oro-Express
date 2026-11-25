import { copy } from "../content/es.ts";
import { useContenido } from "../lib/contenido.ts";
import { mensajeGeneral, whatsappUrl } from "../lib/whatsapp.ts";
import { scrollToId } from "../lib/scroll.ts";
import { Picture } from "./Picture.tsx";
import { Reveal } from "./Reveal.tsx";

export function Hero() {
  const { hero } = useContenido();
  return (
    <section
      id="inicio"
      className="relative mt-16 bg-ivory lg:mt-[4.5rem] lg:h-[calc(100svh-4.5rem)]"
      data-testid="hero"
      aria-labelledby="titulo-principal"
    >
      <div className="relative aspect-[3/2] overflow-hidden lg:absolute lg:top-1/2 lg:right-0 lg:aspect-[3/2] lg:w-[54%] lg:-translate-y-1/2 xl:w-[60%]">
        <Picture
          nombre="hero"
          alt={copy.hero.alt}
          sizes="100vw"
          priority
          className="hero-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#fbf9f4_0%,rgba(251,249,244,0.7)_7%,rgba(251,249,244,0.25)_15%,transparent_24%)] lg:block" />
      </div>
      <div className="relative z-10 flex flex-col px-5 pt-3 pb-4 lg:h-full lg:w-[min(46%,36rem)] xl:w-[min(40%,36rem)] lg:justify-center lg:px-10 lg:py-0 xl:px-14">
        <p className="font-serif text-xl text-gold italic lg:text-2xl">{hero.kicker}</p>
        <Reveal
          as="h1"
          id="titulo-principal"
          inmediato
          siempre
          lines={hero.lines}
          className="mt-3 font-serif text-[clamp(2rem,8vw,2.55rem)] leading-[1.02] font-medium tracking-[0.03em] text-ink lg:mt-4 lg:text-[clamp(2.75rem,3.6vw,3.6rem)]"
        />
        <p className="mt-4 max-w-sm text-base leading-snug text-muted lg:mt-6 lg:leading-relaxed">{hero.texto}</p>
        <div className="mt-4 flex flex-col gap-3 lg:mt-8 lg:flex-row lg:flex-wrap">
          <a
            href="#colecciones"
            data-magnetico className="btn-fx btn-primary inline-flex min-h-12 w-full items-center justify-center bg-royal px-5 text-xs tracking-[0.18em] text-ivory uppercase lg:w-auto"
            onClick={(event) => {
              event.preventDefault();
              scrollToId("colecciones");
            }}
          >
            <span className="relative z-10">{copy.hero.colecciones}</span>
            <span className="shimmer" aria-hidden="true" />
          </a>
          <a
            href={whatsappUrl(mensajeGeneral())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fx btn-outline inline-flex min-h-12 w-full items-center justify-center border border-gold-line px-5 text-xs tracking-[0.16em] text-ink uppercase lg:w-auto"
          >
            {copy.hero.whatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}
