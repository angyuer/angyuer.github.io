# Angyuer Blog Design System

## Direction

Immersive Studio Glass: a content-first personal blog with an atmospheric hero,
low-density Apple-inspired cards, and a restrained liquid-glass material system.
The result should feel personal and cinematic without becoming decorative or busy.

## Principles

- Keep the visual hierarchy to three layers: immersive image, glass material, readable content.
- Use scale, spacing, and a clear lead card to create distinction.
- Use neutral graphite and pearl surfaces. Do not use blue or green selected states.
- Let the hero and article imagery provide color; keep UI chrome neutral.
- Use one radius scale consistently: 22px glass, 26px cards, 14px controls.
- Do not copy Anheyu, Heo, or Apple layouts; borrow only general hierarchy and material principles.
- Keep motion between 160ms and 220ms and respect reduced-motion preferences.
- Preserve 4.5:1 text contrast and 44px minimum interactive targets.

## Tokens

### Light

- Page: `#e6ebee` with a warm `#f0ece6` transition
- Surface: `#f7f5f2`
- Muted surface: `#dfe5e8`
- Text: `#1d1d1f`
- Muted text: `#606066`
- Border: `rgba(29, 29, 31, 0.10)`
- Neutral accent: `#6e6e73`

### Dark

- Page: `#101316` with a warm `#1a1716` transition
- Surface: `#1d2022`
- Muted surface: `#292c2e`
- Text: `#f1f2f3`
- Muted text: `#aeb2b6`
- Border: `rgba(255, 255, 255, 0.10)`
- Neutral accent: `#c6c2bc`

## Material

- Hero glass: translucent neutral at 13-22% opacity.
- Surface glass: pearl or graphite at 58-72% opacity.
- Blur: 28px with moderate saturation, not a flat opaque gray fill.
- Use a fine light border, a top-edge highlight, and one soft depth shadow.
- Glass must sit above visible imagery or ambient color so transparency has purpose.
- Continue below the hero with a cool-to-warm neutral wash and subtle ambient tints; do not download the desktop hero again as a page background.
- Browsers without backdrop filtering receive an opaque readable fallback.

## Typography

- Use the system UI stack for reliable Chinese and Latin rendering.
- Display: 58/62 desktop, 44/48 mobile, weight 700.
- Section heading: 32/38, weight 700.
- Card title: 21/29, weight 700; lead card 34/42.
- Body: 16/30 for articles and 14/23 for summaries.
- Letter spacing is always zero.

## Layout

- Content width: 1120px.
- Navigation edge spacing: `clamp(20px, 3vw, 48px)` on desktop and `12px` on mobile,
  independent from the centered content width and extended for device safe areas.
- Hero: one complete viewport (`100svh`) on desktop and mobile.
- Home navigation is full-width and transparent over the hero.
- Downward scrolling hides navigation; upward scrolling reveals full-width glass navigation.
- Desktop cards: a 12-column low-density grid with one full-image lead, two compact
  side cards, and one horizontal closing card.
- Tablet cards: two columns with a full-width lead and final item.
- Mobile cards: one column; retain card radius and page gutters.

## Interaction

- Hover raises cards by at most 4px and restores a small amount of image saturation.
- Active filters use pearl white and graphite text, without a colored fill.
- All icon controls use consistent 44px targets and visible focus rings.
- Theme switching updates in one frame; only the toggle icon animates, so glass layers are not
  snapshotted, disabled, or rebuilt during the interaction.
- Search, theme switching, filters, TOC, code copy, and comments remain functional.
