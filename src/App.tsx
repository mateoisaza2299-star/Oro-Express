import { AnimatePresence } from "motion/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { recargarContenido, useCargarContenido, useContenido } from "./lib/contenido.ts";
import { datoVisible } from "./lib/dato.ts";
import { Atelier } from "./components/Atelier.tsx";
import { Beneficios } from "./components/Beneficios.tsx";
import { Catalogo } from "./components/Catalogo.tsx";
import { Colecciones } from "./components/Colecciones.tsx";
import { Contacto } from "./components/Contacto.tsx";
import { Cuidado } from "./components/Cuidado.tsx";
import { PanelEsqueleto, VistaEsqueleto } from "./components/Esqueletos.tsx";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { MenuMovil } from "./components/MenuMovil.tsx";
import { Pagina } from "./components/Pagina.tsx";
import { SmoothScroll } from "./components/SmoothScroll.tsx";
import { WhatsappFlotante } from "./components/WhatsappFlotante.tsx";
import { copy, esPagina } from "./content/es.ts";
import type { Filtro, Producto } from "./data/productos.ts";
import { iniciarEfectos } from "./lib/efectos.ts";
import { irA, seguirHash } from "./lib/navegar.ts";

const VistaRapida = lazy(() => import("./components/VistaRapida.tsx"));
const Panel = lazy(() => import("./admin/Panel.tsx"));

export default function App() {
  useCargarContenido();
  useEffect(() => iniciarEfectos(), []);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [pieza, setPieza] = useState<Producto | null>(null);
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));
  const bloqueado = menuAbierto || pieza !== null;
  const admin = hash === "/admin";
  const pagina = !admin && esPagina(hash) ? hash : null;
  const banner = datoVisible(useContenido().banner);
  const eraAdmin = useRef(false);

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (eraAdmin.current && !admin) recargarContenido();
    eraAdmin.current = admin;
  }, [admin]);

  useEffect(() => {
    if (admin) {
      window.scrollTo(0, 0);
      return;
    }
    seguirHash(hash);
  }, [hash, admin]);

  useEffect(() => {
    if (!admin) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [admin]);

  if (admin) {
    return (
      <Suspense fallback={<PanelEsqueleto />}>
        <Panel />
      </Suspense>
    );
  }

  return (
    <SmoothScroll>
      <div className="scroll-progress" aria-hidden="true" />
      <div aria-hidden="true" className="page-rule" />
      <a href="#contenido" className="skip">
        {copy.ui.saltar}
      </a>
      <Header menuAbierto={menuAbierto} onMenu={setMenuAbierto} inert={bloqueado} />
      {menuAbierto ? <MenuMovil onClose={() => setMenuAbierto(false)} /> : null}
      {banner ? (
        <p className="fixed inset-x-0 top-16 z-30 bg-ink px-5 py-2.5 text-center text-xs tracking-[0.14em] text-ivory lg:top-[4.5rem]">
          {banner}
        </p>
      ) : null}
      <div id="contenido" tabIndex={-1} inert={bloqueado ? true : undefined} className={banner ? "pt-11" : undefined}>
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
      <Suspense fallback={pieza ? <VistaEsqueleto /> : null}>
        <AnimatePresence>
          {pieza ? <VistaRapida key={pieza.id} producto={pieza} onClose={() => setPieza(null)} /> : null}
        </AnimatePresence>
      </Suspense>
    </SmoothScroll>
  );
}
