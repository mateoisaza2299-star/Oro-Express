import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { Ajustes } from "./Ajustes.tsx";
import { Categorias } from "./Categorias.tsx";
import { Joyas } from "./Joyas.tsx";
import { Promociones } from "./Promociones.tsx";
import { Resumen } from "./Resumen.tsx";
import { Aviso, Boton, Campo, Esqueleto, Toast } from "./ui.tsx";

type Fase = "cargando" | "login" | "panel";
type Seccion = "resumen" | "joyas" | "categorias" | "promociones" | "ajustes";
type AvisoEstado = { texto: string; error: boolean; detalle?: string } | null;

const secciones: { id: Seccion; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "joyas", etiqueta: "Joyas" },
  { id: "categorias", etiqueta: "Categorías" },
  { id: "promociones", etiqueta: "Promociones" },
  { id: "ajustes", etiqueta: "Ajustes" },
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
        setAviso("Sin acceso");
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
      setAviso("Sin acceso");
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
      {fase === "cargando" ? (
        <div className="mx-auto w-full max-w-3xl px-5 py-8">
          <Esqueleto filas={3} />
        </div>
      ) : null}
      {fase === "login" ? <Login aviso={aviso} onEntrar={entrar} /> : null}
      {fase === "panel" ? <Editor onSalir={salir} onSesion={perderSesion} /> : null}
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
    <form className="mx-auto mt-10 w-full max-w-sm min-w-0 px-5" onSubmit={enviar}>
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
  const [seccion, setSeccion] = useState<Seccion>("resumen");
  const [aviso, setAviso] = useState<AvisoEstado>(null);
  const [sucio, setSucio] = useState(false);
  const [crear, setCrear] = useState(0);
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

  function ir(siguiente: Seccion) {
    if (siguiente === seccion) return;
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setSucio(false);
    setSeccion(siguiente);
  }

  function verSitio() {
    const url = new URL(window.location.href);
    url.hash = "inicio";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function nuevaJoya() {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setSucio(false);
    setSeccion("joyas");
    setCrear((valor) => valor + 1);
  }

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15rem_minmax(0,1fr)]">
      {aviso ? <Toast texto={aviso.texto} detalle={aviso.detalle} error={aviso.error} /> : null}
      <nav aria-label="Secciones" className="border-b border-gold-line px-4 py-4 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
        <p className="font-serif text-3xl text-ink">Maison</p>
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {secciones.map((item) => {
            const activo = seccion === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={activo ? "page" : undefined}
                className={`min-h-11 px-3 text-left text-xs tracking-[0.12em] uppercase ${
                  activo ? "bg-ink text-ivory" : "border border-gold-line text-ink"
                }`}
                onClick={() => ir(item.id)}
              >
                {item.etiqueta}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col items-start">
          <button
            type="button"
            onClick={verSitio}
            className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase"
          >
            Ver sitio
          </button>
          <button
            type="button"
            onClick={() => void onSalir(sucio)}
            className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-ink uppercase"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {seccion === "resumen" ? <Resumen onNueva={nuevaJoya} onSesion={onSesion} /> : null}
        <div hidden={seccion !== "joyas"}>
          <Joyas avisar={avisar} onSucio={onSucio} onSesion={onSesion} crear={crear} activo={seccion === "joyas"} />
        </div>
        {seccion === "categorias" ? <Categorias avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
        {seccion === "promociones" ? <Promociones avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
        {seccion === "ajustes" ? <Ajustes avisar={avisar} onSucio={onSucio} onSesion={onSesion} /> : null}
      </div>
    </div>
  );
}

async function esAdmin() {
  const { data, error } = await supabase.rpc("es_admin");
  return error == null && data === true;
}
