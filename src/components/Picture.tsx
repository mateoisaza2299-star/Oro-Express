import type { ImagenNombre } from "../data/medidas.ts";
import { fuentes } from "../lib/imagen.ts";

type Props = {
  nombre: ImagenNombre;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function Picture({ nombre, alt, sizes, priority = false, className }: Props) {
  const foto = fuentes(nombre);
  return (
    <img
      {...foto}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
