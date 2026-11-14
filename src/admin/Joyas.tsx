import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { copy } from "../content/es.ts";
import { esImagenNombre } from "../lib/imagen.ts";
import { aEntero, formatoPesos, miles } from "../lib/precio.ts";
import { estadoPromo, fechaInput, finIso, inicioIso, porcentajeDescuento } from "../lib/promo.ts";
import { supabase } from "../lib/supabase.ts";
import { useFocusTrap } from "../lib/useFocusTrap.ts";
import type { PanelProps } from "./comun.ts";
import { esSesionVencida, textoError } from "./errores.ts";
import { borrarFoto, borrarRutas, rutaEnBucket, subirFotoDeJoya, validarArchivo } from "./foto.ts";
import { moverElemento } from "./orden.ts";
import { Boton, ErrorCarga, Esqueleto, Interruptor, Progreso, VistaFoto } from "./ui.tsx";

const LIMITE_NOMBRE = 120;
const LIMITE_FRASE = 200;
const LIMITE_DESCRIPCION = 2000;
const COLUMNAS =
  "id,categoria_id,nombre,frase,descripcion,alt,material,referencia,precio,precio_promo,promo_etiqueta,promo_inicio,promo_fin,stock,imagen_url,imagen_local,destacada,activa,orden";

type Categoria = { id: string; nombre: string };

type FotoFila = {
  id: string;
  url: string | null;
  path: string | null;
  orden: number;
  esPrincipal: boolean;
};

type Joya = {
  id: string;
  categoria_id: string;
  nombre: string;
  frase: string;
  descripcion: string;
  alt: string;
  material: string | null;
  referencia: string | null;
  precio: number | null;
  precio_promo: number | null;
  promo_etiqueta: string | null;
  promo_inicio: string | null;
  promo_fin: string | null;
  stock: number | null;
  imagen_url: string | null;
  imagen_local: string | null;
  destacada: boolean;
  activa: boolean;
  orden: number;
  fotos: FotoFila[];
};

type FotoBorrador = {
  key: string;
  id: string | null;
  url: string | null;
  path: string | null;
  archivo: File | null;
  esPrincipal: boolean;
  quitar: boolean;
  heredada: boolean;
};

type Borrador = {
  id: string | null;
  nombre: string;
  categoriaId: string;
  referencia: string;
  material: string;
  frase: string;
  descripcion: string;
  precio: string;
  precioPromo: string;
  etiqueta: string;
  inicio: string;
  fin: string;
  activa: boolean;
  destacada: boolean;
  stock: string;
  imagenUrl: string | null;
  imagenLocal: string | null;
  fotos: FotoBorrador[];
};

type Errores = Partial<Record<"nombre" | "categoria" | "frase" | "descripcion" | "precio" | "promo" | "fechas" | "stock", string>>;

type Filtro = "todas" | "activa" | "oculta" | "promo" | "destacada" | "sinfoto";

export function Joyas({ avisar, onSucio, onSesion, crear, activo }: PanelProps & { crear: number; activo: boolean }) {
  const [piezas, setPiezas] = useState<Joya[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [origen, setOrigen] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [ordenando, setOrdenando] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Filtro>("todas");
  const [arrastre, setArrastre] = useState<string | null>(null);
  const [pedido, setPedido] = useState(0);

  useEffect(() => {
    let vivo = true;
    void Promise.all([
      supabase.from("categorias").select("id,nombre,orden").order("orden", { ascending: true }),
      supabase.from("joyas").select(COLUMNAS).order("orden", { ascending: true }),
      supabase.from("joya_fotos").select("id,joya_id,url,path,orden,es_principal").order("orden", { ascending: true }),
    ]).then(([cats, joyas, fotos]) => {
      if (!vivo) return;
      const error = cats.error ?? joyas.error;
      if (error || !cats.data || !joyas.data) {
        if (esSesionVencida(error)) onSesion();
        else setFallo(textoError(error ?? "Sin datos"));
        setListo(true);
        return;
      }
      const porJoya = new Map<string, FotoFila[]>();
      for (const fila of fotos.data ?? []) {
        const joyaId = String(fila.joya_id);
        const lista = porJoya.get(joyaId) ?? [];
        lista.push({
          id: String(fila.id),
          url: fila.url ? String(fila.url) : null,
          path: fila.path ? String(fila.path) : null,
          orden: Number(fila.orden) || 0,
          esPrincipal: fila.es_principal === true,
        });
        porJoya.set(joyaId, lista);
      }
      setCategorias(cats.data.map((fila) => ({ id: String(fila.id), nombre: String(fila.nombre) })));
      setPiezas(joyas.data.map((fila) => normalizar(fila, porJoya.get(String(fila.id)) ?? [])));
      setListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [intento, onSesion]);

  const sucio = borrador ? firma(borrador) !== origen : false;

  useEffect(() => {
    if (activo) onSucio(sucio);
  }, [sucio, onSucio, activo]);

  useEffect(() => () => onSucio(false), [onSucio]);

  if (!activo && borrador) {
    setBorrador(null);
    setOrigen("");
    setErrores({});
    setFotoError(null);
  } else if (activo && crear !== pedido && listo && !fallo) {
    const base = nuevoBorrador(categorias[0]?.id ?? "");
    setPedido(crear);
    setBorrador(base);
    setOrigen(firma(base));
    setErrores({});
    setFotoError(null);
  }

  function abrir(siguiente: Borrador) {
    setFotoError(null);
    setProgreso(null);
    setErrores({});
    setBorrador(siguiente);
    setOrigen(firma(siguiente));
  }

  function empezar() {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    abrir(nuevoBorrador(categorias[0]?.id ?? ""));
  }

  function editar(pieza: Joya) {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    abrir(desdeJoya(pieza));
  }

  function cerrar() {
    if (sucio && !window.confirm("Tienes cambios sin guardar")) return;
    setBorrador(null);
    setOrigen("");
    setErrores({});
    setFotoError(null);
  }

  async function cambiarCampo(pieza: Joya, cambio: Partial<Pick<Joya, "activa" | "destacada">>) {
    const { data, error } = await supabase.from("joyas").update(cambio).eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo actualizar.", true, textoError(error));
      return;
    }
    setPiezas((lista) => lista.map((item) => (item.id === pieza.id ? { ...item, ...cambio } : item)));
    if ("activa" in cambio) avisar(cambio.activa ? "Joya activa." : "Joya oculta.");
    if ("destacada" in cambio) avisar(cambio.destacada ? "Joya destacada." : "Ya no está destacada.");
  }

  async function duplicar(pieza: Joya) {
    const orden = piezas.reduce((max, item) => Math.max(max, item.orden), -1) + 1;
    const { data, error } = await supabase
      .from("joyas")
      .insert({
        categoria_id: pieza.categoria_id,
        nombre: pieza.nombre,
        frase: pieza.frase,
        descripcion: pieza.descripcion,
        alt: pieza.nombre,
        material: pieza.material,
        referencia: pieza.referencia,
        precio: pieza.precio,
        precio_promo: pieza.precio_promo,
        promo_etiqueta: pieza.promo_etiqueta,
        promo_inicio: pieza.promo_inicio,
        promo_fin: pieza.promo_fin,
        stock: pieza.stock,
        imagen_url: null,
        imagen_local: null,
        destacada: pieza.destacada,
        activa: pieza.activa,
        orden,
      })
      .select(COLUMNAS)
      .single();
    if (error || !data) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo duplicar.", true, textoError(error));
      return;
    }
    setPiezas((lista) => [...lista, normalizar(data, [])].sort((a, b) => a.orden - b.orden));
    avisar("Joya duplicada, sin fotos.");
  }

  async function eliminar(pieza: Joya) {
    if (!window.confirm(`¿Eliminar «${pieza.nombre}»? También se borran sus fotos.`)) return;
    const rutas = pieza.fotos.map((foto) => foto.path);
    const portada = rutaEnBucket(pieza.imagen_url);
    if (portada) rutas.push(portada);
    const { data, error } = await supabase.from("joyas").delete().eq("id", pieza.id).select("id");
    if (error || !data?.length) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo eliminar.", true, textoError(error));
      return;
    }
    await borrarRutas(rutas);
    setPiezas((lista) => lista.filter((item) => item.id !== pieza.id));
    if (borrador?.id === pieza.id) {
      setBorrador(null);
      setOrigen("");
    }
    avisar("Joya eliminada.");
  }

  async function guardarOrden(siguiente: Joya[]) {
    const previa = piezas;
    const numerada = siguiente.map((item, indice) => ({ ...item, orden: indice }));
    const antes = new Map(piezas.map((item) => [item.id, item.orden]));
    const cambios = numerada.filter((item) => antes.get(item.id) !== item.orden);
    if (!cambios.length) return;
    setOrdenando(true);
    setPiezas(numerada);
    const resultados = await Promise.all(
      cambios.map((item) => supabase.from("joyas").update({ orden: item.orden }).eq("id", item.id)),
    );
    setOrdenando(false);
    const error = resultados.find((resultado) => resultado.error)?.error;
    if (error) {
      setPiezas(previa);
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar el orden.", true, textoError(error));
    }
  }

  function soltar(sobre: string) {
    if (!arrastre || arrastre === sobre) return;
    const ids = visibles.map((item) => item.id);
    const desde = ids.indexOf(arrastre);
    const hacia = ids.indexOf(sobre);
    setArrastre(null);
    if (desde < 0 || hacia < 0) return;
    const reorden = moverElemento(ids, desde, hacia);
    const cola = [...reorden];
    const siguiente = piezas.map((item) => (ids.includes(item.id) ? piezas.find((pieza) => pieza.id === cola.shift()) ?? item : item));
    void guardarOrden(siguiente);
  }

  function mover(id: string, direccion: -1 | 1) {
    const ids = visibles.map((item) => item.id);
    const desde = ids.indexOf(id);
    const hacia = desde + direccion;
    if (desde < 0 || hacia < 0 || hacia >= ids.length) return;
    const reorden = moverElemento(ids, desde, hacia);
    const cola = [...reorden];
    const siguiente = piezas.map((item) => (ids.includes(item.id) ? piezas.find((pieza) => pieza.id === cola.shift()) ?? item : item));
    void guardarOrden(siguiente);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borrador || guardando) return;
    const validos = validar(borrador);
    setErrores(validos);
    if (Object.keys(validos).length) return;
    const nombre = borrador.nombre.trim();
    const precio = aEntero(borrador.precio);
    const promo = aEntero(borrador.precioPromo);
    const stock = aEntero(borrador.stock);
    setGuardando(true);
    setProgreso(borrador.fotos.some((foto) => foto.archivo && !foto.quitar) ? 0 : null);
    let id = borrador.id;
    try {
      const campos = {
        categoria_id: borrador.categoriaId,
        nombre,
        frase: borrador.frase.trim(),
        descripcion: borrador.descripcion.trim(),
        alt: nombre,
        material: borrador.material.trim() || null,
        referencia: borrador.referencia.trim() || null,
        precio,
        precio_promo: promo,
        promo_etiqueta: promo == null ? null : borrador.etiqueta.trim() || null,
        promo_inicio: promo == null ? null : inicioIso(borrador.inicio),
        promo_fin: promo == null ? null : finIso(borrador.fin),
        stock,
        destacada: borrador.destacada,
        activa: borrador.activa,
      };
      if (!id) {
        const orden = piezas.reduce((max, item) => Math.max(max, item.orden), -1) + 1;
        const { data, error } = await supabase
          .from("joyas")
          .insert({ ...campos, imagen_url: null, imagen_local: null, orden })
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("No se pudo guardar.");
        id = String(data.id);
        setBorrador({ ...borrador, id });
      }
      const fotos = await sincronizarFotos(id, borrador.fotos, setProgreso);
      const heredada = borrador.fotos.some((foto) => foto.heredada && !foto.quitar);
      const imagenUrl = fotos.url ?? (heredada ? borrador.imagenUrl : null);
      const imagenLocal = fotos.url || !heredada ? null : borrador.imagenLocal;
      if (fotos.url && borrador.imagenUrl && borrador.imagenUrl !== fotos.url) await borrarFoto(borrador.imagenUrl);
      const { data, error } = await supabase
        .from("joyas")
        .update({ ...campos, imagen_url: imagenUrl, imagen_local: imagenLocal })
        .eq("id", id)
        .select(COLUMNAS)
        .single();
      if (error || !data) throw error ?? new Error("No se pudo guardar.");
      const guardada = normalizar(data, aFilas(fotos.fotos));
      setPiezas((lista) => {
        const existe = lista.some((item) => item.id === guardada.id);
        const siguiente = existe ? lista.map((item) => (item.id === guardada.id ? guardada : item)) : [...lista, guardada];
        return siguiente.sort((a, b) => a.orden - b.orden);
      });
      setBorrador(null);
      setOrigen("");
      avisar("Joya guardada.");
    } catch (error) {
      if (esSesionVencida(error)) onSesion();
      else avisar("No se pudo guardar.", true, textoError(error));
    } finally {
      setGuardando(false);
      setProgreso(null);
    }
  }

  if (!listo) return <Esqueleto filas={5} />;
  if (fallo) {
    return (
      <ErrorCarga
        texto="No se pudieron cargar las joyas."
        detalle={fallo}
        onReintentar={() => {
          setListo(false);
          setFallo("");
          setIntento((valor) => valor + 1);
        }}
      />
    );
  }

  const consulta = busqueda.trim().toLowerCase();
  const visibles = piezas.filter((pieza) => {
    if (consulta) {
      const nombre = pieza.nombre.toLowerCase();
      const referencia = (pieza.referencia ?? "").toLowerCase();
      if (!nombre.includes(consulta) && !referencia.includes(consulta)) return false;
    }
    if (filtroCategoria && pieza.categoria_id !== filtroCategoria) return false;
    if (filtroEstado === "activa" && !pieza.activa) return false;
    if (filtroEstado === "oculta" && pieza.activa) return false;
    if (filtroEstado === "promo" && estadoPromo(pieza) !== "vigente") return false;
    if (filtroEstado === "destacada" && !pieza.destacada) return false;
    if (filtroEstado === "sinfoto" && tieneFoto(pieza)) return false;
    return true;
  });

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl text-ink">Joyas</h1>
        <Boton onClick={empezar}>Nueva joya</Boton>
      </div>
      <div className="mt-4 min-w-0">
        <label htmlFor="buscar-joya" className="text-xs tracking-[0.16em] text-gold uppercase">
          Buscar
        </label>
        <input
          id="buscar-joya"
          value={busqueda}
          placeholder="Nombre o referencia"
          onChange={(event) => setBusqueda(event.target.value)}
          className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none placeholder:text-[#9c968c]"
        />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            aria-label="Filtrar por categoría"
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
            className="min-h-11 w-full min-w-0 border border-gold-line bg-ivory px-2 text-sm text-ink"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value as Filtro)}
            className="min-h-11 w-full min-w-0 border border-gold-line bg-ivory px-2 text-sm text-ink"
          >
            <option value="todas">Todas</option>
            <option value="activa">Activas</option>
            <option value="oculta">Ocultas</option>
            <option value="promo">En promo</option>
            <option value="destacada">Destacadas</option>
            <option value="sinfoto">Sin foto</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-muted">
          {visibles.length} {visibles.length === 1 ? "joya" : "joyas"}
        </p>
      </div>
      {piezas.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Todavía no hay joyas.</p>
      ) : visibles.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Ninguna joya coincide.</p>
      ) : (
        <ul className="mt-2 border-t border-gold-line">
          {visibles.map((pieza, indice) => {
            const categoria = categorias.find((cat) => cat.id === pieza.categoria_id)?.nombre ?? "Sin categoría";
            const promo = estadoPromo(pieza) === "vigente" && pieza.precio_promo != null && pieza.precio != null;
            return (
              <li
                key={pieza.id}
                draggable={!ordenando}
                onDragStart={() => setArrastre(pieza.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => soltar(pieza.id)}
                className="border-b border-gold-line py-3"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                    <VistaFoto archivo={null} url={miniatura(pieza)} className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl leading-tight text-ink">{pieza.nombre}</p>
                    <p className="mt-1 text-xs tracking-[0.12em] text-gold uppercase">{categoria}</p>
                    <p className="mt-1 text-xs text-muted">
                      {promo ? (
                        <>
                          <span className="mr-2 line-through">{formatoPesos(pieza.precio as number)}</span>
                          <span>{formatoPesos(pieza.precio_promo as number)}</span>
                          {pieza.promo_etiqueta ? <span> · {pieza.promo_etiqueta}</span> : null}
                        </>
                      ) : (
                        <span>{pieza.precio == null ? copy.catalogo.precio : formatoPesos(pieza.precio)}</span>
                      )}
                      <span> · {pieza.activa ? "Activa" : "Oculta"}</span>
                      {pieza.destacada ? <span> · Destacada</span> : null}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Interruptor
                    activo={pieza.activa}
                    etiqueta={pieza.activa ? `Ocultar ${pieza.nombre}` : `Activar ${pieza.nombre}`}
                    onChange={(activa) => void cambiarCampo(pieza, { activa })}
                  />
                  <button
                    type="button"
                    aria-pressed={pieza.destacada}
                    aria-label={pieza.destacada ? `Quitar destacada de ${pieza.nombre}` : `Destacar ${pieza.nombre}`}
                    onClick={() => void cambiarCampo(pieza, { destacada: !pieza.destacada })}
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center ${pieza.destacada ? "text-gold" : "text-ink"}`}
                  >
                    <Star aria-hidden="true" size={18} strokeWidth={1.25} fill={pieza.destacada ? "currentColor" : "none"} />
                  </button>
                  <Boton className="w-auto" onClick={() => editar(pieza)}>
                    Editar
                  </Boton>
                  <Boton className="w-auto" secundario disabled={ordenando || indice === 0} onClick={() => mover(pieza.id, -1)}>
                    Subir
                  </Boton>
                  <Boton
                    className="w-auto"
                    secundario
                    disabled={ordenando || indice === visibles.length - 1}
                    onClick={() => mover(pieza.id, 1)}
                  >
                    Bajar
                  </Boton>
                  <Boton className="w-auto" secundario onClick={() => void duplicar(pieza)}>
                    Duplicar
                  </Boton>
                  <Boton className="w-auto" secundario onClick={() => void eliminar(pieza)}>
                    Eliminar
                  </Boton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {borrador ? (
        <Formulario
          borrador={borrador}
          categorias={categorias}
          errores={errores}
          guardando={guardando}
          progreso={progreso}
          fotoError={fotoError}
          onChange={setBorrador}
          onFotoError={setFotoError}
          onCerrar={cerrar}
          onGuardar={(event) => void guardar(event)}
        />
      ) : null}
    </div>
  );
}

function Formulario({
  borrador,
  categorias,
  errores,
  guardando,
  progreso,
  fotoError,
  onChange,
  onFotoError,
  onCerrar,
  onGuardar,
}: {
  borrador: Borrador;
  categorias: Categoria[];
  errores: Errores;
  guardando: boolean;
  progreso: number | null;
  fotoError: string | null;
  onChange: (borrador: Borrador) => void;
  onFotoError: (texto: string | null) => void;
  onCerrar: () => void;
  onGuardar: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(true, ref, onCerrar);
  const precio = aEntero(borrador.precio);
  const promo = aEntero(borrador.precioPromo);
  const descuento = precio != null && promo != null ? porcentajeDescuento(precio, promo) : null;
  const visibles = borrador.fotos.filter((foto) => !foto.quitar);

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  function poner(cambio: Partial<Borrador>) {
    onChange({ ...borrador, ...cambio });
  }

  function ponerFotos(fotos: FotoBorrador[]) {
    onChange({ ...borrador, fotos: asegurarPrincipal(fotos) });
  }

  function agregar(archivos: File[]) {
    const nuevas: FotoBorrador[] = [];
    for (const archivo of archivos) {
      const motivo = validarArchivo(archivo);
      if (motivo) {
        onFotoError(motivo);
        continue;
      }
      nuevas.push({
        key: crypto.randomUUID(),
        id: null,
        url: null,
        path: null,
        archivo,
        esPrincipal: false,
        quitar: false,
        heredada: false,
      });
    }
    if (!nuevas.length) return;
    onFotoError(null);
    ponerFotos([...borrador.fotos, ...nuevas]);
  }

  function quitarFoto(key: string) {
    ponerFotos(
      borrador.fotos.flatMap((foto) => {
        if (foto.key !== key) return [foto];
        if (!foto.id && !foto.heredada) return [];
        return [{ ...foto, quitar: true, esPrincipal: false }];
      }),
    );
  }

  function principal(key: string) {
    ponerFotos(borrador.fotos.map((foto) => ({ ...foto, esPrincipal: foto.key === key && !foto.quitar })));
  }

  function moverFoto(key: string, direccion: -1 | 1) {
    const indice = visibles.findIndex((foto) => foto.key === key);
    const destino = indice + direccion;
    if (indice < 0 || destino < 0 || destino >= visibles.length) return;
    const reorden = moverElemento(visibles, indice, destino);
    const ocultas = borrador.fotos.filter((foto) => foto.quitar);
    ponerFotos([...reorden, ...ocultas]);
  }

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="titulo-joya" className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar el formulario" onClick={onCerrar} />
      <form className="relative flex h-dvh w-full min-w-0 flex-col bg-ivory lg:w-[32rem] lg:border-l lg:border-gold-line" onSubmit={onGuardar} noValidate>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <h2 id="titulo-joya" className="font-serif text-3xl text-ink">
            {borrador.id ? "Editar joya" : "Nueva joya"}
          </h2>

          <fieldset className="mt-6 min-w-0 border-0 p-0" disabled={guardando}>
            <legend className="text-xs tracking-[0.16em] text-gold uppercase">Básico</legend>
            <CampoTexto
              id="joya-nombre"
              etiqueta="Nombre"
              requerido
              value={borrador.nombre}
              maxLength={LIMITE_NOMBRE}
              error={errores.nombre}
              onChange={(nombre) => poner({ nombre })}
            />
            <div className="mt-5 min-w-0">
              <label htmlFor="joya-categoria" className="text-xs tracking-[0.16em] text-gold uppercase">
                Categoría
              </label>
              <select
                id="joya-categoria"
                value={borrador.categoriaId}
                onChange={(event) => poner({ categoriaId: event.target.value })}
                className="mt-2 min-h-11 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
              >
                <option value="">Elige una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errores.categoria ? <p className="mt-1 text-xs text-ink">{errores.categoria}</p> : null}
            </div>
            <CampoTexto id="joya-referencia" etiqueta="Referencia" value={borrador.referencia} onChange={(referencia) => poner({ referencia })} />
            <CampoTexto id="joya-material" etiqueta="Material" value={borrador.material} onChange={(material) => poner({ material })} />
            <CampoLargo
              id="joya-frase"
              etiqueta="Frase"
              value={borrador.frase}
              maxLength={LIMITE_FRASE}
              rows={3}
              error={errores.frase}
              onChange={(frase) => poner({ frase })}
            />
            <CampoLargo
              id="joya-descripcion"
              etiqueta="Descripción"
              value={borrador.descripcion}
              maxLength={LIMITE_DESCRIPCION}
              rows={5}
              error={errores.descripcion}
              onChange={(descripcion) => poner({ descripcion })}
            />
          </fieldset>

          <fieldset className="mt-8 min-w-0 border-0 p-0" disabled={guardando}>
            <legend className="text-xs tracking-[0.16em] text-gold uppercase">Fotos</legend>
            <div
              className="mt-3 border border-dashed border-gold-line px-4 py-4"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                agregar([...event.dataTransfer.files]);
              }}
            >
              <p className="text-sm text-muted">Toca para elegir o suelta las fotos aquí.</p>
              <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center bg-ink px-4 text-xs tracking-[0.12em] text-ivory uppercase">
                Elegir fotos
                <input
                  id="joya-fotos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    agregar([...(event.target.files ?? [])]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            {fotoError ? <p className="mt-2 text-xs text-ink">{fotoError}</p> : null}
            {progreso != null ? (
              <div className="mt-3">
                <Progreso valor={progreso} />
              </div>
            ) : null}
            {visibles.length === 0 ? <p className="mt-3 text-sm text-muted">Esta joya no tiene fotos.</p> : null}
            <ul className="mt-3">
              {visibles.map((foto, indice) => (
                <li key={foto.key} className="flex min-w-0 items-center gap-3 border-t border-gold-line py-3">
                  <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                    <VistaFoto archivo={foto.archivo} url={foto.url} className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={foto.esPrincipal}
                      onClick={() => principal(foto.key)}
                      className={`inline-flex min-h-11 items-center px-3 text-xs tracking-[0.12em] uppercase ${
                        foto.esPrincipal ? "bg-ink text-ivory" : "border border-gold-line text-ink"
                      }`}
                    >
                      Principal
                    </button>
                    <button type="button" disabled={indice === 0} onClick={() => moverFoto(foto.key, -1)} className="inline-flex min-h-11 items-center px-3 text-xs tracking-[0.12em] text-ink uppercase disabled:opacity-40">
                      Subir
                    </button>
                    <button
                      type="button"
                      disabled={indice === visibles.length - 1}
                      onClick={() => moverFoto(foto.key, 1)}
                      className="inline-flex min-h-11 items-center px-3 text-xs tracking-[0.12em] text-ink uppercase disabled:opacity-40"
                    >
                      Bajar
                    </button>
                    <button type="button" onClick={() => quitarFoto(foto.key)} className="inline-flex min-h-11 items-center px-3 text-xs tracking-[0.12em] text-gold uppercase">
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="mt-8 min-w-0 border-0 p-0" disabled={guardando}>
            <legend className="text-xs tracking-[0.16em] text-gold uppercase">Precio</legend>
            <CampoTexto
              id="joya-precio"
              etiqueta="Precio"
              inputMode="numeric"
              value={borrador.precio}
              error={errores.precio}
              onChange={(valor) => poner({ precio: miles(valor) })}
            />
            <CampoTexto
              id="joya-precio-promo"
              etiqueta="Precio promo"
              inputMode="numeric"
              value={borrador.precioPromo}
              error={errores.promo}
              onChange={(valor) => poner({ precioPromo: miles(valor) })}
            />
            {descuento != null ? <p className="mt-2 text-sm text-muted">{descuento}% de descuento</p> : null}
            <CampoTexto id="joya-etiqueta" etiqueta="Etiqueta" value={borrador.etiqueta} onChange={(etiqueta) => poner({ etiqueta })} />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="joya-inicio" className="text-xs tracking-[0.16em] text-gold uppercase">
                  Inicio
                </label>
                <input
                  id="joya-inicio"
                  type="date"
                  value={borrador.inicio}
                  onChange={(event) => poner({ inicio: event.target.value })}
                  className="mt-2 min-h-11 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="joya-fin" className="text-xs tracking-[0.16em] text-gold uppercase">
                  Fin
                </label>
                <input
                  id="joya-fin"
                  type="date"
                  value={borrador.fin}
                  onChange={(event) => poner({ fin: event.target.value })}
                  className="mt-2 min-h-11 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
                />
              </div>
            </div>
            {errores.fechas ? <p className="mt-1 text-xs text-ink">{errores.fechas}</p> : null}
          </fieldset>

          <fieldset className="mt-8 min-w-0 border-0 p-0" disabled={guardando}>
            <legend className="text-xs tracking-[0.16em] text-gold uppercase">Visibilidad</legend>
            <div className="mt-3 flex items-center justify-between gap-3 border-b border-gold-line py-2">
              <span className="text-sm text-ink">Activa</span>
              <Interruptor activo={borrador.activa} etiqueta="Joya activa" onChange={(activa) => poner({ activa })} />
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-gold-line py-2">
              <span className="text-sm text-ink">Destacada</span>
              <Interruptor activo={borrador.destacada} etiqueta="Joya destacada" onChange={(destacada) => poner({ destacada })} />
            </div>
            <CampoTexto
              id="joya-stock"
              etiqueta="Stock"
              inputMode="numeric"
              value={borrador.stock}
              error={errores.stock}
              onChange={(valor) => poner({ stock: miles(valor) })}
            />
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-gold-line bg-ivory px-5 py-3">
          <Boton type="submit" disabled={guardando} className="sm:w-full">
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          <Boton secundario disabled={guardando} className="sm:w-full" onClick={onCerrar}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}

function CampoTexto({
  id,
  etiqueta,
  value,
  onChange,
  maxLength,
  error,
  requerido = false,
  inputMode,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  maxLength?: number;
  error?: string;
  requerido?: boolean;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="mt-5 min-w-0">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        {etiqueta}
        {requerido ? " *" : ""}
      </label>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
      />
      {maxLength ? (
        <p className="mt-1 text-right text-xs text-muted">
          {value.length}/{maxLength}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CampoLargo({
  id,
  etiqueta,
  value,
  onChange,
  maxLength,
  rows,
  error,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  maxLength: number;
  rows: number;
  error?: string;
}) {
  return (
    <div className="mt-5 min-w-0">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
      />
      <p className="mt-1 text-right text-xs text-muted">
        {value.length}/{maxLength}
      </p>
      {error ? <p className="mt-1 text-xs text-ink">{error}</p> : null}
    </div>
  );
}

function nuevoBorrador(categoriaId: string): Borrador {
  return {
    id: null,
    nombre: "",
    categoriaId,
    referencia: "",
    material: "",
    frase: "",
    descripcion: "",
    precio: "",
    precioPromo: "",
    etiqueta: "",
    inicio: "",
    fin: "",
    activa: true,
    destacada: false,
    stock: "",
    imagenUrl: null,
    imagenLocal: null,
    fotos: [],
  };
}

function desdeJoya(pieza: Joya): Borrador {
  const fotos = pieza.fotos.length
    ? pieza.fotos
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((foto) => ({
          key: foto.id,
          id: foto.id,
          url: foto.url,
          path: foto.path,
          archivo: null,
          esPrincipal: foto.esPrincipal,
          quitar: false,
          heredada: false,
        }))
    : heredada(pieza);
  return {
    id: pieza.id,
    nombre: pieza.nombre,
    categoriaId: pieza.categoria_id,
    referencia: pieza.referencia ?? "",
    material: pieza.material ?? "",
    frase: pieza.frase,
    descripcion: pieza.descripcion,
    precio: pieza.precio == null ? "" : miles(String(pieza.precio)),
    precioPromo: pieza.precio_promo == null ? "" : miles(String(pieza.precio_promo)),
    etiqueta: pieza.promo_etiqueta ?? "",
    inicio: fechaInput(pieza.promo_inicio),
    fin: fechaInput(pieza.promo_fin),
    activa: pieza.activa,
    destacada: pieza.destacada,
    stock: pieza.stock == null ? "" : String(pieza.stock),
    imagenUrl: pieza.imagen_url,
    imagenLocal: pieza.imagen_local,
    fotos: asegurarPrincipal(fotos),
  };
}

function heredada(pieza: Joya): FotoBorrador[] {
  const local = urlLocal(pieza.imagen_local);
  const url = pieza.imagen_url || local;
  if (!url) return [];
  return [
    {
      key: "heredada",
      id: null,
      url,
      path: rutaEnBucket(pieza.imagen_url),
      archivo: null,
      esPrincipal: true,
      quitar: false,
      heredada: true,
    },
  ];
}

function asegurarPrincipal(fotos: FotoBorrador[]): FotoBorrador[] {
  const visibles = fotos.filter((foto) => !foto.quitar);
  if (!visibles.length) return fotos;
  if (visibles.some((foto) => foto.esPrincipal)) return fotos;
  let marcada = false;
  return fotos.map((foto) => {
    if (foto.quitar || marcada) return foto;
    marcada = true;
    return { ...foto, esPrincipal: true };
  });
}

function firma(borrador: Borrador) {
  const fotos = borrador.fotos.map((foto) =>
    [foto.key, foto.quitar ? 1 : 0, foto.esPrincipal ? 1 : 0, foto.archivo?.name ?? "", foto.archivo?.size ?? 0, foto.url ?? ""].join(":"),
  );
  return JSON.stringify({ ...borrador, fotos, archivo: undefined });
}

function validar(borrador: Borrador): Errores {
  const errores: Errores = {};
  const nombre = borrador.nombre.trim();
  if (!nombre) errores.nombre = "Escribe el nombre.";
  else if (nombre.length > LIMITE_NOMBRE) errores.nombre = "El nombre puede tener hasta 120 caracteres.";
  if (!borrador.categoriaId) errores.categoria = "Elige una categoría.";
  if (borrador.frase.trim().length > LIMITE_FRASE) errores.frase = "La frase puede tener hasta 200 caracteres.";
  if (borrador.descripcion.trim().length > LIMITE_DESCRIPCION) errores.descripcion = "La descripción puede tener hasta 2000 caracteres.";
  const precio = aEntero(borrador.precio);
  const promo = aEntero(borrador.precioPromo);
  if (borrador.precio && precio == null) errores.precio = "El precio solo admite números.";
  if (promo != null && precio == null) errores.promo = "Escribe el precio antes de la promoción.";
  else if (promo != null && precio != null && promo >= precio) errores.promo = "El precio de promoción tiene que ser menor que el precio.";
  if ((borrador.inicio || borrador.fin || borrador.etiqueta.trim()) && promo == null) {
    errores.promo = errores.promo ?? "Escribe el precio de promoción o quita la etiqueta y las fechas.";
  }
  if (borrador.inicio && borrador.fin && borrador.fin < borrador.inicio) {
    errores.fechas = "La fecha final tiene que ser posterior a la inicial.";
  }
  if (borrador.stock && aEntero(borrador.stock) == null) errores.stock = "El stock solo admite números.";
  return errores;
}

function tieneFoto(pieza: Joya) {
  return Boolean(pieza.imagen_url || pieza.imagen_local || pieza.fotos.length);
}

function miniatura(pieza: Joya) {
  const principal = pieza.fotos.find((foto) => foto.esPrincipal) ?? pieza.fotos[0];
  if (principal?.url) return principal.url;
  if (pieza.imagen_url) return pieza.imagen_url;
  return urlLocal(pieza.imagen_local);
}

function urlLocal(nombre: string | null) {
  if (!esImagenNombre(nombre)) return null;
  return `${import.meta.env.BASE_URL}img/${nombre}.webp`;
}

function aFilas(fotos: FotoBorrador[]): FotoFila[] {
  return fotos
    .filter((foto) => foto.id && !foto.heredada)
    .map((foto, indice) => ({
      id: foto.id as string,
      url: foto.url,
      path: foto.path,
      orden: indice,
      esPrincipal: foto.esPrincipal,
    }));
}

async function sincronizarFotos(
  joyaId: string,
  fotos: FotoBorrador[],
  onProgreso: (fraccion: number) => void,
): Promise<{ url: string | null; fotos: FotoBorrador[] }> {
  const quitadas = fotos.filter((foto) => foto.quitar && !foto.heredada);
  for (const foto of quitadas) {
    if (foto.id) {
      const { error } = await supabase.from("joya_fotos").delete().eq("id", foto.id);
      if (error) throw error;
    }
    await borrarFoto(foto.url);
  }
  for (const foto of fotos.filter((item) => item.quitar && item.heredada)) {
    await borrarFoto(foto.url);
  }

  let lista = fotos.filter((foto) => !foto.quitar && !foto.heredada).map((foto) => ({ ...foto }));
  lista = marcarUna(lista);
  const pendientes = lista.filter((foto) => foto.archivo);
  const subidas: string[] = [];
  let enlazadas = false;
  try {
    for (let i = 0; i < pendientes.length; i++) {
      const foto = pendientes[i];
      if (!foto?.archivo) continue;
      const subida = await subirFotoDeJoya(foto.archivo, joyaId, (fraccion) => {
        onProgreso((i + fraccion) / pendientes.length);
      });
      subidas.push(subida.path);
      lista = lista.map((item) => (item.key === foto.key ? { ...item, url: subida.url, path: subida.path, archivo: null } : item));
    }
    if (lista.some((foto) => foto.id)) {
      const { error } = await supabase.from("joya_fotos").update({ es_principal: false }).eq("joya_id", joyaId);
      if (error) throw error;
    }
    for (let i = 0; i < lista.length; i++) {
      const foto = lista[i];
      if (!foto?.id) continue;
      const { error } = await supabase
        .from("joya_fotos")
        .update({ orden: i, url: foto.url, path: foto.path, es_principal: false })
        .eq("id", foto.id);
      if (error) throw error;
    }
    const nuevas = lista.flatMap((foto, orden) => (foto.id ? [] : [{ foto, orden }]));
    if (nuevas.length) {
      const { data, error } = await supabase
        .from("joya_fotos")
        .insert(
          nuevas.map(({ foto, orden }) => ({
            joya_id: joyaId,
            url: foto.url,
            path: foto.path,
            orden,
            es_principal: false,
          })),
        )
        .select("id,path");
      if (error || !data) throw error ?? new Error("No se pudo registrar la foto.");
      const ids = new Map(data.map((fila) => [String(fila.path), String(fila.id)]));
      lista = lista.map((foto) => (foto.id ? foto : { ...foto, id: ids.get(foto.path ?? "") ?? null }));
    }
    enlazadas = true;
    const principal = lista.find((foto) => foto.esPrincipal) ?? lista[0];
    if (principal?.id) {
      const { error } = await supabase.from("joya_fotos").update({ es_principal: true }).eq("id", principal.id);
      if (error) throw error;
      lista = lista.map((foto) => ({ ...foto, esPrincipal: foto.id === principal.id }));
    }
    return { url: principal?.url ?? null, fotos: lista };
  } catch (error) {
    if (!enlazadas) await borrarRutas(subidas);
    throw error;
  }
}

function marcarUna(fotos: FotoBorrador[]) {
  if (!fotos.length) return fotos;
  if (!fotos.some((foto) => foto.esPrincipal)) return fotos.map((foto, indice) => ({ ...foto, esPrincipal: indice === 0 }));
  let vista = false;
  return fotos.map((foto) => {
    if (!foto.esPrincipal || vista) return { ...foto, esPrincipal: false };
    vista = true;
    return foto;
  });
}

function normalizar(fila: {
  id: unknown;
  categoria_id: unknown;
  nombre: unknown;
  frase: unknown;
  descripcion: unknown;
  alt: unknown;
  material: unknown;
  referencia: unknown;
  precio: unknown;
  precio_promo: unknown;
  promo_etiqueta: unknown;
  promo_inicio: unknown;
  promo_fin: unknown;
  stock: unknown;
  imagen_url: unknown;
  imagen_local: unknown;
  destacada: unknown;
  activa: unknown;
  orden: unknown;
}, fotos: FotoFila[]): Joya {
  return {
    id: String(fila.id),
    categoria_id: String(fila.categoria_id),
    nombre: String(fila.nombre ?? ""),
    frase: String(fila.frase ?? ""),
    descripcion: String(fila.descripcion ?? ""),
    alt: String(fila.alt ?? ""),
    material: fila.material ? String(fila.material) : null,
    referencia: fila.referencia ? String(fila.referencia) : null,
    precio: entero(fila.precio),
    precio_promo: entero(fila.precio_promo),
    promo_etiqueta: fila.promo_etiqueta ? String(fila.promo_etiqueta) : null,
    promo_inicio: fila.promo_inicio ? String(fila.promo_inicio) : null,
    promo_fin: fila.promo_fin ? String(fila.promo_fin) : null,
    stock: entero(fila.stock),
    imagen_url: fila.imagen_url ? String(fila.imagen_url) : null,
    imagen_local: fila.imagen_local ? String(fila.imagen_local) : null,
    destacada: fila.destacada === true,
    activa: fila.activa !== false,
    orden: Number(fila.orden) || 0,
    fotos,
  };
}

function entero(valor: unknown): number | null {
  if (valor == null || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero) : null;
}
