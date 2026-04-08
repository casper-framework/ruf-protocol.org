---
sidebar_position: 1
---

# Session

The Session is the top-level response object returned by both API endpoints. It is the complete message the server sends to the client after any interaction.

## Fields

| Field | Type | Description |
|---|---|---|
| `currentScreen` | `string` | The screen the client should display after applying this response |
| `screens` | `object` | Map of screen name → screen data. Only screens that changed are included. |
| `navigation` | `object` | Optional [Navigation](../navigation/overview) directive describing how to update the screen stack |
| `actionResult` | `object` | Optional [ActionResult](./action#actionresult) describing the outcome of the action |
| `meta` | `object` | Partial [SessionMeta](./session-meta) patch — only fields that changed |
| `debug` | `object` | Optional debug and diagnostic information |

## Screen data

Each entry in the `screens` map contains the data for one screen:

| Field | Type | Description |
|---|---|---|
| `components` | `object` | Map of `rel` → [Component](./component). Only components that changed are included. |
| `metrics` | `array` | [Metrics](./metric) to fire when this screen loads |
| `navigationMetrics` | `array` | [Metrics](./metric) to fire when this screen becomes the active screen |

## How the client processes a Session

Upon receiving a Session response, the client should perform these steps in order:

1. **Merge meta patch** — shallow-merge `meta` into the local SessionMeta
2. **Update component cache** — for each component in `screens`, apply the component's `mergeStrategy` to update the cache
3. **Fire metrics** — fire `navigationMetrics` for screens becoming active, `metrics` for screens loading, and `actionMetrics` from the actionResult
4. **Execute navigation** — if `navigation` is present, update the screen stack accordingly
5. **Show actionResult** — if `actionResult` is present, display the appropriate feedback (toast, error, form errors)
6. **Render** — update the UI from the component cache for `currentScreen`

## Partial responses

The server only includes what changed. A response with an empty `screens` map is valid — it may carry only a `navigation` directive or a `meta` patch, for example. The client maintains a persistent component cache and should never clear it on a response that doesn't explicitly replace the data.
