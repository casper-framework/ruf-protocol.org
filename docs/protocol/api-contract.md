---
sidebar_position: 2
---

# API Contract

RUF exposes exactly two HTTP endpoints. Both accept and return JSON.

## Headers

Every request should include:

| Header | Description |
|---|---|
| `x-request-id` | A unique UUID generated per request. Used for idempotency and optimistic rollback matching. |

## POST /session/create

Called once when the application starts (or restarts). Establishes the initial session and returns the first screen to render.

### Request

```json
{
  "screen": "HOME",
  "screenParams": {},
  "context": {
    "os": "ios",
    "version": "2.4.1"
  },
  "previousSessionMeta": {}
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `screen` | `string` | Yes | The initial screen name to load |
| `screenParams` | `object` | No | Route-level parameters for the screen |
| `context` | `object` | Yes | Device/environment context (OS, app version, etc.) |
| `previousSessionMeta` | `object` | No | Persisted meta from a previous session, for state restore |

### Response

Returns a [Session](./constructs/session) object.

---

## POST /session/action

Called for every user interaction. The client sends the current screen, the action to perform, and the full current SessionMeta.

### Request

```json
{
  "screen": "HOME",
  "action": {
    "type": "GET_HOME_CONTENT",
    "payload": {}
  },
  "meta": {}
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `screen` | `string` | Yes | The name of the screen where the action originated |
| `action.type` | `string` | Yes | The action identifier |
| `action.payload` | `object` | Yes | Action-specific input data |
| `meta` | `object` | Yes | The full current [SessionMeta](./constructs/session-meta) |

### Response

Returns a [Session](./constructs/session) object. Only fields that changed are included — the response may contain a subset of screens and components.

---

## Session response shape

Both endpoints return the same Session structure:

```json
{
  "currentScreen": "HOME",
  "screens": {
    "HOME": {
      "components": {
        "appbar": { "behavior": "VISIBLE", "locale": {}, "payload": {} },
        "product_list": { "behavior": "VISIBLE", "locale": {}, "payload": {}, "mergeStrategy": { "type": "REPLACE" } }
      },
      "metrics": [],
      "navigationMetrics": []
    }
  },
  "navigation": {
    "id": "nav-uuid",
    "mode": "PUSH",
    "screen": "HOME",
    "flow": { "name": "DISCOVERY", "behavior": "START_NEW" },
    "transition": "FADE"
  },
  "actionResult": {
    "type": "SUCCESS",
    "message": "Welcome back"
  },
  "meta": {
    "token": "..."
  },
  "debug": {}
}
```

| Field | Type | Description |
|---|---|---|
| `currentScreen` | `string` | The screen the client should display after this response |
| `screens` | `object` | Map of screen name → screen payload (partial, only changed screens) |
| `screens[name].components` | `object` | Map of `rel` → [Component](./constructs/component) |
| `screens[name].metrics` | `array` | [Metrics](./constructs/metric) fired on screen load |
| `screens[name].navigationMetrics` | `array` | [Metrics](./constructs/metric) fired when screen becomes active |
| `navigation` | `object` | Optional [Navigation](./navigation/overview) directive |
| `actionResult` | `object` | Optional [ActionResult](./constructs/action#actionresult) |
| `meta` | `object` | Partial [SessionMeta](./constructs/session-meta) patch |
| `debug` | `object` | Optional debug information |
