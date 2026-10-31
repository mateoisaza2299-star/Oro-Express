import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { enlaces, site } from "../config.ts";
import { scrollToId } from "../lib/scroll.ts";

type Props = {
  menuAbierto: boolean;
  onMenu: (abierto: boolean) => void;
  inert?: boolean;
};

export function Header({ menuAbierto, onMenu, inert = false }: Props) {
  const [pegado, setPegado] = useState(false);

  useEffect(() => {
    const onScroll = () => setPegado(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function ir(id: string) {
    onMenu(false);
    scrollToId(id);
  }

  return (
    <header
      inert={inert || undefined}
      className={`fixed inset-x-0 top-0 z-40 border-b border-gold-line/70 ${
        pegado ? "bg-ivory/90 backdrop-blur-md" : "bg-ivory"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:h-[4.5rem] lg:px-10">
        <a
          href="#inicio"
          className="inline-flex min-h-12 items-center font-serif text-[1.55rem] leading-none font-medium tracking-[0.16em] text-ink"
          onClick={(event) => {
            event.preventDefault();
            ir("inicio");
          }}
        >
          {site.nombre}
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Secciones">
          {enlaces.map((enlace) => (
            <a
              key={enlace.id}
              href={`#${enlace.id}`}
              className="text-xs tracking-[0.18em] text-ink uppercase"
              onClick={(event) => {
                event.preventDefault();
                ir(enlace.id);
              }}
            >
              {enlace.etiqueta}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center text-ink lg:hidden"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => onMenu(!menuAbierto)}
        >
          {menuAbierto ? <X aria-hidden="true" size={22} strokeWidth={1.25} /> : <Menu aria-hidden="true" size={22} strokeWidth={1.25} />}
        </button>
      </div>
    </header>
  );
}
