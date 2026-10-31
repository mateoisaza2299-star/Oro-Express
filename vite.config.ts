import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Nombre del repositorio. GitHub Pages de proyecto sirve el sitio en `/${REPO}/`.
 * Cámbialo aquí si el repo se renombra. Déjalo vacío para publicar en la raíz.
 */
const REPO = "Oro-Express";

export default defineConfig({
  base: REPO ? `/${REPO}/` : "/",
  plugins: [react(), tailwindcss()],
});
