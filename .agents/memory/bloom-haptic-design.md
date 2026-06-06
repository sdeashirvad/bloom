---
name: Bloom haptic design
description: Haptic feedback hierarchy for Bloom — intentional, graduated, emotionally appropriate.
---

## Haptic hierarchy

| Action | Haptic |
|---|---|
| Mood button tap (select) | `ImpactFeedbackStyle.Light` |
| Transition between flow steps | `ImpactFeedbackStyle.Light` |
| Save reflection (completion) | `NotificationFeedbackType.Success` |
| Skip / dismiss | `ImpactFeedbackStyle.Light` |
| Destructive confirm (clear journey) | `NotificationFeedbackType.Success` |

**Why:** The save moment is the most emotionally significant action in the app. `NotificationFeedbackType.Success` produces a distinctive double-tap on iOS that marks the moment as complete and witnessed — different from the common Light impact used for navigation. This graduation makes the save feel intentional.

**How to apply:** Never use `ImpactFeedbackStyle.Medium` — it's too harsh for Bloom's emotional register. Reserve `NotificationFeedbackType.Success` for true completion moments only.
