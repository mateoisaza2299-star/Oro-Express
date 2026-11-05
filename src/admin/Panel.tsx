import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { Categorias } from "./Categorias.tsx";
import { Negocio } from "./Negocio.tsx";
import { Piezas } from "./Piezas.tsx";
import { Portada } from "./Portada.tsx";
import { Aviso, Boton, Campo, Esqueleto, Toast } from "./ui.tsx";

type Fase = "cargando" | "login" | "panel";
type Tab = "piezas" | "categorias" | "negocio" | "portada";
type AvisoEstado = { texto: string; error: boolean; detalle?: string } | null;

const tabs: { id: Tab; etiqueta: string }[] = [
  { id: "piezas", etiqueta: "Piezas" },
  { id: "categorias", etiqueta: "Categorías" },
  { id: "negocio", etiqueta: "Datos del negocio" },
  { id: "portada", etiqueta: "Portada" },
];

const AVISO_SESION = "Tu sesión terminó, entra de nuevo";

export default function Panel() {
  const [fase, setFase] = useState<Fase>("cargando");
  const [aviso, setAviso] = useState("");
  const salida = useRef(false);
  const faseRef = useRef<Fase>("cargando");
  const cambiarFase = useCallback((siguiente: Fase) => {
    faseRef.current = siguiente;
    setFase(siguiente);
  }, []);

  const perderSesion = useCallback(() => {
    salida.current = true;
    setAviso(AVISO_SESION);
    cambiarFase("login");
    void supabase.auth.signOut().finally(() => {
      salida.current = false;
    });
  }, [cambiarFase]);

  useEffect(() => {
    let vivo = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      if (!data.session) {
        cambiarFase("login");
        return;
      }
      const permitido = await esAdmin();
      if (!vivo) return;
      if (!permitido) {
        await supabase.auth.signOut();
        if (!vivo) return;
        setAviso("Esta cuenta no tiene permiso");
        cambiarFase("login");
        return;
      }
      cambiarFase("panel");
    });
    return () => {
      vivo = false;
    };
  }, [cambiarFase]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (salida.current || faseRef.current !== "panel") return;
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        setAviso(AVISO_SESION);
        cambiarFase("login");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [cambiarFase]);

  async function entrar(correo: string, password: string) {
    setAviso("");
    const { error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password });
    if (error) {
      setAviso("No se pudo entrar. Revisa el correo y la contraseña.");
      return;
    }
    const permitido = await esAdmin();
    if (!permitido) {
      await supabase.auth.signOut();
      setAviso("Esta cuenta no tiene permiso");
      return;
    }
    cambiarFase("panel");
  }

  async function salir(sucio: boolean) {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    salida.current = true;
    await supabase.auth.signOut();
    setAviso("");
    cambiarFase("login");
    salida.current = false;
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-ivory text-ink">
      <div className="mx-auto w-full max-w-3xl min-w-0 px-5 py-8">
        {fase === "cargando" ? <Esqueleto filas={3} /> : null}
        {fase === "login" ? <Login aviso={aviso} onEntrar={entrar} /> : null}
        {fase === "panel" ? <Editor onSalir={salir} onSesion={perderSesion} /> : null}
      </div>
    </div>
  );
}

function Login({ aviso, onEntrar }: { aviso: string; onEntrar: (correo: string, password: string) => Promise<void> }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    await onEntrar(correo, password);
    setOcupado(false);
  }

  return (
    <form className="mx-auto mt-10 w-full max-w-sm min-w-0" onSubmit={enviar}>
      <h1 className="font-serif text-4xl text-ink">Acceso</h1>
      <Campo
        id="acceso-correo"
        etiqueta="Correo"
        type="email"
        autoComplete="username"
        value={correo}
        onChange={setCorreo}
      />
      <Campo
        id="acceso-clave"
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />
      {aviso ? <Aviso texto={aviso} error /> : null}
      <div className="mt-6">
        <Boton type="submit" disabled={ocupado} className="sm:w-full">
          {ocupado ? "Entrando…" : "Entrar"}
        </Boton>
      </div>
      <a href="#inicio" className="mt-4 inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase">
        Volver al sitio
      </a>
    </form>
  );
}

function Editor({ onSalir, onSesion }: { onSalir: (sucio: boolean) => void; onSesion: () => void }) {
  const [tab, setTab] = useState<Tab>("piezas");
  const [aviso, setAviso] = useState<AvisoEstado>(null);
  const [sucio, setSucio] = useState(false);
  const avisar = useCallback((texto: string, error = false, detalle?: string) => {
    setAviso({ texto, error, detalle });
  }, []);
  const onSucio = useCallback((valor: boolean) => {
    setSucio((actual) => (actual === valor ? actual : valor));
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(null), aviso.error ? 6000 : 3200);
    return () => window.clearTimeout(id);
  }, [aviso]);

  useEffect(() => {
    if (!sucio) return;
    const bloquear = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", bloquear);
    return () => window.removeEventListener("beforeunload", bloquear);
  }, [sucio]);

  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session) onSesion();
      });
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [onSesion]);

  function ir(siguiente: Tab) {
    if (siguiente === tab) return;
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setSucio(false);
    setTab(siguiente);
  }

  function volver(event: MouseEvent<HTMLAnchorElement>) {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) event.preventDefault();
  }

  function verSitio() {
    const url = new URL(window.location.href);
    url.hash = "inicio";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-w-0">
      {aviso ? <Toast texto={aviso.texto} detalle={aviso.detalle} error={aviso.error} /> : null}
      <header className="min-w-0 border-b border-gold-line pb-4">
        <h1 className="font-serif text-4xl text-ink">Panel</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={verSitio}
            className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase"
          >
            Ver el sitio
          </button>
          <a
            href="#inicio"
            onClick={volver}
            className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase"
          >
            Volver al sitio
          </a>
          <button
            type="button"
            onClick={() => void onSalir(sucio)}
            className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-ink uppercase"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Secciones del panel">
        {tabs.map((item) => {
          const activo = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={activo}
              aria-controls={`panel-${item.id}`}
              className={`min-h-11 min-w-0 px-1.5 text-center text-[11px] leading-tight tracking-[0.06em] break-words uppercase sm:px-2 sm:text-xs sm:tracking-[0.12em] ${
                activo ? "bg-ink text-ivory" : "border border-gold-line text-ink"
              }`}
              onClick={() => ir(item.id)}
            >
              {item.etiqueta}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-w-0">
        {tab === "piezas" ? <Piezas avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
        {tab === "categorias" ? <Categorias avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
        {tab === "negocio" ? <Negocio avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
        {tab === "portada" ? <Portada avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
      </div>
    </div>
  );
}

async function esAdmin() {
  const { data, error } = await supabase.rpc("es_admin");
  return error == null && data === true;
}
