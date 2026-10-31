import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { copy } from "./content/es.ts";
import App from "./App.tsx";
import "./index.css";

document.title = copy.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute("content", copy.meta.description);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
