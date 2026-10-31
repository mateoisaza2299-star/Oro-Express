import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { copy, navegacion } from "../content/es.ts";
import { site } from "../config.ts";
import { irA } from "../lib/navegar.ts";
import { setScrollLocked } from "../lib/scroll.ts";
import { useFocusTrap } from "../lib/useFocusTrap.ts";

type Props = {
  onClose: () => void;
};

export function MenuMovil({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(true, ref, onClose);

  useEffect(() => {
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);

  function ir(id: string) {
    onClose();
    irA(id);
  }

  return (
    <div
      ref={ref}
      id="menu-movil"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ui.menu}
      className="fixed inset-0 z-50 flex flex-col bg-ivory px-5 pt-5 pb-10"
    >
      <div className="flex items-center justify-between">
        <p className="font-serif text-[1.55rem] tracking-[0.16em] text-ink">{site.nombre}</p>
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center"
          aria-label={copy.ui.cerrarMenu}
          onClick={onClose}
        >
          <X aria-hidden="true" size={22} strokeWidth={1.25} />
        </button>
      </div>
      <nav className="mt-16 flex flex-col" aria-label={copy.ui.secciones}>
        {navegacion.map((enlace, index) => (
          <a
            key={enlace.id}
            href={`#${enlace.id}`}
            className="flex items-baseline gap-4 border-t border-gold-line/50 py-4 font-serif text-4xl text-ink"
            onClick={(event) => {
              event.preventDefault();
              ir(enlace.id);
            }}
          >
            <span className="text-xs tracking-[0.18em] text-gold" aria-hidden="true">
              0{index + 1}
            </span>
            {enlace.etiqueta}
          </a>
        ))}
      </nav>
    </div>
  );
}
