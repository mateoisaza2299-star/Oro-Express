import { Menu, X } from "lucide-react";
import { enlaces, site } from "../config.ts";
import { scrollToId } from "../lib/scroll.ts";

type Props = {
  menuAbierto: boolean;
  onMenu: (abierto: boolean) => void;
  inert?: boolean;
};

export function Header({ menuAbierto, onMenu, inert = false }: Props) {
  function ir(id: string) {
    onMenu(false);
    scrollToId(id);
  }

  return (
    <header
      inert={inert || undefined}
      className="fixed inset-x-0 top-0 z-40 border-b border-gold-line/40 bg-ivory/95 md:bg-ivory/80 md:backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[4.5rem] md:px-10">
        <a
          href="#inicio"
          className="font-serif text-[1.55rem] leading-none font-medium tracking-[0.16em] text-ink"
          onClick={(event) => {
            event.preventDefault();
            ir("inicio");
          }}
        >
          {site.nombre}
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Secciones">
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
          className="inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
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
