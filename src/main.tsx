import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { copy } from "./content/es.ts";
import App from "./App.tsx";
import "./index.css";

registerSW({ immediate: true });

document.title = copy.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute("content", copy.meta.description);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
