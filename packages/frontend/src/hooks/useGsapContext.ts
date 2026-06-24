import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Returns true when the user has requested reduced motion.
 * Read once at mount — fine for a landing page (no live toggling expected).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type GsapSetup = (ctx: gsap.Context, reduced: boolean) => void;

/**
 * Scopes a GSAP context to a container ref. The setup callback runs inside
 * `gsap.context(...)` so every tween/ScrollTrigger created with the provided
 * `ctx.add` (or plain gsap calls referencing scoped selectors) is reverted on
 * unmount. The `reduced` flag lets callers swap cinematic timelines for plain
 * opacity fades when `prefers-reduced-motion: reduce` is set.
 *
 * Usage:
 *   const scope = useGsapContext((ctx, reduced) => {
 *     if (reduced) { gsap.set('.hero-el', { opacity: 1 }); return; }
 *     gsap.timeline().from('.hero-el', { y: 40, opacity: 0, stagger: 0.1 });
 *   });
 *   return <section ref={scope}>...</section>;
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(setup: GsapSetup) {
  const scope = useRef<T | null>(null);
  // Keep the latest setup without re-running the effect on every render.
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    if (!scope.current) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context((self) => {
      setupRef.current(self, reduced);
    }, scope);

    // Recalculate trigger positions after fonts/images settle.
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    window.addEventListener('load', refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return scope;
}
