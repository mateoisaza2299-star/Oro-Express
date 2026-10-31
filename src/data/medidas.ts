export type Medida = {
  ancho: number;
  alto: number;
  ancho640: number;
  alto640: number;
};

export const medidas = {
  "hero": { ancho: 1376, alto: 768, ancho640: 640, alto640: 357 },
  "col-anillos": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-collares": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-aretes": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-pulseras": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-compromiso": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-regalos": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "atelier": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-01": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-02": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-03": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-04": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-05": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-06": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-07": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "prod-08": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
} as const;

export type ImagenNombre = keyof typeof medidas;
