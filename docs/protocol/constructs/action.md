---
sidebar_position: 5
---

# Action

An Action represents a user interaction that the client can dispatch to the server. Actions are typed per screen — the server defines which actions are available and what they require.

## Sub-constructs

| Sub-construct | When present | Description |
|---|---|---|
| **type** | Always | A string identifier for the action (e.g. `GET_HOME_CONTENT`, `PLACE_ORDER`, `SUBMIT_FORM`). The screen name is not part of the type in the protocol — it is provided separately in the ActionRequest. |
| **payload** | Authoring time | The typed input data required to perform this action |
| **errors** | Authoring time | The possible ActionResult shapes this action may return |

:::info Authoring-time contract
`payload` and `errors` are **authoring-time constructs** — they define the typed contract between server and client. At runtime, the client populates and sends `action.payload`; the server returns one of the defined error shapes in `actionResult` if the action fails.
:::

## ActionRequest

When dispatching an action, the client sends an ActionRequest to `POST /session/action`:

| Field | Description |
|---|---|
| `screen` | The name of the screen where the action originated |
| `action.type` | The action type identifier |
| `action.payload` | The action input data |
| `meta` | The full current [SessionMeta](./session-meta) |

```json
{
  "screen": "CART",
  "action": {
    "type": "REMOVE_ITEM",
    "payload": { "itemId": "prod-123" }
  },
  "meta": { ... }
}
```

## ActionResult

Every action produces an ActionResult that the server includes in the Session response. ActionResult is a discriminated union on the `type` field.

### SUCCESS

The action completed successfully. May include an optional message.

```json
{ "type": "SUCCESS", "message": "Item removed from cart" }
```

### TOAST

The server wants to display a notification. `severity` controls the visual style.

```json
{
  "type": "TOAST",
  "severity": "ERROR",
  "code": "E001",
  "message": "Could not connect to the server"
}
```

| Field | Values |
|---|---|
| `severity` | `SUCCESS`, `ERROR`, `WARN` |
| `code` | Application-defined identifier for this notification |

### ERROR

A structured error, typically used to display an error state on the current screen.

```json
{ "type": "ERROR", "code": "E042", "message": "Payment declined" }
```

### FORM_ERROR

Field-level validation errors returned after a form submission.

```json
{
  "type": "FORM_ERROR",
  "fields": {
    "email": { "message": "Invalid email address", "value": "not-an-email" },
    "phone": { "message": "Phone number is required", "value": "" }
  }
}
```

Each field entry includes the error message and the value the user submitted when the error occurred.

## Error codes

Using unique, stable codes in `TOAST` and `ERROR` results is **strongly recommended**. Stable codes allow the client to handle specific errors programmatically, power analytics, and support i18n without coupling to error message strings.

See [Unique Error Codes](../../common-patterns/unique-error-codes) for a recommended approach.

## Action metrics

The server may include `actionMetrics` alongside an ActionResult. These are [Metrics](./metric) the client should fire after the action completes:

```json
{
  "actionResult": {
    "type": "SUCCESS",
    "message": "Order placed",
    "actionMetrics": [
      { "rel": "purchase", "type": "FIREBASE", "name": "purchase_complete", "payload": { "value": 49.90 } }
    ]
  }
}
```
