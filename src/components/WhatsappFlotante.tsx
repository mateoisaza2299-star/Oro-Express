import { useEffect, useState } from "react";
import { copy } from "../content/es.ts";
import { useContenido } from "../lib/contenido.ts";
import { whatsappUrl } from "../lib/whatsapp.ts";

export function WhatsappFlotante() {
  const [visible, setVisible] = useState(false);
  useContenido();

  useEffect(() => {
    const actualizar = () => {
      const footer = document.querySelector("footer");
      const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight;
      const pasoElHero = window.scrollY > window.innerHeight * 0.85;
      const antesDelPie = footerTop > window.innerHeight - 12;
      setVisible(pasoElHero && antesDelPie);
    };
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  if (!visible) return null;

  return (
    <a
      href={whatsappUrl(copy.whatsapp.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={copy.ui.whatsappFlotante}
      className="fixed right-4 bottom-4 z-30 inline-flex min-h-12 items-center border border-gold-line bg-ivory px-4 text-xs tracking-[0.14em] text-ink uppercase md:hidden"
    >
      {copy.ui.whatsappCorto}
    </a>
  );
}
