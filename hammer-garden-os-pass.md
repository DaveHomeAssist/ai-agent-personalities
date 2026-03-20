# Hammer — Garden OS Token Normalization Pass

## Tuning

**Codebase:** Garden OS — `10-active-projects/garden-os/`
**Stack:** Vanilla HTML/CSS/JS, no build step, no framework, no npm.

**Architecture constraint (hard):** Every tool is a single self-contained `.html` file with inline `<style>` and `<script>`. No extraction to external files. No imports. No modules. This is load-bearing — do not split files.

**What this means for Hammer:** The pass operates entirely within inline `<style>` blocks. Token replacements happen inside each file's own style block. Scripts stay inline.

**Shared token source:** `garden-os-theme.css` defines the canonical token system. Every page that links to it inherits the `:root` values. For pages that do NOT link to the theme, token values must be defined locally in the inline `<style>` block.

**Known token conflict — resolve before normalizing:**
CLAUDE.md and garden-os-theme.css disagree on base color values:

| Token | CLAUDE.md value | theme.css value |
|---|---|---|
| `--soil` | `#5c3d1e` | `#3a2510` |
| `--leaf` | `#3d7a4f` | `#3a6b2a` |
| `--leaf-bright` | `#5aab6b` | `#4e8c3c` |
| `--sun` | `#e8c84a` | `#d4a820` |
| `--cream` | `#f7f2ea` | `#f7f3ec` |

**Resolution rule:** `theme.css` is the deployed token source. CLAUDE.md values are documentation drift. Normalize to `theme.css`. Flag any hardcoded value that doesn't match either — those need manual review.

**Two-track nav:** User track and dev track pages have different aesthetics. Dev track pages (scoring-visualizer, scoring-map, fairness-tester, system-map, system-topology) use system-ui/Inter, dark mode, and their own color palette. Do not apply the Garden OS token system to dev track files.

---

## Execution

### Pass 1 — Token Normalization

**Pattern:** Hardcoded hex values and `rgba()` literals inside inline `<style>` blocks that correspond to a token already defined in `garden-os-theme.css`.

**Surface area:** All user-track `.html` files that link to `garden-os-theme.css`:
- `index.html`, `garden-os-home.html`, `home.html`
- `garden-planner-v4.html`
- `garden-league-simulator-v4.html`
- `garden-os-dashboard.html`
- `garden-cage-build-guide.html`, `garden-cage-ops-guide.html`
- `how-it-thinks.html`, `storyline-test.html`

**Exclude:**
- Dev track pages: `scoring-visualizer.html`, `scoring-map.html`, `fairness-tester.html`, `system-map.html`, `system-topology.html`
- Versioned archives (files ending in `v3`, `_1`, `_3`, `copy`)
- The `garden-os-theme.css` file itself
- Hardcoded values inside JS string literals (cannot safely static-analyze)
- Shadow definitions — leave `rgba(44, 27, 11, 0.xx)` in inline styles as-is; they appear in `theme.css` as shadow tokens but inline overrides may be intentional tints
- `border: 1px` and `outline` rules — keep pixel values

**Step 1 — Audit (read-only)**

```bash
# Find all hardcoded hex values in inline style blocks of user-track pages
grep -n '#[0-9a-fA-F]\{3,6\}' \
  index.html garden-os-home.html home.html \
  garden-planner-v4.html garden-league-simulator-v4.html \
  garden-os-dashboard.html garden-cage-build-guide.html \
  garden-cage-ops-guide.html how-it-thinks.html storyline-test.html

# Find rgba() literals that could map to tokens
grep -n 'rgba(' \
  index.html garden-os-home.html garden-planner-v4.html \
  garden-league-simulator-v4.html garden-cage-build-guide.html \
  garden-cage-ops-guide.html
```

**Step 2 — Representative before/after**

Before (inside inline `<style>`):
```css
.nav-link { color: #5c3d1e; }
.section-title { color: #3d7a4f; }
.badge { background: #f7f2ea; border-color: #e8c84a; }
```

After:
```css
.nav-link { color: var(--soil); }
.section-title { color: var(--leaf); }
.badge { background: var(--cream); border-color: var(--sun-bright); }
```

**Step 3 — Codemod**

```bash
#!/bin/bash
# hammer-garden-os-pass1.sh
# Token normalization — user-track pages only.
# Run from garden-os/ root. Review diff before committing.

FILES=(
  index.html garden-os-home.html home.html
  garden-planner-v4.html garden-league-simulator-v4.html
  garden-os-dashboard.html garden-cage-build-guide.html
  garden-cage-ops-guide.html how-it-thinks.html storyline-test.html
)

for f in "${FILES[@]}"; do
  [ -f "$f" ] || continue

  # Soil family (use theme.css values, not CLAUDE.md values)
  sed -i '' 's/#3a2510/var(--soil)/g'       "$f"
  sed -i '' 's/#52331a/var(--soil-mid)/g'   "$f"
  sed -i '' 's/#7a5230/var(--soil-light)/g' "$f"
  # CLAUDE.md drift values — also normalize
  sed -i '' 's/#5c3d1e/var(--soil)/g'       "$f"

  # Cedar family
  sed -i '' 's/#8b5e3c/var(--cedar)/g'      "$f"
  sed -i '' 's/#b07d55/var(--cedar-light)/g' "$f"
  sed -i '' 's/#e0c8a8/var(--cedar-pale)/g' "$f"
  sed -i '' 's/#f2e8d8/var(--cedar-wash)/g' "$f"

  # Leaf family
  sed -i '' 's/#3a6b2a/var(--leaf)/g'       "$f"
  sed -i '' 's/#4e8c3c/var(--leaf-bright)/g' "$f"
  sed -i '' 's/#6aab4a/var(--leaf-light)/g' "$f"
  sed -i '' 's/#c8e6c0/var(--leaf-pale)/g'  "$f"
  sed -i '' 's/#edf5e8/var(--leaf-wash)/g'  "$f"
  # CLAUDE.md drift
  sed -i '' 's/#3d7a4f/var(--leaf)/g'       "$f"
  sed -i '' 's/#5aab6b/var(--leaf-bright)/g' "$f"

  # Sun family
  sed -i '' 's/#d4a820/var(--sun)/g'        "$f"
  sed -i '' 's/#e8c84a/var(--sun-bright)/g' "$f"
  sed -i '' 's/#faf0c0/var(--sun-pale)/g'   "$f"
  sed -i '' 's/#fdf8e8/var(--sun-wash)/g'   "$f"

  # Rust family
  sed -i '' 's/#b84a1a/var(--rust)/g'       "$f"
  sed -i '' 's/#d4651a/var(--rust-light)/g' "$f"
  sed -i '' 's/#f5d8c8/var(--rust-pale)/g'  "$f"
  sed -i '' 's/#fdf0e8/var(--rust-wash)/g'  "$f"

  # Cream family
  sed -i '' 's/#f7f3ec/var(--cream)/g'      "$f"
  sed -i '' 's/#ede5d8/var(--cream-mid)/g'  "$f"
  sed -i '' 's/#e4d8c8/var(--cream-deep)/g' "$f"
  sed -i '' 's/#fffdf9/var(--panel)/g'      "$f"
  # CLAUDE.md drift
  sed -i '' 's/#f7f2ea/var(--cream)/g'      "$f"

  # Text hierarchy
  sed -i '' 's/#1e1208/var(--text)/g'       "$f"
  sed -i '' 's/#4a3018/var(--text-mid)/g'   "$f"
  sed -i '' 's/#6f5840/var(--text-soft)/g'  "$f"
  sed -i '' 's/#9a8068/var(--text-muted)/g' "$f"
  # CLAUDE.md drift
  sed -i '' 's/#1e110a/var(--text)/g'       "$f"
  sed -i '' 's/#5a3e2b/var(--text-mid)/g'   "$f"

  # Borders
  sed -i '' 's/#c8b090/var(--border)/g'         "$f"
  sed -i '' 's/#dfd0b8/var(--border-soft)/g'    "$f"
  sed -i '' 's/#ede5d5/var(--border-subtle)/g'  "$f"

  echo "✓ $f"
done

echo ""
echo "Pass 1 complete. Review with: git diff *.html"
```

**Step 4 — Verification**

```bash
# Residual hardcoded hex values that should have been replaced
grep -n '#3a2510\|#5c3d1e\|#3a6b2a\|#3d7a4f\|#d4a820\|#e8c84a\|#f7f3ec\|#f7f2ea\|#1e1208\|#1e110a' \
  index.html garden-os-home.html garden-planner-v4.html \
  garden-league-simulator-v4.html garden-cage-build-guide.html \
  garden-cage-ops-guide.html && echo "RESIDUE — review above" || echo "CLEAN"
```

---

### Pass 2 — Inline Event Handler Removal

**Pattern:** `onmouseover`, `onmouseout`, `onclick`, `onfocus`, `onblur` attributes with inline style mutations. These break keyboard access and are an XSS surface.

**Surface area:** Same user-track files as Pass 1.

**Exclude:**
- Dev track pages
- Game-logic `onclick` handlers on dynamic elements rendered from JS (cannot safely statically migrate)
- Any `onchange` on `<select>` or `<input>` that feeds game state — flag for Chisel, do not auto-migrate

**Step 1 — Audit**

```bash
grep -n 'onmouseover\|onmouseout\|onclick\|onfocus\|onblur' \
  index.html garden-os-home.html home.html \
  garden-planner-v4.html garden-cage-build-guide.html garden-cage-ops-guide.html
```

**Step 2 — Representative before/after**

Before:
```html
<a href="..." style="color:rgba(0,0,0,0.35);transition:color .15s;"
   onmouseover="this.style.color='currentColor'"
   onmouseout="this.style.color='rgba(0,0,0,0.35)'">← All Projects</a>
```

After (inside the page's inline `<style>` block):
```css
.back-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: .7rem;
  letter-spacing: .04em;
  margin-right: .5rem;
  transition: color var(--ease);
}
.back-link:hover { color: var(--text); }
```

```html
<a href="..." class="back-link">← All Projects</a>
```

**This pass is manual** — there are too few instances for a safe sed codemod and each requires HTML + CSS coordination. Chisel runs these individually. Flag each instance with `<!-- HAMMER: inline-handler -->` for Chisel to pick up:

```bash
# Flag all inline handler instances for Chisel
for f in index.html garden-os-home.html home.html garden-planner-v4.html \
          garden-cage-build-guide.html garden-cage-ops-guide.html; do
  [ -f "$f" ] || continue
  # Add flag comment before each onmouseover line (non-destructive)
  sed -i '' 's/onmouseover=/<!-- HAMMER: inline-handler --> onmouseover=/g' "$f"
  echo "✓ flagged $f"
done
```

**Verification:**
```bash
grep -n 'HAMMER: inline-handler' index.html garden-os-home.html \
  home.html garden-planner-v4.html garden-cage-build-guide.html \
  garden-cage-ops-guide.html
# Each flag = one Chisel task
```

---

## Handoff to Chisel

After Pass 1: inline style blocks contain `var(--token)` references throughout. The visual surface is identical but the CSS is now maintainable.

After Pass 2 flagging: each `<!-- HAMMER: inline-handler -->` is one Chisel task. Chisel replaces the inline handler + inline styles with a CSS class in the same file's `<style>` block and removes the attribute. One at a time.
