import { copy, type IdPagina } from "../content/es.ts";
import { useContenido } from "../lib/contenido.ts";
import { datoVisible } from "../lib/dato.ts";
import { irA } from "../lib/navegar.ts";

type Props = {
  id: IdPagina;
};

export function Pagina({ id }: Props) {
  const pagina = copy.paginas[id];

  return (
    <article className="mx-auto max-w-2xl px-5 pt-28 pb-20 lg:pt-36" data-testid="pagina" aria-labelledby="titulo-pagina">
      <a
        href="#inicio"
        className="inline-flex min-h-12 items-center text-xs tracking-[0.16em] text-gold uppercase"
        onClick={(event) => {
          event.preventDefault();
          irA("inicio");
        }}
      >
        {copy.ui.volverInicio}
      </a>
      <h1 id="titulo-pagina" className="mt-6 font-serif text-4xl leading-[1.05] font-medium text-ink md:text-5xl">
        {pagina.titulo}
      </h1>
      {id === "privacidad" ? <Privacidad /> : <Parrafos textos={"parrafos" in pagina ? pagina.parrafos : []} />}
    </article>
  );
}

function Parrafos({ textos }: { textos: readonly string[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      {textos.map((texto) => (
        <p key={texto} className="text-base leading-relaxed text-muted">
          {texto}
        </p>
      ))}
    </div>
  );
}

function Privacidad() {
  const pagina = copy.paginas.privacidad;
  const { datos } = useContenido();
  const responsable = datoVisible(datos.responsable);
  const nit = datoVisible(datos.nit);
  const correo = datoVisible(datos.correoDatos);
  const finalidad = datoVisible(datos.finalidad);

  return (
    <div className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-muted">
      <p>{pagina.intro}</p>
      <p>{pagina.aviso}</p>
      {responsable ? (
        <p>
          <span className="text-ink">Responsable. </span>
          {responsable}
        </p>
      ) : null}
      {nit ? (
        <p>
          <span className="text-ink">NIT. </span>
          {nit}
        </p>
      ) : null}
      {finalidad ? (
        <p>
          <span className="text-ink">{pagina.finalidadTitulo}. </span>
          {finalidad}
        </p>
      ) : null}
      <p className="text-ink">{pagina.derechosTitulo}</p>
      <ul className="list-disc pl-5">
        {pagina.derechos.map((derecho) => (
          <li key={derecho}>{derecho}</li>
        ))}
      </ul>
      <p>
        <span className="text-ink">{pagina.contactoTitulo}. </span>
        {pagina.contacto}
        {correo ? ` ${correo}` : ""}
      </p>
    </div>
  );
}
