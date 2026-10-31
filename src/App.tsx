import { AnimatePresence } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Atelier } from "./components/Atelier.tsx";
import { Catalogo } from "./components/Catalogo.tsx";
import { Colecciones } from "./components/Colecciones.tsx";
import { Contacto } from "./components/Contacto.tsx";
import { Cuidado } from "./components/Cuidado.tsx";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MenuMovil } from "./components/MenuMovil.tsx";
import { SmoothScroll } from "./components/SmoothScroll.tsx";
import type { Filtro, Producto } from "./data/productos.ts";
import { scrollToId } from "./lib/scroll.ts";

const VistaRapida = lazy(() => import("./components/VistaRapida.tsx"));

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [pieza, setPieza] = useState<Producto | null>(null);
  const bloqueado = menuAbierto || pieza !== null;

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const timer = window.setTimeout(() => scrollToId(id), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SmoothScroll>
      <div aria-hidden="true" className="page-rule" />
      <a href="#contenido" className="skip">
        Saltar al contenido
      </a>
      <Header menuAbierto={menuAbierto} onMenu={setMenuAbierto} inert={bloqueado} />
      {menuAbierto ? <MenuMovil onClose={() => setMenuAbierto(false)} /> : null}
      <div id="contenido" inert={bloqueado ? true : undefined}>
        <main>
          <Hero />
          <Colecciones
            onElegir={(categoria) => {
              setFiltro(categoria);
              scrollToId("catalogo");
            }}
          />
          <Catalogo filtro={filtro} onFiltro={setFiltro} onAbrir={setPieza} />
          <Atelier />
          <Cuidado />
          <Contacto />
        </main>
        <Footer />
      </div>
      <Suspense fallback={null}>
        <AnimatePresence>
          {pieza ? <VistaRapida key={pieza.id} producto={pieza} onClose={() => setPieza(null)} /> : null}
        </AnimatePresence>
      </Suspense>
    </SmoothScroll>
  );
}
