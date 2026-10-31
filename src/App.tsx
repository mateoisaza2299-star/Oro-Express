import { AnimatePresence } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Atelier } from "./components/Atelier.tsx";
import { Beneficios } from "./components/Beneficios.tsx";
import { Catalogo } from "./components/Catalogo.tsx";
import { Colecciones } from "./components/Colecciones.tsx";
import { Contacto } from "./components/Contacto.tsx";
import { Cuidado } from "./components/Cuidado.tsx";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MenuMovil } from "./components/MenuMovil.tsx";
import { Pagina } from "./components/Pagina.tsx";
import { SmoothScroll } from "./components/SmoothScroll.tsx";
import { WhatsappFlotante } from "./components/WhatsappFlotante.tsx";
import { copy, esPagina } from "./content/es.ts";
import type { Filtro, Producto } from "./data/productos.ts";
import { irA, seguirHash } from "./lib/navegar.ts";

const VistaRapida = lazy(() => import("./components/VistaRapida.tsx"));

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [pieza, setPieza] = useState<Producto | null>(null);
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));
  const bloqueado = menuAbierto || pieza !== null;
  const pagina = esPagina(hash) ? hash : null;

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    seguirHash(hash);
  }, [hash]);

  return (
    <SmoothScroll>
      <div aria-hidden="true" className="page-rule" />
      <a href="#contenido" className="skip">
        {copy.ui.saltar}
      </a>
      <Header menuAbierto={menuAbierto} onMenu={setMenuAbierto} inert={bloqueado} />
      {menuAbierto ? <MenuMovil onClose={() => setMenuAbierto(false)} /> : null}
      <div id="contenido" tabIndex={-1} inert={bloqueado ? true : undefined}>
        {pagina ? (
          <main>
            <Pagina id={pagina} />
          </main>
        ) : (
          <main>
            <Hero />
            <Colecciones
              onElegir={(categoria) => {
                setFiltro(categoria);
                irA("catalogo");
              }}
            />
            <Catalogo filtro={filtro} onFiltro={setFiltro} onAbrir={setPieza} />
            <Atelier />
            <Cuidado />
            <Contacto />
            <Beneficios />
          </main>
        )}
        <Footer onCategoria={setFiltro} />
        <WhatsappFlotante />
      </div>
      <Suspense fallback={null}>
        <AnimatePresence>
          {pieza ? <VistaRapida key={pieza.id} producto={pieza} onClose={() => setPieza(null)} /> : null}
        </AnimatePresence>
      </Suspense>
    </SmoothScroll>
  );
}
