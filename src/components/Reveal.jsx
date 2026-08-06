import { useEffect } from 'react';

/**
 * Lightweight scroll-reveal driver.
 *
 * Mounted once at the app root. Watches every element carrying a `data-reveal`
 * attribute and toggles `is-visible` when it enters the viewport. A mutation
 * observer picks up any elements added later (e.g. after route changes), so it
 * works across the whole site with zero per-page wiring.
 *
 * Respects `prefers-reduced-motion`: when the user asks for reduced motion,
 * everything is revealed immediately and no transition runs.
 */
export default function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealEls = () => document.querySelectorAll('[data-reveal]');

    if (reduce.matches || typeof IntersectionObserver === 'undefined') {
      revealEls().forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    const scan = () => {
      revealEls().forEach((el) => {
        if (!el.classList.contains('is-visible')) io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
