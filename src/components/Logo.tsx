type Props = {
  variante?: "corto" | "claro";
  nombre: string;
  className?: string;
};

// Proporciones reales de cada archivo, para reservar el espacio y evitar saltos al cargar.
const medidas = {
  corto: { archivo: "logo-salem-corto", ancho: 1200, alto: 519 },
  claro: { archivo: "logo-salem-claro", ancho: 1200, alto: 675 },
} as const;

export function Logo({ variante = "corto", nombre, className }: Props) {
  const m = medidas[variante];
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/${m.archivo}.webp`}
      width={m.ancho}
      height={m.alto}
      alt={nombre}
      decoding="async"
      className={className}
    />
  );
}
