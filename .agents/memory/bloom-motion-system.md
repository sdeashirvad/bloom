---
name: Bloom motion system
description: Standardized spring config for all slide/entrance animations — ensures no bounce in a calm emotional app.
---

## Rule
All slide-in / entrance springs use **damping: 24, stiffness: 88**.

**Why:** stiffness 88 with damping 24 → ratio 24 / (2√88) ≈ 1.28 — slightly overdamped. No oscillation, clean landing. Previous springs (stiffness 120, damping 18) were underdamped and visibly bounced, breaking the calm register of the app.

**How to apply:**
- Every `Animated.spring` for `translateY` or slide entrances → `{ damping: 24, stiffness: 88, useNativeDriver: true }`
- Fades use `Animated.timing` at 460–640ms (no spring needed)
- Touch press-down: `speed: 80, bounciness: 0` (compress)
- Touch release: `speed: 24, bounciness: 4` (gentle, not 8)
- Do NOT use `Animated.timing` for slide-in animations — use spring.
