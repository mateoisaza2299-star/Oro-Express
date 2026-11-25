/**
 * Efectos de puntero compartidos por todos los botones.
 * - Ondas: un círculo nace donde se toca un `.btn-fx`.
 * - Imán: un `[data-magnetico]` se inclina hacia el cursor (solo ratón).
 * Todo se apaga con prefers-reduced-motion.
 */
export function iniciarEfectos(): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)");

  const alPulsar = (event: PointerEvent) => {
    if (reduce.matches) return;
    const el = (event.target as Element | null)?.closest<HTMLElement>(".btn-fx");
    if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
    const caja = el.getBoundingClientRect();
    const lado = Math.max(caja.width, caja.height) * 2;
    const onda = document.createElement("span");
    onda.className = "fx-ripple";
    onda.setAttribute("aria-hidden", "true");
    onda.style.cssText = `width:${lado}px;height:${lado}px;left:${event.clientX - caja.left - lado / 2}px;top:${event.clientY - caja.top - lado / 2}px`;
    el.appendChild(onda);
    onda.addEventListener("animationend", () => onda.remove(), { once: true });
  };

  const alMover = (event: PointerEvent) => {
    if (reduce.matches || !fino.matches) return;
    const el = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetico]");
    if (!el) return;
    const caja = el.getBoundingClientRect();
    const dx = (event.clientX - (caja.left + caja.width / 2)) / caja.width;
    const dy = (event.clientY - (caja.top + caja.height / 2)) / caja.height;
    el.style.setProperty("--mx", `${(dx * 14).toFixed(1)}px`);
    el.style.setProperty("--my", `${(dy * 10).toFixed(1)}px`);
  };

  const alSalir = (event: PointerEvent) => {
    const el = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetico]");
    if (!el || el.contains(event.relatedTarget as Node | null)) return;
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };

  document.addEventListener("pointerdown", alPulsar, { passive: true });
  document.addEventListener("pointermove", alMover, { passive: true });
  document.addEventListener("pointerout", alSalir, { passive: true });
  return () => {
    document.removeEventListener("pointerdown", alPulsar);
    document.removeEventListener("pointermove", alMover);
    document.removeEventListener("pointerout", alSalir);
  };
}
