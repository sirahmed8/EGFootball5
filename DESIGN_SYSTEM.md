# EGFootball5 / Kickoff — Design System & Visual Architecture

## 🎨 Overview & Aesthetic Vision
The Kickoff UI/UX design system is built for a **high-energy, futuristic, stadium-inspired sports experience**. It blends vibrant OKLCH neon accents, sleek dark glassmorphism (`backdrop-filter`), tactile depth, soft elevation shadows, dynamic micro-interactions, and instant RTL/LTR readability.

---

## 💎 Color Palette & Design Tokens

### OKLCH Theme Tokens (Defined in `src/app/globals.css`)

#### Dark Mode (Default Theme)
- **Background**: `oklch(0.12 0.01 250)` (Deep Midnight Charcoal)
- **Foreground**: `oklch(0.985 0 0)` (Pure Clean White)
- **Card Glass**: `oklch(0.15 0.01 250 / 60%)` with `backdrop-filter: blur(16px)`
- **Primary Accent**: `oklch(0.85 0.25 150)` (Electric Neon Field Green)
- **Secondary Accent**: `oklch(0.65 0.25 250)` (Vibrant Electric Blue)
- **Muted Text / Surfaces**: `oklch(0.708 0 0)` / `oklch(0.20 0.01 250)`
- **Destructive**: `oklch(0.704 0.191 22.216)` (Crimson Alert)
- **Borders & Inputs**: `oklch(1 0 0 / 10%)`

#### Light Mode
- **Background**: `oklch(1 0 0)` (Crisp Studio White)
- **Foreground**: `oklch(0.145 0 0)` (Deep Charcoal Black)
- **Primary Accent**: `oklch(0.65 0.25 150)` (High-Contrast Emerald Green)
- **Secondary Accent**: `oklch(0.55 0.25 250)` (Royal Stadium Blue)

---

## 🪟 Glassmorphism & Depth Utilities

```css
/* Custom Stadium Glass Surface */
.stadium-glass {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Neon Glow Effect */
.glow-primary {
  box-shadow: 0 0 20px oklch(0.85 0.25 150 / 30%), 0 0 40px oklch(0.85 0.25 150 / 10%);
}

/* Tactile Card Lift */
.card-lift {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 20px oklch(0.85 0.25 150 / 12%);
}
```

---

## 📐 Typography & Font Hierarchy
- **Primary Body**: `var(--font-sans)` (Inter / System Sans)
- **Arabic Typography**: `var(--font-cairo)` (Cairo font for Arabic elegance and legibility)
- **Monospace**: `var(--font-geist-mono)` (For stadium slot times, pricing, and counts)

### Scale & Weight Guidelines
- **Display Hero (`h1`)**: `text-4xl md:text-6xl font-extrabold tracking-tight`
- **Section Title (`h2`)**: `text-2xl md:text-3xl font-bold tracking-tight`
- **Card Title (`h3`)**: `text-lg md:text-xl font-semibold`
- **Body Text**: `text-sm md:text-base text-muted-foreground leading-relaxed`

---

## 🔲 Radii & Spacing Grid
- **Border Radii**:
  - `radius-sm`: `0.45rem`
  - `radius-md`: `0.6rem`
  - `radius-lg` (`var(--radius)`): `0.75rem`
  - `radius-xl`: `1.05rem`
  - `radius-2xl`: `1.35rem`
  - `radius-full`: `9999px`
- **Spacing Grid**: Standard 4px baseline (`p-2`, `p-4`, `p-6`, `p-8`, `gap-3`, `gap-6`).

---

## ✨ Motion & Micro-Interactions (Framer Motion Presets)

```typescript
// Fade & Upward Entrance
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

// Staggered Children Container
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

// Interactive Scale Click
export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 }
};
```

---

## 🧩 Standardized Base Components System

1. **Button (`src/components/ui/button.tsx`)**:
   - Variants: `default` (Neon Emerald), `secondary` (Electric Blue), `outline` (Glass Border), `ghost`, `destructive`.
   - Built-in scale micro-interactions & focus rings.
2. **Card (`src/components/ui/card.tsx`)**:
   - Built with `.stadium-glass` backdrop-blur and soft OKLCH border tints.
3. **Modal / Dialog (`src/components/ui/dialog.tsx`)**:
   - Overlay with deep blur backdrop (`backdrop-blur-md bg-black/60`).
4. **Form Inputs (`src/components/ui/input.tsx` & `select.tsx`)**:
   - Smooth focus ring with neon primary glow and clear validation feedback states.
5. **Badges & Status Tags**:
   - Soft translucent background with high-contrast text and dot indicators.
