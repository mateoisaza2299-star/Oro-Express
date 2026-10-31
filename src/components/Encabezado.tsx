import { Reveal } from "./Reveal.tsx";

type Props = {
  numero: string;
  lines: readonly string[];
  texto: string;
  tituloId: string;
};

export function Encabezado({ numero, lines, texto, tituloId }: Props) {
  return (
    <header className="mb-10 max-w-3xl md:mb-14">
      <p aria-hidden="true" className="mb-5 flex items-center gap-3 text-xs tracking-[0.22em] text-gold uppercase">
        <span className="font-serif text-lg tracking-normal normal-case">{numero}</span>
        <span className="h-px w-10 bg-gold-line" />
      </p>
      <Reveal
        as="h2"
        id={tituloId}
        lines={[...lines]}
        className="font-serif text-[2rem] leading-[1.02] font-medium tracking-[0.03em] text-ink md:text-[3.15rem]"
      />
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{texto}</p>
    </header>
  );
}
