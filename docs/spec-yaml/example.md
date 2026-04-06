---
sidebar_position: 3
---

# Example

A complete, annotated RUF Spec YAML for a small e-commerce application with a home screen, product detail, and checkout flow.

---

## Single-file version

```yaml
ruf: "1.0"
versioning: semantic
current_version: "2.2.0"

# ─────────────────────────────────────────────
# SessionMeta shape
# The server is the only authority on mutations.
# The client sends this back on every action request.
# ─────────────────────────────────────────────
meta:
  token?: string
  cartCount: number
  selectedAddress?:
    id: string
    label: string

# ─────────────────────────────────────────────
# Shared constructs
# Referenced via $ref: '#/shared/<type>/<key>'
# ─────────────────────────────────────────────
shared:
  components:
    appbar:
      description: Standard top navigation bar shown on most screens
      rel: appbar
      behaviors:
        - name: VISIBLE
          locale:
            title: string
            back_label?: string
          payload:
            showBack: boolean
            showCart: boolean
        - name: HIDDEN

    cart_quantities:
      description: >
        State-holding component for cart data. Used for optimistic updates
        instead of mutating SessionMeta directly.
      rel: cart_quantities
      behaviors:
        - name: VISIBLE
          locale: {}
          payload:
            count: number
            total: number
            currency: string

  actions:
    go_to_webview:
      description: Opens an external URL in the in-app browser
      type: GO_TO_WEBVIEW
      payload:
        urlToOpen: string
      navigates_to:
        - screen: WEBVIEW
          transition: RIGHT_TO_LEFT
          flow:
            name: DISCOVERY
            behavior: KEEP
      errors:
        EB001:
          type: TOAST
          severity: ERROR

  metrics:
    screen_view:
      description: Standard screen view event
      rel: screenView
      type: FIREBASE
      name: screen_view
      payload:
        screen_name: string

# ─────────────────────────────────────────────
# Screens
# ─────────────────────────────────────────────
screens:

  # ── HOME ──────────────────────────────────
  HOME:
    description: Main discovery screen — entry point of the app
    default_transition: FADE
    components:
      - $ref: '#/shared/components/appbar'
      - $ref: '#/shared/components/cart_quantities'
      - rel: skeleton
        description: Loading placeholder shown while content is fetched
        behaviors:
          - name: VISIBLE
          - name: HIDDEN
      - rel: product_list
        description: Main grid of products
        behaviors:
          - name: VISIBLE
            locale:
              empty_message: string
              load_more_label: string
            payload:
              items: Product[]
              hasMore: boolean
            mergeStrategy: APPEND
          - name: HIDDEN

    actions:
      - type: GET_HOME_CONTENT
        description: Fetches the initial product grid
        payload: {}
        errors:
          EB010:
            type: TOAST
            severity: ERROR
      - type: LOAD_MORE_PRODUCTS
        description: Appends the next page of products to the list
        payload:
          page: number
        errors:
          EB011:
            type: TOAST
            severity: ERROR
      - type: GO_TO_PRODUCT
        description: Navigates to the detail page for a product
        payload:
          productId: string
        navigates_to:
          - screen: PRODUCT
            transition: RIGHT_TO_LEFT
            flow:
              name: DISCOVERY
              behavior: KEEP
        errors:
          EB001:
            type: TOAST
            severity: ERROR
      - $ref: '#/shared/actions/go_to_webview'

    metrics:
      navigation:
        - $ref: '#/shared/metrics/screen_view'

  # ── PRODUCT ───────────────────────────────
  PRODUCT:
    description: Product detail page
    params:
      productId: string
    default_transition: RIGHT_TO_LEFT
    components:
      - $ref: '#/shared/components/appbar'
      - $ref: '#/shared/components/cart_quantities'
      - rel: product_detail
        behaviors:
          - name: VISIBLE
            locale:
              add_to_cart_button: string
              price_label: string
              description_label: string
            payload:
              id: string
              name: string
              price: number
              imageUrl: string
              description: string
          - name: LOADING
            locale: {}
            payload: {}

    actions:
      - type: ADD_TO_CART
        description: Adds this product to the cart
        payload:
          productId: string
          quantity: number
        errors:
          EB020:
            type: TOAST
            severity: ERROR
      - type: GO_TO_CART
        description: Navigates to the cart screen
        payload: {}
        navigates_to:
          - screen: CART
            transition: RIGHT_TO_LEFT
            flow:
              name: CHECKOUT
              behavior: START_NEW
      - $ref: '#/shared/actions/go_to_webview'

    metrics:
      navigation:
        - rel: screenView
          type: FIREBASE
          name: screen_view
          payload:
            screen_name: string
            product_id: string

  # ── CART ──────────────────────────────────
  CART:
    description: Cart review screen — start of the checkout flow
    default_transition: RIGHT_TO_LEFT
    components:
      - $ref: '#/shared/components/appbar'
      - $ref: '#/shared/components/cart_quantities'
      - rel: cart_items
        behaviors:
          - name: VISIBLE
            locale:
              empty_message: string
              checkout_button: string
            payload:
              items: CartItem[]
            mergeStrategy: REPLACE
          - name: HIDDEN

    actions:
      - type: UPDATE_QUANTITY
        description: Updates the quantity of an item in the cart
        payload:
          itemId: string
          quantity: number
        errors:
          EB030:
            type: TOAST
            severity: ERROR
      - type: REMOVE_ITEM
        description: Removes an item from the cart
        payload:
          itemId: string
      - type: GO_TO_CHECKOUT
        description: Proceeds to the checkout screen
        payload: {}
        navigates_to:
          - screen: CHECKOUT
            transition: RIGHT_TO_LEFT
            flow:
              name: CHECKOUT
              behavior: KEEP
        errors:
          EB031:
            type: TOAST
            severity: ERROR

    metrics:
      navigation:
        - $ref: '#/shared/metrics/screen_view'

  # ── CHECKOUT ──────────────────────────────
  CHECKOUT:
    description: Final order confirmation and payment screen
    default_transition: RIGHT_TO_LEFT
    components:
      - $ref: '#/shared/components/appbar'
      - rel: order_summary
        behaviors:
          - name: VISIBLE
            locale:
              place_order_button: string
              total_label: string
              address_label: string
            payload:
              items: CartItem[]
              total: number
              currency: string
              deliveryAddress:
                id: string
                label: string
      - rel: payment_form
        behaviors:
          - name: VISIBLE
            locale:
              card_number_label: string
              expiry_label: string
              cvv_label: string
            payload: {}
          - name: HIDDEN
        # Older clients saw a simpler payment form without CVV
        versions:
          "2.1.9":
            behaviors:
              - name: VISIBLE
                locale:
                  card_number_label: string
                  expiry_label: string
                payload: {}
              - name: HIDDEN

    actions:
      - type: PLACE_ORDER
        description: Submits the order for fulfillment
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
          EV041:
            type: FORM_ERROR
            fields:
              - card_number
              - expiry
              - cvv
        # Older clients used an in-app browser for payment instead of native checkout
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

    metrics:
      navigation:
        - $ref: '#/shared/metrics/screen_view'
      screen:
        - rel: checkout_started
          type: FIREBASE
          name: begin_checkout
          payload:
            value: number
            currency: string

  # ── ORDER_CONFIRMATION ────────────────────
  ORDER_CONFIRMATION:
    description: Success screen shown after an order is placed
    default_transition: FADE
    components:
      - rel: confirmation
        behaviors:
          - name: VISIBLE
            locale:
              title: string
              subtitle: string
              continue_button: string
            payload:
              orderId: string
              estimatedDelivery: string

    actions:
      - type: CONTINUE_SHOPPING
        description: Returns to the home screen
        payload: {}
        navigates_to:
          - screen: HOME
            transition: FADE
            flow:
              name: DISCOVERY
              behavior: START_NEW

    metrics:
      navigation:
        - rel: purchase
          type: FIREBASE
          name: purchase
          payload:
            transaction_id: string
            value: number
            currency: string
```

---

## Multi-file version

The same application split across files, with complex screens extracted:

```yaml
# app.ruf.yaml
ruf: "1.0"

meta:
  token?: string
  cartCount: number
  selectedAddress?:
    id: string
    label: string

shared:
  components:
    appbar:
      rel: appbar
      behaviors:
        - name: VISIBLE
          locale:
            title: string
          payload:
            showBack: boolean
            showCart: boolean
        - name: HIDDEN
    cart_quantities:
      rel: cart_quantities
      behaviors:
        - name: VISIBLE
          locale: {}
          payload:
            count: number
            total: number

  actions:
    go_to_webview:
      type: GO_TO_WEBVIEW
      payload:
        urlToOpen: string
      navigates_to:
        - screen: WEBVIEW
          transition: RIGHT_TO_LEFT
          flow:
            name: DISCOVERY
            behavior: KEEP
      errors:
        EB001:
          type: TOAST
          severity: ERROR

  metrics:
    screen_view:
      rel: screenView
      type: FIREBASE
      name: screen_view
      payload:
        screen_name: string

screens:
  HOME:
    $ref: './screens/home.ruf.yaml'
  PRODUCT:
    $ref: './screens/product.ruf.yaml'
  CART:
    $ref: './screens/cart.ruf.yaml'
  CHECKOUT:
    $ref: './screens/checkout.ruf.yaml'
  ORDER_CONFIRMATION:
    $ref: './screens/order-confirmation.ruf.yaml'
```

```yaml
# screens/checkout.ruf.yaml
description: Final order confirmation and payment screen
default_transition: RIGHT_TO_LEFT
components:
  - $ref: '#/shared/components/appbar'
  - rel: order_summary
    behaviors:
      - name: VISIBLE
        locale:
          place_order_button: string
          total_label: string
        payload:
          items: CartItem[]
          total: number
actions:
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
metrics:
  navigation:
    - $ref: '#/shared/metrics/screen_view'
```
