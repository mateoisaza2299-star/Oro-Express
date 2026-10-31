# Oro-Express

Landing de una sola página. Vite, React, TypeScript y Tailwind CSS.

El nombre visible es provisional (`Maison` en `src/config.ts`) hasta confirmarlo. Los textos viven en `src/content/es.ts`. WhatsApp, Instagram, dirección y horario no se muestran mientras sigan sin confirmar.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

La base pública está en `vite.config.ts`: `/Oro-Express/`.

## Páginas

El workflow `.github/workflows/deploy.yml` publica `dist` en GitHub Pages al hacer push a `main`, o al dispararlo a mano. La ayuda y lo legal son anclas (`#privacidad`, `#envios`…), sin router, así que no se copia `index.html` a `404.html`.

## Imágenes

Ver `IMAGENES.md`.
