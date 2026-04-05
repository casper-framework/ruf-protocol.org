---
sidebar_position: 4
---

# Protocol Rules

These are the mandatory behaviors every RUF implementation must follow. The keywords **MUST**, **MUST NOT**, and **MAY** are used in the [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) sense.

## Client rules

### State management

- The client **MUST** send the full current `SessionMeta` on every action request.
- The client **MUST NOT** mutate `SessionMeta` directly. Only the server may transition state.
- The client **MUST** derive all necessary state from components. When shared state needs to be updated optimistically, a dedicated state-holding component must be used — not a direct meta mutation. See [Sharing Global State](../common-patterns/sharing-global-state).
- The client **MUST** apply `meta` patches from server responses via shallow merge, not full replacement.

### Component cache

- The client **MUST** maintain a component cache keyed by screen name and component `rel`.
- The client **MUST** apply the `mergeStrategy` field when updating cached components. If no strategy is present, `REPLACE` is assumed.

### Navigation

- The client **MUST** execute navigation directives returned in the `navigation` field of a Session response.
- The client **MUST** roll back the navigation stack to its pre-action state when `Navigation.mode` is `FAILED`.
- The client **MAY** apply navigation optimistically before the server responds, but **MUST** roll back if the server returns `FAILED`.

### Metrics

- The client **MUST** fire `navigationMetrics` when a screen becomes the active screen.
- The client **MUST** fire `metrics` when a screen is loaded.
- The client **MUST** fire `actionMetrics` after an action completes successfully.

### Requests

- The client **MUST** include a unique `x-request-id` header on every request for idempotency.

---

## Server rules

### Responses

- The server **MUST** include a `Navigation.id` in every navigation directive to support idempotency and rollback matching.
- The server **MUST** return only the screens and components that changed in a given response. Full responses on every request are wasteful and discouraged.
- The server **MUST** return `Navigation.mode = FAILED` when a navigation cannot be completed, rather than omitting the navigation field.

### State ownership

- The server **MUST** be the sole authority on `SessionMeta` changes. It communicates state changes via the `meta` field in the response.
- The server **MUST** treat the `meta` field in the action request as the authoritative current state of the client.
