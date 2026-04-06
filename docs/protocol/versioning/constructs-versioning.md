---
sidebar_position: 4
---

# Constructs Versioning

Components, actions, and metrics can each declare version-specific variants using a `versions:` map. The top-level construct definition is always the `latest` — the variant served to clients on the current version. Older client versions receive the variant declared for their version range.

See [Versioning Formats](./versioning-formats) for how version keys are resolved.

## Component versioning

```yaml
- rel: payment_method
  behaviors:
    - name: VISIBLE
      locale:
        brand_label: string
        expiry_label: string
        cvv_label: string
      payload:
        brand: string
        last4: string
        expiryMonth: number
        expiryYear: number
    - name: HIDDEN
  versions:
    "2.1.9":
      behaviors:
        - name: VISIBLE
          locale:
            card_label: string
          payload:
            type: string
            last4: string
        - name: HIDDEN
    "2.1.8":
      behaviors:
        - name: VISIBLE
          locale: {}
          payload: {}
        - name: HIDDEN
```

In this example:
- Clients on `"2.2.0"` or later receive the full structured brand/expiry payload
- Clients on `"2.1.9"` receive the older flat `type` + `last4` shape
- Clients on `"2.1.8"` receive the component with no payload data

## Action versioning

```yaml
- type: PLACE_ORDER
  payload:
    paymentMethodId: string
    tip?: number
  navigates_to:
    - screen: ORDER_CONFIRMATION
      transition: FADE
      flow:
        name: CHECKOUT
        behavior: REPLACE
  errors:
    EB040:
      type: TOAST
      severity: ERROR
  versions:
    "2.1.9":
      navigates_to:
        - screen: WEBVIEW
          transition: RIGHT_TO_LEFT
          flow:
            name: CHECKOUT
            behavior: KEEP
      errors:
        EB040:
          type: TOAST
          severity: ERROR
    "2.1.8":
      navigates_to:
        - screen: FORCE_UPDATE
          transition: FADE
          flow:
            name: CHECKOUT
            behavior: REPLACE
```

## Metric versioning

```yaml
- rel: order_completed
  type: FIREBASE
  name: purchase
  payload:
    transaction_id: string
    value: number
    currency: string
    items: OrderItem[]
  versions:
    "2.1.9":
      payload:
        order_id: string
        total: number
```

## Versioning shared constructs

The `versions:` key works the same way inside `shared.components`, `shared.actions`, and `shared.metrics`:

```yaml
shared:
  components:
    appbar:
      rel: appbar
      behaviors:
        - name: VISIBLE
          locale:
            title: string
            subtitle?: string
          payload:
            showBack: boolean
            showCart: boolean
        - name: HIDDEN
      versions:
        "2.1.0":
          behaviors:
            - name: VISIBLE
              locale:
                title: string
              payload:
                showBack: boolean
            - name: HIDDEN
```

## Semantics

Each entry under `versions:` is a **full redefinition** of the construct — not a partial patch. The entire construct definition is replaced for that version range.

The server always selects exactly one variant per construct per request. There is no merging between the `latest` definition and a versioned entry.

See [Spec YAML — Versioning](../../spec-yaml/reference#versioning) for the complete field reference.
