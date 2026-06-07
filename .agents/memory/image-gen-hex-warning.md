---
name: Image gen hex code warning
description: AI image generators render hex codes from prompts as literal text labels on the image.
---

**Rule:** Never include hex color codes (e.g. `#D4876A`, `FBF7F0`) directly in an image generation prompt.

**Why:** The model treats them as text to render in the image, producing visible labels/annotations on the artwork.

**How to apply:** Describe colors by name only — "warm dusty rose", "muted terracotta peach", "warm ivory cream", "blush pink". Use the `negativePrompt` to add `"text, labels, letters, numbers, annotations"` as a safeguard.
