---
name: Bloom Colors token gaps
description: Known missing tokens in Colors and their safe substitutes.
---

Colors object (constants/colors.ts) does NOT have:
- `primaryMuted` → use `Colors.textSoft` (#B09A80) as a muted warm tone near the primary family
- No dark-mode variants

**Why:** Colors was authored without a `primaryMuted` level; adding one would be fine but verify with the file first to avoid runtime undefined errors.

**How to apply:** Before using any Colors.x token in a new component, grep or read constants/colors.ts first. The object is ~58 lines — quick to scan.
