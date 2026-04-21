# Changelog — Invenio Design System

All notable changes to the Invenio unified design system. Scope: brand, tokens, components, and docs under `/docs/`, `/lib/design/`, `/components/ui/`, and `/assets/images/`.

The app's own version (see `app.json` / `package.json`) tracks product releases separately.

Versions follow [Semantic Versioning](https://semver.org):
- **Major (x.0.0)** — token renames, component API breaks, removed patterns
- **Minor (0.x.0)** — new tokens, new components, new patterns, new brand assets (backward compatible)
- **Patch (0.0.x)** — bug fixes, copy, visual polish, a11y fixes within existing tokens

Contribution rule: anything that introduces a new `--token`, a new `components/ui/*` file, or a new `docs/*.html` page needs a changelog entry.

---

## [0.2.0] — 2026-04-21

### Added
- **Motion tokens** (`--motion-fast 120ms`, `--motion-standard 180ms`, `--motion-slow 260ms`, `--ease-standard`, `--ease-emphasized`) in both `prototype.html` and `brand.html`. All hardcoded transition durations migrated to tokens.
- **Table density variants** — `.density-compact` (32px row) and `.density-spacious` (48px row) alongside default. Toggle UI in `prototype.html` Table section.
- **Print stylesheet** — `@media print` block in `prototype.html` that strips nav/chrome, forces black-on-white, preserves table integrity across page breaks, and adds URL footnotes to links. Designed for MSR / dashboard PDF exports.
- **Reduced-motion support** — `@media (prefers-reduced-motion: reduce)` halts animation for users who opt out.
- **Email template page** (`docs/email.html`) — full email-safe subset of the system: table-layout + inline-style rules, copy-paste transactional template (`PO assigned` example), color palette table, and Do/Don't usage rules.
- **Social preview** — `docs/og-image.svg` + rendered `og-image.png` (1200×630). Wired into `<meta property="og:image">` on `index.html`, `prototype.html`, `brand.html`, `email.html`.
- **App icon set** — `docs/brand/app-icon.svg` (iOS, full-bleed), `docs/brand/app-icon-adaptive.svg` (Android adaptive with safe-zone padding), `docs/brand/splash-icon.svg`. Rendered to PNG and installed at `assets/images/{icon,adaptive-icon,splash-icon,favicon}.png` so `app.json` references them on next Expo build.
- **Dark lockup** — `docs/brand/invenio-lockup-dark.svg` authored (was a CSS-filter placeholder). `brand.html` updated to ship the real file with download links.

### Changed
- `brand.html` dark-surface lockup no longer uses `filter: invert()` — uses the real dark SVG.

---

## [0.1.0] — 2026-04-21

### Added
- **Token module** (`lib/design/tokens.ts`) — single source of truth for color (light + dark), fontFamily, fontSize, fontWeight, space (4px base), radius (sm 6 / md 8 / lg 12 / xl 16 / pill), shadow (sm/md/lg, RN + web), motion, ring, and touch-target minimum (44px).
- **Component refactor** — all eight files under `components/ui/*.tsx` now import from `lib/design/tokens.ts`. Zero raw hex literals remain in components.
  - `Button.tsx` — migrated from `TouchableOpacity` to `Pressable`, added `ghost` variant, 44px min touch target, web focus ring, `accessibilityRole`/`accessibilityLabel`/`accessibilityState`. Primary color switched from `#2563EB` (blue-600) to `tokens.color.brandPrimary` (`#0369A1` sky-700) — this closes the cross-surface color drift the senior-design-reviewer flagged.
  - `Input.tsx` — slate colors (was gray), focused border + ring, helper/error/required support, `aria-invalid`, 44px min height, live-region on error text.
  - `Card.tsx` / `LoadingScreen.tsx` / `ErrorBoundary.tsx` / `OfflineIndicator.tsx` / `ProjectSelector.tsx` / `SignOutButton.tsx` — all tokenized, accessibility roles/labels added.
- **Design system showcase** (`docs/prototype.html`) — colors, type scale, buttons, stat tiles, cards, table, tags, iconography (8 Lucide-style SVGs), paired light/dark swatches, theme toggle, and primitives section (text input + helper/error/disabled, select, checkbox, radio, switch, 4-tone toasts, modal with focus trap semantics, empty state).
- **Brand asset page** (`docs/brand.html`) — mark (light + dark), lockup, favicon, size ladder 16→128px, clearspace diagram, gradient color spec, do/don't usage rules.
- **Brand marks** — `invenio-mark.svg`, `invenio-mark-dark.svg`, `invenio-lockup.svg`, `favicon.svg`. Wired via `<link rel="icon">` across docs pages.
- **Dark theme** — `[data-theme="dark"]` token overrides with persistence in `localStorage` and `prefers-color-scheme` detection. Brand mark auto-swaps to dark variant.
- **Focus ring** — `--ring` token + global `:focus-visible` rules. Every interactive element has a visible keyboard-focus indicator.
- **Reviewer subagent** — `.claude/agents/senior-design-reviewer.md`. Invoke with "run a design review" in any Claude Code session opened in this repo.

### Known gaps (carry-over)
- None — the items flagged by the 2026-04-21 reviewer are closed in 0.1.0 (tokens + primitives + focus ring) and 0.2.0 (motion + density + print + email + OG + app icons + dark lockup + changelog).

---

## Asset export notes

SVG sources live at `docs/brand/*.svg`. PNG versions are rendered via macOS `qlmanage` + `sips`:

```bash
# One-off PNG render at arbitrary size:
qlmanage -t -s 2048 -o /tmp docs/brand/app-icon.svg
sips -z 1024 1024 /tmp/app-icon.svg.png --out assets/images/icon.png
```

For the 1200×630 OG image (non-square), crop the center band after rendering:

```bash
qlmanage -t -s 2400 -o /tmp docs/og-image.svg
sips -c 1260 2400 /tmp/og-image.svg.png --out /tmp/og-cropped.png
sips -z 630 1200 /tmp/og-cropped.png --out docs/og-image.png
```

On Linux CI, `rsvg-convert` is a cleaner one-shot:

```bash
rsvg-convert -w 1024 -h 1024 docs/brand/app-icon.svg -o assets/images/icon.png
rsvg-convert -w 1200 -h 630  docs/og-image.svg       -o docs/og-image.png
```
