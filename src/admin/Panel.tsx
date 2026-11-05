import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { Categorias } from "./Categorias.tsx";
import { Negocio } from "./Negocio.tsx";
import { Piezas } from "./Piezas.tsx";
import { Portada } from "./Portada.tsx";
import { Aviso, Boton, Campo } from "./ui.tsx";

type Fase = "cargando" | "login" | "panel";
type Tab = "piezas" | "categorias" | "negocio" | "portada";

const tabs: { id: Tab; etiqueta: string }[] = [
  { id: "piezas", etiqueta: "Piezas" },
  { id: "categorias", etiqueta: "Categorías" },
  { id: "negocio", etiqueta: "Datos del negocio" },
  { id: "portada", etiqueta: "Portada" },
];

export default function Panel() {
  const [fase, setFase] = useState<Fase>("cargando");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vivo = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      if (!data.session) {
        setFase("login");
        return;
      }
      const permitido = await esAdmin();
      if (!vivo) return;
      if (!permitido) {
        await supabase.auth.signOut();
        if (!vivo) return;
        setAviso("Esta cuenta no tiene permiso");
        setFase("login");
        return;
      }
      setFase("panel");
    });
    return () => {
      vivo = false;
    };
  }, []);

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
    setFase("panel");
  }

  async function salir() {
    await supabase.auth.signOut();
    setAviso("");
    setFase("login");
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-ivory text-ink">
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        {fase === "cargando" ? <p className="text-sm text-muted">Cargando…</p> : null}
        {fase === "login" ? <Login aviso={aviso} onEntrar={entrar} /> : null}
        {fase === "panel" ? <Editor onSalir={() => void salir()} /> : null}
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
    <form className="mx-auto mt-16 w-full max-w-sm min-w-0" onSubmit={enviar}>
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
        <Boton type="submit" disabled={ocupado}>
          {ocupado ? "Entrando…" : "Entrar"}
        </Boton>
      </div>
      <a href="#inicio" className="mt-4 inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase">
        Volver al sitio
      </a>
    </form>
  );
}

function Editor({ onSalir }: { onSalir: () => void }) {
  const [tab, setTab] = useState<Tab>("piezas");
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);
  const avisar = useCallback((texto: string, error = false) => {
    setAviso({ texto, error });
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(null), 3500);
    return () => window.clearTimeout(id);
  }, [aviso]);

  return (
    <div className="min-w-0">
      <header className="flex flex-col gap-3 border-b border-gold-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-ink">Panel</h1>
          <a href="#inicio" className="inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase">
            Volver al sitio
          </a>
        </div>
        <Boton secundario onClick={onSalir}>
          Cerrar sesión
        </Boton>
      </header>
      {aviso ? <Aviso texto={aviso.texto} error={aviso.error} /> : null}
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
              className={`min-h-11 px-2 text-center text-xs tracking-[0.12em] uppercase ${
                activo ? "bg-ink text-ivory" : "border border-gold-line text-ink"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.etiqueta}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-w-0">
        {tab === "piezas" ? <Piezas avisar={avisar} /> : null}
        {tab === "categorias" ? <Categorias avisar={avisar} /> : null}
        {tab === "negocio" ? <Negocio avisar={avisar} /> : null}
        {tab === "portada" ? <Portada avisar={avisar} /> : null}
      </div>
    </div>
  );
}

async function esAdmin() {
  const { data, error } = await supabase.rpc("es_admin");
  return error == null && data === true;
}
