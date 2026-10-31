import type Lenis from "lenis";

let current: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  current = instance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (current && !reduce) {
    current.scrollTo(el, { offset: -84, duration: 1.05 });
  } else {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  const next = `#${id}`;
  if (window.location.hash !== next) {
    history.replaceState(null, "", next);
  }
}

export function setScrollLocked(locked: boolean) {
  document.documentElement.classList.toggle("is-locked", locked);
  if (!current) return;
  if (locked) current.stop();
  else current.start();
}
