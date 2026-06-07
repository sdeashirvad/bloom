---
name: Bloom PDF export architecture
description: How the Memory Book PDF export is structured and wired.
---

**Packages:** expo-print (HTML→PDF), expo-sharing (share sheet). Both lazy-imported inside generateAndShare() to avoid crashing on web.

**Web fallback:** Blob + window.open() → browser print dialog. Not a true PDF but functional for web previewing.

**HTML template:** utils/memoryBookHtml.ts
- buildMemoryBookHtml(input: MemoryBookInput) → complete HTML string
- Self-contained: system fonts (Georgia serif for headings, system sans for body), warm cream palette, A4 page layout via CSS @page
- Structure: Cover → Opening letter → Kept-close section (if any) → Trimester header pages → Content pages (~4 entries/page) → Closing page
- All entries from exportSnapshot() in reflectionStore.ts feed in via MemoryBookInput

**UI entry:** ExportModal (components/ExportModal.tsx)
- States: idle → generating → done | error
- Wired to Sanctuary (settings.tsx) via "Export your journey" CTA card
- Haptics: Light on start, NotificationFeedbackType.Success on done

**Why:** expo-print is the simplest HTML→PDF path that works cross-platform for Expo managed workflow; expo-sharing handles the native share sheet without any platform-specific code.

**How to apply:** Future features (photo memories, postpartum chapters) should extend buildMemoryBookHtml() with new page-builder functions following the existing pattern. Do not add charts, counts, or analytics — this is an emotional keepsake, not a report.
