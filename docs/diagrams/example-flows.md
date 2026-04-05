---
sidebar_position: 2
---

# Example Flows

Concrete sequence diagrams for common RUF interaction patterns.

---

## 1. App startup

The application starts, creates a session, and renders the first screen.

```mermaid
sequenceDiagram
    participant App as Client
    participant BFF as Server

    App->>BFF: POST /session/create<br/>{ screen: "HOME", context: { os: "ios", version: "1.0" } }
    BFF-->>App: Session {<br/>  currentScreen: "HOME",<br/>  screens: { HOME: { components: { appbar: {...}, shelves: {...} } } },<br/>  meta: { token: null, cartCount: 0 }<br/>}
    Note over App: Store meta<br/>Cache components for HOME<br/>Render HOME screen
```

---

## 2. Simple action — component update

The user taps a button that triggers a server action. The server responds with updated components on the same screen.

```mermaid
sequenceDiagram
    participant App as Client
    participant BFF as Server

    Note over App: User taps "Load more products"

    App->>BFF: POST /session/action<br/>{ screen: "HOME", action: { type: "GET_HOME_CONTENT" }, meta: {...} }
    BFF-->>App: Session {<br/>  currentScreen: "HOME",<br/>  screens: { HOME: { components: { shelves: { mergeStrategy: APPEND, payload: { items: [...] } } } } },<br/>  actionResult: { type: "SUCCESS" }<br/>}
    Note over App: Append new items to shelves cache<br/>Re-render shelves component
```

---

## 3. Navigation — go to a new screen

The user triggers an action that navigates to a different screen.

```mermaid
sequenceDiagram
    participant App as Client
    participant BFF as Server

    Note over App: User taps a product card

    App->>BFF: POST /session/action<br/>{ screen: "HOME", action: { type: "GO_TO_PRODUCT", payload: { productId: "p-42" } }, meta: {...} }
    BFF-->>App: Session {<br/>  currentScreen: "PRODUCT",<br/>  screens: { PRODUCT: { components: { ... }, navigationMetrics: [...] } },<br/>  navigation: { id: "nav-1", mode: "PUSH", screen: "PRODUCT", flow: { name: "DISCOVERY", behavior: "KEEP" }, transition: "RIGHT_TO_LEFT" },<br/>  meta: { ... }<br/>}
    Note over App: Cache PRODUCT components<br/>Push PRODUCT onto stack with RIGHT_TO_LEFT animation<br/>Fire navigationMetrics for PRODUCT<br/>Render PRODUCT screen
```

---

## 4. Optimistic navigation + rollback

The client applies navigation speculatively. The server rejects it and the client rolls back.

```mermaid
sequenceDiagram
    participant App as Client
    participant BFF as Server

    Note over App: User taps "Proceed to Checkout"
    App->>App: Optimistically push CHECKOUT screen<br/>(id: "nav-2")
    Note over App: User sees CHECKOUT screen immediately

    App->>BFF: POST /session/action<br/>{ screen: "CART", action: { type: "GO_TO_CHECKOUT" }, meta: {...} }
    BFF-->>App: Session {<br/>  navigation: { id: "nav-2", mode: "FAILED" },<br/>  actionResult: { type: "TOAST", severity: "ERROR", code: "E101", message: "Cart is empty" }<br/>}
    Note over App: Match id "nav-2" → roll back to CART screen<br/>Show error toast: "Cart is empty"
```

---

## 5. Form submission with validation errors

The user submits a form. The server returns field-level validation errors.

```mermaid
sequenceDiagram
    participant App as Client
    participant BFF as Server

    Note over App: User fills in sign-up form and taps Submit

    App->>BFF: POST /session/action<br/>{ screen: "SIGN_UP_FORM", action: { type: "SUBMIT_SIGN_UP", payload: { email: "bad-email", password: "123" } }, meta: {...} }
    BFF-->>App: Session {<br/>  currentScreen: "SIGN_UP_FORM",<br/>  actionResult: {<br/>    type: "FORM_ERROR",<br/>    fields: {<br/>      email: { message: "Enter a valid email address", value: "bad-email" },<br/>      password: { message: "Password must be at least 8 characters", value: "123" }<br/>    }<br/>  }<br/>}
    Note over App: Display field errors on email and password inputs<br/>User remains on SIGN_UP_FORM
```
