import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function snapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

/** Sin animaciones de entrada en móvil o con prefers-reduced-motion. */
export function useLite() {
  const reduce = useReducedMotion();
  const mobile = useSyncExternalStore(subscribe, snapshot, () => true);
  return reduce === true || mobile;
}
