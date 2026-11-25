type Props = {
  /** corto: corona + SALEM (cabecera). completo: con "Joyería" (pie, admin). */
  variante?: "corto" | "completo";
  /** blanco para fondos oscuros (azul rey); color para fondos claros. */
  tono?: "color" | "blanco";
  nombre: string;
  className?: string;
};

// Logo oficial en SVG: nítido a cualquier tamaño y pesa ~4 KB.
// Proporciones reales de cada archivo, para reservar el espacio y evitar saltos al cargar.
const archivos = {
  corto: { color: "logo-salem-corto", blanco: "logo-salem-corto-blanco", ancho: 1275, alto: 580 },
  completo: { color: "logo-salem", blanco: "logo-salem-blanco", ancho: 1490, alto: 850 },
} as const;

export function Logo({ variante = "corto", tono = "color", nombre, className }: Props) {
  const m = archivos[variante];
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/${m[tono]}.svg`}
      width={m.ancho}
      height={m.alto}
      alt={nombre}
      decoding="async"
      className={className}
    />
  );
}
