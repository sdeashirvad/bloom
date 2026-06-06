---
name: Expo Router splash + navigation gate pattern
description: How to safely hold the splash screen until both fonts AND AsyncStorage hydration are done, without triggering "navigate before mounting Root Layout" errors.
---

## The rule
Never conditionally return `null` from a component that is a sibling or ancestor of an Expo Router `<Stack>`. If the Stack is absent from the tree on the first render, Expo Router's router is not initialised, and any `router.replace()` call will throw "Attempted to navigate before mounting the Root Layout component."

## The correct pattern (Bloom)

```
RootLayoutNav (returns null until fonts load — fonts = ~200ms, splash stays up)
└── GestureHandlerRootView
    └── BloomProvider (immediately starts AsyncStorage hydration)
        ├── SplashController   ← hides splash when fontsReady && !isLoading
        ├── NavigationGuard    ← calls router.replace() when !isLoading
        └── Stack              ← ALWAYS mounted once fonts ready; never toggled
```

- `SplashController` reads `isLoading` from BloomProvider; calls `SplashScreen.hideAsync()` once both are done.
- `NavigationGuard` has an early return inside its `useEffect` if `isLoading`, so it never navigates while storage is pending.
- `RootLayoutNav` itself returns `null` (safe — it's the root export, not the component that contains the Stack) until fonts resolve, which is fast and keeps the native splash up.

**Why:** Returning `null` from a child component that conditionally renders the `<Stack>` breaks Expo Router's internal router initialisation. The router must see the Stack on the very first commit.

**How to apply:** Whenever you need to delay navigation or hold the splash, do it via a null-returning sibling component inside the provider, not by conditionally rendering the Stack.
