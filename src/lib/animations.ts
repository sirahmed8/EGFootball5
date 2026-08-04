import { Variants } from 'framer-motion';

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1], // Apple-style smooth ease-out curve
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const cardItemVariant: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

export const modalSpring: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 360,
      mass: 0.85,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.16,
      ease: 'easeOut',
    },
  },
};

export const buttonMicroInteraction = {
  whileHover: { scale: 1.03, y: -1, transition: { type: 'spring', stiffness: 450, damping: 18 } },
  whileTap: { scale: 0.96, transition: { duration: 0.08 } },
};

export const cardHoverVariant = {
  whileHover: { y: -5, scale: 1.015, transition: { type: 'spring', stiffness: 360, damping: 20 } },
  whileTap: { scale: 0.98, transition: { duration: 0.08 } },
};

export const badgePopVariant: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 20 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

export const listItemVariant: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
};

export const glowPulseVariant: Variants = {
  animate: {
    boxShadow: [
      '0 0 12px rgba(245, 158, 11, 0.25)',
      '0 0 32px rgba(245, 158, 11, 0.65)',
      '0 0 12px rgba(245, 158, 11, 0.25)',
    ],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const tabSwitchVariant: Variants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const floatVariant: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};



