# Imágenes

Las piezas publicadas están en `public/img/` como WebP (calidad 78). Cada archivo tiene una versión de 640 px de ancho para `srcset`: el mismo nombre con sufijo `-640.webp`.

Los JPG de origen están en `assets-src/img-originales/`. Esa carpeta pesa más de 5 MB y está en `.gitignore`. No se publica.

No se amplió ninguna foto: si el original es más chico que el máximo, se conserva su ancho.

## Reemplazo

Convierte a WebP, calidad aproximada 78, y genera también la versión de 640 px. Mantén el nombre.

| Archivo | Uso | Máximo recomendado | Salida actual | Origen |
| --- | --- | --- | --- | --- |
| `hero.webp` | Hero | 1920 px de ancho | 1376×768, 38 KB | `hero.jpg` (1376×768) |
| `col-anillos.webp` | Colección Anillos | 1000 px | 928×1152, 22 KB | `anillo-solitario.jpg` |
| `col-collares.webp` | Colección Collares | 1000 px | 928×1152, 28 KB | `collar-corazon.jpg` |
| `col-aretes.webp` | Colección Aretes | 1000 px | 928×1152, 96 KB | `aretes-perla.jpg` |
| `col-pulseras.webp` | Colección Pulseras | 1000 px | 928×1152, 45 KB | `pulsera-linea.jpg` |
| `col-compromiso.webp` | Colección Compromiso | 1000 px | 928×1152, 70 KB | `compromiso-estuche.jpg` |
| `col-regalos.webp` | Colección Regalos | 1000 px | 928×1152, 81 KB | `regalo-estuche.jpg` |
| `atelier.webp` | Atelier | 1400 px | 928×1152, 45 KB | `collar-bisel.jpg` |
| `prod-01.webp` | Anillo de cuatro garras | 1000 px | 928×1152, 22 KB | `anillo-solitario.jpg` |
| `prod-02.webp` | Argolla de perfil abombado | 1000 px | 928×1152, 19 KB | `argolla.jpg` |
| `prod-03.webp` | Collar con dije de corazón | 1000 px | 928×1152, 28 KB | `collar-corazon.jpg` |
| `prod-04.webp` | Collar con piedra en bisel | 1000 px | 928×1152, 45 KB | `collar-bisel.jpg` |
| `prod-05.webp` | Aretes de piedra en bisel | 1000 px | 928×1152, 15 KB | `aretes-bisel.jpg` |
| `prod-06.webp` | Aretes de perla | 1000 px | 928×1152, 96 KB | `aretes-perla.jpg` |
| `prod-07.webp` | Pulsera de eslabones | 1000 px | 928×1152, 20 KB | `pulsera-eslabon.jpg` |
| `prod-08.webp` | Pulsera de piedras en línea | 1000 px | 928×1152, 45 KB | `pulsera-linea.jpg` |

La versión `-640` de cada una usa el mismo recorte, a 640 px de ancho.

`src/data/medidas.ts` guarda el ancho y el alto reales. Si reemplazas una foto por otra de distinta proporción, actualiza esas medidas para que `width` y `height` sigan siendo los del archivo.

## Catálogo

`src/data/productos.ts` usa `prod-01` a `prod-08`. El precio no se publica: se conversa por WhatsApp. No hay quilates ni certificaciones.
