import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { copy, navegacion } from "../content/es.ts";
import { Logo } from "./Logo.tsx";
import { useContenido } from "../lib/contenido.ts";
import { datoVisible } from "../lib/dato.ts";
import { irA } from "../lib/navegar.ts";

type Props = {
  menuAbierto: boolean;
  onMenu: (abierto: boolean) => void;
  inert?: boolean;
};

export function Header({ menuAbierto, onMenu, inert = false }: Props) {
  const [pegado, setPegado] = useState(false);
  const { site } = useContenido();
  const nombre = datoVisible(site.nombre);

  useEffect(() => {
    const onScroll = () => setPegado(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function ir(id: string) {
    onMenu(false);
    irA(id);
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
          className="inline-flex min-h-12 items-center"
          onClick={(event) => {
            event.preventDefault();
            ir("inicio");
          }}
        >
          <Logo nombre={nombre ?? "Salem"} className="h-11 w-auto lg:h-12" />
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label={copy.ui.secciones}>
          {navegacion.map((enlace) => (
            <a
              key={enlace.id}
              href={`#${enlace.id}`}
              className="nav-link text-xs tracking-[0.18em] text-ink uppercase"
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
          aria-label={menuAbierto ? copy.ui.cerrarMenu : copy.ui.abrirMenu}
          onClick={() => onMenu(!menuAbierto)}
        >
          {menuAbierto ? <X aria-hidden="true" size={22} strokeWidth={1.25} /> : <Menu aria-hidden="true" size={22} strokeWidth={1.25} />}
        </button>
      </div>
    </header>
  );
}
