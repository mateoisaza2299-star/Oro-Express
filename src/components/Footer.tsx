import { enlaces, site } from "../config.ts";
import { scrollToId } from "../lib/scroll.ts";

const year = new Date().getFullYear();

export function Footer() {

  return (
    <footer className="bg-emerald px-5 py-16 text-ivory md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-serif text-5xl tracking-[0.12em]">{site.nombre}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory">
            © {year} {site.nombre}. Información sujeta a confirmación. Este sitio no publica precios, quilates ni
            certificaciones.
          </p>
        </div>
        <nav className="md:col-span-3" aria-label="Pie de página">
          <ul className="flex flex-col">
            {enlaces.map((enlace) => (
              <li key={enlace.id}>
                <a
                  href={`#${enlace.id}`}
                  className="inline-flex min-h-11 items-center text-sm tracking-[0.14em] uppercase"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId(enlace.id);
                  }}
                >
                  {enlace.etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-serif text-lg text-champagne italic md:col-span-3 md:text-right">Para consulta</p>
      </div>
    </footer>
  );
}
