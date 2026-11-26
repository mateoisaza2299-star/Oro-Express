export type Medida = {
  ancho: number;
  alto: number;
  ancho640: number;
  alto640: number;
};

export const medidas = {
  "hero": { ancho: 1376, alto: 919, ancho640: 640, alto640: 428 },
  "col-anillos": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-collares": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-aretes": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-pulseras": { ancho: 928, alto: 1152, ancho640: 640, alto640: 794 },
  "col-compromiso": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
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
  "flor-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "halo-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "halo-2": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "hoja-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "infinito-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "doble-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "catedral-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
  "fino-1": { ancho: 928, alto: 1160, ancho640: 640, alto640: 800 },
} as const;

export type ImagenNombre = keyof typeof medidas;
