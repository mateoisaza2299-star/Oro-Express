import { Reveal } from "./Reveal.tsx";

type Props = {
  numero: string;
  titulo: string;
  texto: string;
  tituloId: string;
};

export function Encabezado({ numero, titulo, texto, tituloId }: Props) {
  return (
    <header className="mb-10 max-w-2xl md:mb-16">
      <p
        aria-hidden="true"
        className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-gold"
      >
        <span className="font-serif text-lg tracking-normal normal-case">{numero}</span>
        <span className="h-px w-10 bg-gold-line" />
      </p>
      <Reveal
        as="h2"
        id={tituloId}
        lines={[titulo]}
        className="font-serif text-[2.75rem] leading-[1.05] font-medium text-ink md:text-6xl"
      />
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{texto}</p>
    </header>
  );
}
