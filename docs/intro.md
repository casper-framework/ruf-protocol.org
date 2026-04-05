---
sidebar_position: 1
---

# Remote User Flows

RUF (Remote User Flows) is a protocol for building applications where the **server owns the entire user experience** — not just what to render, but how the user interacts with it, how screens transition, and how state evolves over time.

## The problem with traditional frontend state

Modern frontend applications manage many kinds of state simultaneously:

- **UI state** — which components are visible, loading, or in an error condition
- **Navigation state** — which screen the user is on and how they got there
- **Domain state** — user data, cart contents, form values
- **Interaction state** — which buttons trigger what, when, and with what side effects

Managing these independently leads to a familiar class of problems: bugs from inconsistent state across layers, difficulty enforcing business rules on the client, duplicated logic between platforms, and fragile coordination between frontend and backend teams.

## How RUF is different from Server-Driven UI

Traditional SDUI (Server-Driven UI) addresses the *rendering* problem: the server describes which components to display and with what data. The client is a generic renderer.

RUF goes further. In addition to rendering, the server also owns:

- **Interactions** — which actions are available, what they require, and what can go wrong
- **Navigation** — how screens stack, transition, and relate to each other
- **State transitions** — the server is the sole authority on how application state changes

The client's role is to render faithfully, dispatch user events, and apply optimistic updates for responsiveness — but it never decides what state *means* or how it should change.

## Core principles

| Principle | Description |
|---|---|
| **Server authoritative** | All state transitions are controlled by the server. The client never mutates state unilaterally. |
| **Client optimistic** | The client may speculatively apply navigation or component changes before the server responds, but must roll back on rejection. |
| **Type-safe contracts** | Screens, components, actions, and their payloads are fully typed end-to-end, enforced at authoring time. |
| **Analytics embedded** | Metrics are part of the protocol, not bolted on. The server instructs the client what to track and when. |
| **Platform agnostic** | RUF is a protocol, not a library. Any platform that can make HTTP requests and maintain local state can implement it. |

## Where to go from here

- [Protocol Lifecycle](./protocol/lifecycle) — understand the two-request loop that drives every RUF application
- [API Contract](./protocol/api-contract) — the exact request and response shapes
- [Constructs](./protocol/constructs/session) — detailed spec for each protocol building block
- [Protocol Rules](./protocol/rules) — the mandatory behaviors every implementation must follow
