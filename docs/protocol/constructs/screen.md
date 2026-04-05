---
sidebar_position: 3
---

# Screen

A Screen is the primary navigation unit in RUF. It represents a full page or view in the application, owns a set of components, and defines the interactions the user can perform while on it.

## Role in the protocol

Screens are the top-level structure the server uses to organize the user experience. When the server wants the client to display content, it sends screen data inside the `screens` map of the [Session](./session) response. When the user performs an action, the client identifies which screen the action came from.

## Sub-constructs

A Screen is defined by the following sub-constructs:

| Sub-construct | When present | Description |
|---|---|---|
| **name** | Always | Unique screen identifier (e.g. `HOME`, `CART`, `CHECKOUT`) |
| **components** | At runtime | The set of UI building blocks the screen renders, each identified by a stable `rel` |
| **screenParams** | Authoring time | Typed route-level parameters the screen accepts (e.g. a product ID, a redirect URL) |
| **actions** | Authoring time | The user interactions available on this screen, with their payloads and possible outcomes |
| **metrics** | At runtime | Analytics events associated with this screen |
| **transitions** | Authoring time | The default page animation used when navigating to this screen |

:::info Authoring-time vs runtime
`screenParams`, `actions`, and `transitions` are **authoring-time constructs**. They define the contract between the server implementation and the client type system. They do not appear as fields in the runtime response payload — the server and client agree on them at build time.

At runtime, the server sends `components` and `metrics` inside each screen entry in the `screens` map.
:::

## Screen names

Screen names are unique string identifiers, conventionally written in `SCREAMING_SNAKE_CASE` (e.g. `HOME`, `ORDER_LIST`, `ADDRESS_FORM`). They are the keys used in the `screens` map and the value of `currentScreen` in every Session response.

## Shared screens

Some screens may be reachable from multiple flows with different context. The `screenParams` construct allows a screen to accept typed parameters that customize its behavior — for example, a `PRODUCT` screen might accept a `productId` parameter, while a `WEBVIEW` screen might accept a `url`.

## Lifecycle within a session

A screen becomes active when the client's navigation stack changes to show it. At that point, the client fires its `navigationMetrics`. Component updates for a screen arrive in the `screens` map and are merged into the component cache. The screen continues to be rendered from cache until a new update arrives or the user navigates away.
