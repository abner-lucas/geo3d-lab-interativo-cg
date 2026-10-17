/**
 * Motion utilities and transition presets for Geo3D
 * Designed to provide physical feel while strictly respecting WCAG 2.2 AA reduced motion settings.
 */

export const SPRING_TOUCH = {
  type: 'spring',
  stiffness: 450,
  damping: 28,
} as const;

export const SPRING_CARD = {
  type: 'spring',
  stiffness: 340,
  damping: 26,
} as const;

export const SPRING_POP = {
  type: 'spring',
  stiffness: 500,
  damping: 22,
} as const;

export const SPRING_MODAL = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
} as const;

export const TWEEN_SMOOTH = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
} as const;

/**
 * Helper to check if reduced motion is requested
 */
export function isReducedMotionActive(): boolean {
  if (typeof window === 'undefined') return false;
  const bodyHasClass = document.body.classList.contains('reduced-motion');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return bodyHasClass || prefersReduced;
}

/**
 * Slide variants for question stepping (supports forward and backward direction)
 */
export const questionSlideVariants = {
  enter: (direction: number) => ({
    x: isReducedMotionActive() ? 0 : direction > 0 ? 35 : -35,
    opacity: 0,
    filter: isReducedMotionActive() ? 'none' : 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'none',
    transition: isReducedMotionActive()
      ? { duration: 0.12 }
      : {
          x: { type: 'spring', stiffness: 350, damping: 28 },
          opacity: { duration: 0.22 },
          filter: { duration: 0.22 },
        },
  },
  exit: (direction: number) => ({
    x: isReducedMotionActive() ? 0 : direction > 0 ? -35 : 35,
    opacity: 0,
    filter: isReducedMotionActive() ? 'none' : 'blur(4px)',
    transition: isReducedMotionActive()
      ? { duration: 0.1 }
      : {
          x: { duration: 0.18, ease: 'easeIn' },
          opacity: { duration: 0.18 },
        },
  }),
};

/**
 * Modal scale & fade variants
 */
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: isReducedMotionActive() ? 1 : 0.94,
    y: isReducedMotionActive() ? 0 : 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: isReducedMotionActive()
      ? { duration: 0.12 }
      : {
          scale: { type: 'spring', stiffness: 380, damping: 28 },
          opacity: { duration: 0.2 },
          y: { type: 'spring', stiffness: 380, damping: 28 },
        },
  },
  exit: {
    opacity: 0,
    scale: isReducedMotionActive() ? 1 : 0.96,
    y: isReducedMotionActive() ? 0 : 8,
    transition: { duration: 0.15 },
  },
};
