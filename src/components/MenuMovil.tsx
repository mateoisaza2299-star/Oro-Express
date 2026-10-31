import { useRef } from "react";
import { X } from "lucide-react";
import { enlaces, site } from "../config.ts";
import { scrollToId, setScrollLocked } from "../lib/scroll.ts";
import { useFocusTrap } from "../lib/useFocusTrap.ts";
import { useEffect } from "react";

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
    scrollToId(id);
  }

  return (
    <div
      ref={ref}
      id="menu-movil"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-0 z-50 flex flex-col bg-ivory px-5 pt-5 pb-10"
    >
      <div className="flex items-center justify-between">
        <p className="font-serif text-[1.55rem] tracking-[0.16em] text-ink">{site.nombre}</p>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center"
          aria-label="Cerrar menú"
          onClick={onClose}
        >
          <X aria-hidden="true" size={22} strokeWidth={1.25} />
        </button>
      </div>
      <nav className="mt-16 flex flex-col" aria-label="Secciones">
        {enlaces.map((enlace, index) => (
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
