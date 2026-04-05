---
sidebar_position: 4
---

# Component

A Component is a typed UI building block within a [Screen](./screen). Components are what the server sends to drive rendering — each component carries its text, data, and a behavior variant that tells the client how to display it.

## Sub-constructs

| Sub-construct | Description |
|---|---|
| **rel** | A stable string identifier for this component within its screen (e.g. `appbar`, `product_list`, `submit_button`). The client uses `rel` as the key in its component cache. |
| **behavior** | A string discriminator that selects the component's rendering variant (e.g. `VISIBLE`, `HIDDEN`, `LINK`, `ACTION`). The client switches on this value to decide how to render. |
| **locale** | A flat `Map<string, string>` of text strings the component should display. I18n is handled server-side — the protocol simply delivers the final resolved strings. |
| **payload** | Component-specific data. Its shape varies per component type. |
| **mergeStrategy** | Only present on components with list-type payloads. Describes how new data should be merged into the component cache. |

## The `rel` identifier

The `rel` field is the component's identity within its screen. It is stable — it does not change between responses. The client uses `(screenName, rel)` as the cache key when storing and retrieving components.

When the server wants to update a specific component, it sends just that component in the `screens[name].components` map. The client finds the existing cached entry by `rel` and applies the merge strategy.

## Behavior variants

Each component defines a set of named behavior variants. The server selects one per response. Common conventions include:

| Behavior | Typical meaning |
|---|---|
| `VISIBLE` | Render the component normally |
| `HIDDEN` | Do not render this component |
| `LOADING` | Render a loading/skeleton state |
| `LINK` | Render as a navigable link |
| `ACTION` | Render as an interactive element that dispatches an action |

The specific variants available are defined per component type at authoring time. The client implements a rendering path for each variant.

## Locale

The `locale` field is a flat map of string keys to string values:

```json
{
  "locale": {
    "title": "Your Cart",
    "empty_message": "No items yet",
    "checkout_button": "Proceed to Checkout"
  }
}
```

This is not an i18n system — the server resolves the correct language and returns the final strings. The protocol just defines that text to be rendered lives in `locale`, separate from the structural `payload`.

## mergeStrategy

The `mergeStrategy` field is only returned for components whose `payload` contains a list. It controls how the client merges incoming data with what's already in its cache.

| Type | Behavior |
|---|---|
| `REPLACE` | The incoming component fully replaces the cached one. This is the default when no mergeStrategy is present. |
| `APPEND` | New list items are appended to the end of the existing list. |
| `MATCH` | New items are matched against existing items by their `id` field. Matched items are updated; unmatched existing items are left unchanged; new items without a match are added. |

```json
{
  "rel": "order_list",
  "behavior": "VISIBLE",
  "locale": {},
  "payload": { "items": [...] },
  "mergeStrategy": { "type": "APPEND" }
}
```

## Component cache

The client maintains a persistent component cache across the session. When a Session response arrives, the client iterates over `screens[name].components` and applies each component to the cache using its `mergeStrategy`. Screens and components not present in the response remain unchanged in cache.

This design allows the server to send minimal diffs — updating only what changed — while the client always renders from a complete local state.
