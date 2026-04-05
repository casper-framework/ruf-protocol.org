---
sidebar_position: 7
---

# Metric

A Metric is an analytics event embedded in the protocol. Rather than instrumenting analytics separately on the client, RUF treats metrics as a first-class part of the server response — the server decides what to track and when.

## Sub-constructs

| Sub-construct | Description |
|---|---|
| **rel** | A stable identifier for this metric within its screen or action. Used to reference the metric in a `buildPath` and to group related events. |
| **type** | A string identifying the analytics emitter to use (e.g. `FIREBASE`, `GOOGLE_ANALYTICS`). The protocol makes no assumptions about available types — implementors register their own emitters. |
| **name** | The event name as it should appear in the analytics system. |
| **payload** | A free-form object of event properties to attach to the event. |

## Extensible emitter types

The `type` field is open — the protocol does not define an enum of valid types. Each project defines the analytics integrations it supports and registers a corresponding emitter. When a Metric arrives with a known `type`, the client dispatches it to that emitter; unknown types are ignored.

This makes it straightforward to add new analytics integrations without changing the protocol.

```json
{
  "rel": "screen_view",
  "type": "FIREBASE",
  "name": "screen_view",
  "payload": { "screen_name": "checkout" }
}
```

## Firing points

Metrics are attached to three lifecycle points in the Session response:

| Location | When to fire |
|---|---|
| `screens[name].navigationMetrics` | When the screen becomes the active screen (e.g. pushed onto the stack) |
| `screens[name].metrics` | When the screen's content loads |
| `actionResult.actionMetrics` | After an action completes successfully |

The client **MUST** fire metrics at the appropriate point in the lifecycle, in the order they appear in the array.

## Identify and revenue variants

Some analytics platforms support special event types for user identification and revenue tracking. These are expressed as regular Metrics with a platform-specific `type` and a `payload` structure the emitter understands — for example:

```json
{
  "rel": "user_identify",
  "type": "FIREBASE",
  "name": "login",
  "payload": { "method": "email", "user_id": "u-123" }
}
```

The protocol treats all metrics uniformly; the emitter implementation handles the distinction.
