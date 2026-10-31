# Oro-Express

Landing de una sola página. Vite, React, TypeScript y Tailwind CSS.

El nombre visible, WhatsApp, Instagram, dirección y horario están en `src/config.ts`. Hoy dicen `PENDIENTE`: no hay datos de negocio confirmados.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

La base pública está en `vite.config.ts` (`REPO`). Para este repositorio es `/Oro-Express/`.

## Páginas

El workflow `.github/workflows/pages.yml` publica `dist` en GitHub Pages solo cuando se dispara a mano. No hay rutas de cliente, así que no se copia `index.html` a `404.html`.

## Imágenes

Ver `IMAGENES.md`.
