---
sidebar_position: 4
---

# Screen Transitions

The `transition` field in a navigation directive controls the page animation used when the screen change occurs. It is optional — when omitted, the client uses its configured default transition.

## Available transitions

| Group | Values |
|---|---|
| Horizontal | `LEFT_TO_RIGHT`, `LEFT_TO_RIGHT_POP`, `LEFT_TO_RIGHT_FADE`, `LEFT_TO_RIGHT_JOINED` |
| Horizontal (reverse) | `RIGHT_TO_LEFT`, `RIGHT_TO_LEFT_POP`, `RIGHT_TO_LEFT_FADE`, `RIGHT_TO_LEFT_JOINED` |
| Vertical (down) | `TOP_TO_BOTTOM`, `TOP_TO_BOTTOM_POP`, `TOP_TO_BOTTOM_JOINED` |
| Vertical (up) | `BOTTOM_TO_TOP`, `BOTTOM_TO_TOP_POP`, `BOTTOM_TO_TOP_JOINED` |
| Neutral | `FADE`, `SCALE` |

### Variant suffixes

| Suffix | Meaning |
|---|---|
| _(none)_ | Standard slide animation |
| `_POP` | Return animation — the reverse of its forward counterpart. Use on POP or REPLACE to undo a previous directional transition. |
| `_FADE` | The incoming screen fades in instead of sliding fully |
| `_JOINED` | Screens animate together as a shared unit (hero-style). Use when elements from both screens are visually connected. |

## Convention guide

Choosing the right transition reinforces the user's spatial model of your app. Consistent conventions make navigation feel intuitive.

### Forward / deeper

Use `RIGHT_TO_LEFT` when navigating forward into a flow — deeper into a hierarchy, to the next step, or to a detail view. This signals "moving forward."

```
HOME → CATEGORY → PRODUCT   (all RIGHT_TO_LEFT)
CART → CHECKOUT              (RIGHT_TO_LEFT)
```

### Backward / return

Use `LEFT_TO_RIGHT` or `LEFT_TO_RIGHT_POP` for POP and REPLACE navigations that take the user back. This signals "moving back."

```
CHECKOUT ← CART              (LEFT_TO_RIGHT_POP on POP)
```

### Presenting overlays and modals

Use `BOTTOM_TO_TOP` when presenting a new context on top of the current screen — a sheet, modal, or contextual overlay. The screen appears to rise from below.

Use `TOP_TO_BOTTOM` when dismissing or closing that same context. The screen descends and disappears.

```
Open filter panel   → BOTTOM_TO_TOP
Close filter panel  → TOP_TO_BOTTOM
```

### Root-level context switches

Use `FADE` or `SCALE` for transitions that don't imply direction — a full stack RESET, a deep link landing, or a session start. These transitions signal "you are now somewhere else" without implying back/forward.

```
Deep link → RESET to HOME    (FADE)
Sign-in complete → RESET     (FADE or SCALE)
```

### Hero and shared-element transitions

Use `*_JOINED` variants when an element from the current screen is visually connected to the entering screen — for example, a product card expanding into a product detail view.

```
Product card tap → PRODUCT   (RIGHT_TO_LEFT_JOINED)
```
