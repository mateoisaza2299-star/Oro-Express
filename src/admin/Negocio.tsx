import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { correoValido, redValida, whatsappValido } from "./validar.ts";
import { Barra, Boton, Campo, ErrorCarga, Esqueleto } from "./ui.tsx";

const grupos = [
  {
    titulo: "Contacto y redes",
    campos: [
      {
        clave: "nombre",
        etiqueta: "Nombre",
        placeholder: "Maison",
        ayuda: "Así aparece en el encabezado y en el pie.",
        tipo: "texto",
      },
      {
        clave: "whatsapp",
        etiqueta: "WhatsApp",
        placeholder: "573001234567",
        ayuda: "Solo dígitos, con indicativo. Entre 10 y 15. Vacío: no se muestra.",
        tipo: "whatsapp",
      },
      {
        clave: "instagram",
        etiqueta: "Instagram",
        placeholder: "@maison",
        ayuda: "Acepta @usuario o un enlace.",
        tipo: "red",
      },
      {
        clave: "tiktok",
        etiqueta: "TikTok",
        placeholder: "@maison",
        ayuda: "Acepta @usuario o un enlace.",
        tipo: "red",
      },
      {
        clave: "facebook",
        etiqueta: "Facebook",
        placeholder: "https://facebook.com/maison",
        ayuda: "Acepta @usuario o un enlace.",
        tipo: "red",
      },
      {
        clave: "direccion",
        etiqueta: "Dirección",
        placeholder: "Cra. 7 # 12-34",
        ayuda: "Si la dejas vacía, la línea no aparece.",
        tipo: "texto",
      },
      {
        clave: "horario",
        etiqueta: "Horario",
        placeholder: "Lunes a sábado, 10 a 7",
        ayuda: "Si lo dejas vacío, la línea no aparece.",
        tipo: "texto",
      },
      {
        clave: "pais",
        etiqueta: "País",
        placeholder: "Colombia",
        ayuda: "Se muestra junto a la ciudad, si hay dato.",
        tipo: "texto",
      },
      {
        clave: "ciudad",
        etiqueta: "Ciudad",
        placeholder: "Medellín",
        ayuda: "Se muestra junto al país, si hay dato.",
        tipo: "texto",
      },
    ],
  },
  {
    titulo: "Beneficios",
    campos: [
      {
        clave: "envio_gratis_desde",
        etiqueta: "Envío gratis desde",
        placeholder: "$200.000",
        ayuda: "Vacío: esa columna no aparece.",
        tipo: "texto",
      },
      {
        clave: "descuento_primera_compra",
        etiqueta: "Descuento de la primera compra",
        placeholder: "10%",
        ayuda: "Vacío: esa columna no aparece.",
        tipo: "texto",
      },
      {
        clave: "tiempo_garantia",
        etiqueta: "Tiempo de garantía",
        placeholder: "6 meses",
        ayuda: "Vacío: esa columna no aparece.",
        tipo: "texto",
      },
      {
        clave: "politica_cambios",
        etiqueta: "Política de cambios",
        placeholder: "30 días con la pieza sin uso",
        ayuda: "Vacío: esa columna no aparece.",
        tipo: "texto",
      },
    ],
  },
  {
    titulo: "Datos legales",
    campos: [
      {
        clave: "responsable",
        etiqueta: "Responsable",
        placeholder: "Maison S.A.S.",
        ayuda: "Vacío: la línea no aparece en privacidad.",
        tipo: "texto",
      },
      {
        clave: "nit",
        etiqueta: "NIT",
        placeholder: "900.000.000-1",
        ayuda: "Vacío: la línea no aparece.",
        tipo: "texto",
      },
      {
        clave: "correo_datos",
        etiqueta: "Correo de datos",
        placeholder: "hola@maison.com",
        ayuda: "Correo para ejercer los derechos de datos.",
        tipo: "correo",
      },
      {
        clave: "finalidad",
        etiqueta: "Finalidad",
        placeholder: "Atender la consulta y coordinar la pieza.",
        ayuda: "Para qué se usan los datos que te escriben.",
        tipo: "texto",
      },
    ],
  },
] as const;

const claves = grupos.flatMap((grupo) => grupo.campos.map((campo) => campo.clave));
type Clave = (typeof claves)[number];
type Valores = Record<Clave, string>;
type Aviso = (texto: string, error?: boolean, detalle?: string) => void;
type Props = { avisar: Aviso; onSucio: (sucio: boolean) => void; onSesion: () => void };

function vacios(): Valores {
  return Object.fromEntries(claves.map((clave) => [clave, ""])) as Valores;
}

function abrirPrimera(nodo: HTMLDetailsElement | null) {
  if (!nodo || nodo.dataset.lista === "1") return;
  nodo.dataset.lista = "1";
  nodo.open = true;
}

function mensajeCampo(tipo: string, valor: string): string | null {
  if (tipo === "whatsapp" && !whatsappValido(valor)) {
    return "Escribe el indicativo y el número, solo dígitos, entre 10 y 15.";
  }
  if (tipo === "correo" && !correoValido(valor)) return "El correo no tiene un formato válido.";
  if (tipo === "red" && !redValida(valor)) return "Usa @usuario o un enlace.";
  return null;
}

export function Negocio({ avisar, onSucio, onSesion }: Props) {
  const [valores, setValores] = useState<Valores>(vacios);
  const [base, setBase] = useState<Valores>(vacios);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void supabase
      .from("ajustes")
      .select("clave,valor")
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error || !data) {
          if (esSesionVencida(error)) onSesion();
          else setFallo(textoError(error ?? "Sin datos"));
          setListo(true);
          return;
        }
        const siguientes = vacios();
        for (const fila of data) {
          const clave = String(fila.clave) as Clave;
          if (clave in siguientes) {
            const texto = fila.valor == null ? "" : String(fila.valor);
            siguientes[clave] = clave === "whatsapp" ? texto.replace(/\D/g, "").slice(0, 15) : texto;
          }
        }
        setValores(siguientes);
        setBase(siguientes);
        setListo(true);
      });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const cambiados = claves.filter((clave) => valores[clave].trim() !== base[clave].trim());
  const errores = grupos.flatMap((grupo) =>
    grupo.campos.flatMap((campo) => {
      const mensaje = mensajeCampo(campo.tipo, valores[campo.clave]);
      return mensaje ? [mensaje] : [];
    }),
  );
  const sucio = cambiados.length > 0;

  useEffect(() => {
    onSucio(sucio);
  }, [sucio, onSucio]);

  useEffect(() => () => onSucio(false), [onSucio]);

  function poner(clave: Clave, valor: string, tipo: string) {
    const siguiente = tipo === "whatsapp" ? valor.replace(/\D/g, "").slice(0, 15) : valor;
    setValores((actual) => ({ ...actual, [clave]: siguiente }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando || !sucio || errores.length > 0) return;
    setGuardando(true);
    const filas = claves.map((clave) => ({ clave, valor: valores[clave].trim() }));
    const { data, error } = await supabase.from("ajustes").upsert(filas, { onConflict: "clave" }).select("clave");
    setGuardando(false);
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
      return;
    }
    const guardado = Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor])) as Valores;
    setValores(guardado);
    setBase(guardado);
    avisar("Datos guardados.");
  }

  if (!listo) return <Esqueleto filas={4} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudieron cargar los datos."
        detalle={fallo}
        onReintentar={() => {
          setListo(false);
          setFallo("");
          setIntento((valor) => valor + 1);
        }}
      />
    );
  }

  const textoCambios =
    cambiados.length === 1 ? "1 campo con cambios" : `${cambiados.length} campos con cambios`;

  return (
    <form className="mt-6 min-w-0 pb-36" onSubmit={guardar}>
      <p className="text-sm leading-relaxed text-muted">Si dejas un campo vacío, esa línea no aparece en la página.</p>
      {grupos.map((grupo, indice) => (
        <details
          key={grupo.titulo}
          ref={indice === 0 ? abrirPrimera : undefined}
          className="group mt-4 border-t border-gold-line"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-2 font-serif text-2xl text-ink [&::-webkit-details-marker]:hidden">
            {grupo.titulo}
            <span aria-hidden="true" className="text-sm text-gold transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          {grupo.campos.map((campo) => (
            <Campo
              key={campo.clave}
              id={`ajuste-${campo.clave}`}
              etiqueta={campo.etiqueta}
              placeholder={campo.placeholder}
              ayuda={campo.ayuda}
              error={mensajeCampo(campo.tipo, valores[campo.clave])}
              value={valores[campo.clave]}
              inputMode={campo.tipo === "whatsapp" ? "numeric" : campo.tipo === "correo" ? "email" : "text"}
              autoComplete={campo.tipo === "correo" ? "email" : "off"}
              onChange={(valor) => poner(campo.clave, valor, campo.tipo)}
            />
          ))}
        </details>
      ))}
      <Barra>
        <p className="mb-2 text-xs text-muted">{sucio ? textoCambios : "Sin cambios"}</p>
        <div className="grid grid-cols-2 gap-2">
          <Boton type="submit" disabled={!sucio || guardando || errores.length > 0} className="sm:w-full">
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Boton>
          <Boton
            secundario
            disabled={!sucio || guardando}
            className="sm:w-full"
            onClick={() => setValores(base)}
          >
            Descartar
          </Boton>
        </div>
      </Barra>
    </form>
  );
}
