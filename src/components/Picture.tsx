import type { ImagenNombre } from "../data/medidas.ts";
import { fuentes } from "../lib/imagen.ts";

type Props = {
  nombre?: ImagenNombre | null;
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function Picture({ nombre, src, alt, sizes, priority = false, className }: Props) {
  const foto = src ? { src, width: 928, height: 1160 } : nombre ? fuentes(nombre) : null;
  if (!foto) return null;
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
