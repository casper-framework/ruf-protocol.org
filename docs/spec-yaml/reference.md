---
sidebar_position: 2
---

# Reference

Complete field-by-field specification for every construct in the RUF Spec YAML format.

---

## `ruf`

Declares the RUF Spec YAML version. Required on every root file.

```yaml
ruf: "1.0"
```

---

## `versioning`

Declares the version format used by the client app. Optional — omit if the application does not use construct versioning.

```yaml
versioning: semantic   # or: incremental
```

| Value | Client version format | Example |
|---|---|---|
| `semantic` | `MAJOR.MINOR.PATCH+BUILD` | `"2.2.1+5"` |
| `incremental` | Integer build number | `"42"` |

See [Versioning Formats](../protocol/versioning/versioning-formats) for the full resolution algorithm.

---

## `current_version`

The current version of this application spec. Follows the format declared in `versioning`. Used as documentation and by tooling to identify the `latest` variant.

```yaml
current_version: "2.2.1"
```

---

## `meta`

Defines the shape of [SessionMeta](../protocol/constructs/session-meta) for this application. Uses TypeScript-like type annotations. The shape is application-specific — the protocol does not mandate specific fields.

```yaml
meta:
  token?: string
  cart:
    items: CartItem[]
    total: number
    currency: string
  selectedAddress?:
    id: string
    street: string
    city: string
  isVerified: boolean
```

Fields suffixed with `?` are optional. Nested objects are defined inline. Arrays use `Type[]` syntax.

See [Type Syntax](#type-syntax) for the full reference.

---

## `shared`

Holds reusable constructs referenced across multiple screens via `$ref`. Contains three sub-sections:

```yaml
shared:
  components: {}   # Keyed by component identifier
  actions: {}      # Keyed by action identifier
  metrics: {}      # Keyed by metric identifier
```

All shared constructs are referenced via `$ref: '#/shared/<type>/<key>'`.

---

## `screens`

Each key is the screen name in `SCREAMING_SNAKE_CASE`. The value is a Screen definition or a `$ref` to a screen file.

```yaml
screens:
  HOME: { ... }
  PRODUCT:
    $ref: './screens/product.ruf.yaml'
```

---

## Screen definition

### Fields

| Field | Required | Description |
|---|---|---|
| `description` | No | Human-friendly description for maintainability |
| `alias` | No | Short human-readable alias |
| `params` | No | Typed route-level parameters. Passed at navigation time. |
| `default_transition` | No | Default page animation. See [ScreenTransition](../protocol/constructs/navigation#screen-transitions). |
| `components` | Yes | List of component definitions or `$ref` entries |
| `actions` | Yes | List of action definitions or `$ref` entries |
| `metrics.navigation` | No | [Metrics](../protocol/constructs/metric) fired when this screen becomes active |
| `metrics.screen` | No | [Metrics](../protocol/constructs/metric) fired when this screen's content loads |

### Example

```yaml
PRODUCT:
  description: Product detail page
  alias: Product
  params:
    productId: string
    referrer?: string
  default_transition: RIGHT_TO_LEFT
  components: [...]
  actions: [...]
  metrics:
    navigation:
      - rel: screenView
        type: FIREBASE
        name: screen_view
        payload:
          screen_name: string
```

---

## Component definition

### Fields

| Field | Required | Description |
|---|---|---|
| `description` | No | Human-friendly description for maintainability |
| `alias` | No | Short human-readable alias |
| `rel` | Yes | Stable identity key within the screen (e.g. `appbar`, `product_list`) |
| `behaviors` | Yes | List of named rendering variants |

### Behavior entry fields

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Variant discriminator (e.g. `VISIBLE`, `HIDDEN`, `LOADING`, `ACTION`) |
| `locale` | Conditionally | Map of `key: type` pairs for text strings. Required if the behavior renders content. |
| `payload` | Conditionally | Typed payload shape. Required if the behavior renders content. |
| `mergeStrategy` | No | `APPEND`, `REPLACE`, or `MATCH`. Only for list-type payloads. Defaults to `REPLACE`. |

A `HIDDEN` behavior with no locale or payload is valid:

```yaml
- name: HIDDEN
```

### mergeStrategy values

| Value | Behavior |
|---|---|
| `REPLACE` | Incoming component fully replaces the cached one (default) |
| `APPEND` | New list items are appended to the existing list |
| `MATCH` | New items matched against existing by `id` field; matched items updated, others unchanged |

### Example

```yaml
- rel: product_list
  description: Paginated list of products
  behaviors:
    - name: VISIBLE
      locale:
        empty_message: string
        load_more_label: string
      payload:
        items: ProductItem[]
        hasMore: boolean
      mergeStrategy: APPEND
    - name: HIDDEN
    - name: LOADING
      locale: {}
      payload: {}
```

---

## Action definition

### Fields

| Field | Required | Description |
|---|---|---|
| `description` | No | Human-friendly description for maintainability |
| `alias` | No | Short human-readable alias |
| `type` | Yes | Action identifier string. The screen name is not part of the type — it is provided separately in the request. |
| `payload` | No | Typed input fields. Fields suffixed with `?` are optional. |
| `navigates_to` | No | List of possible screen destinations this action may lead to |
| `errors` | No | Map of error code → [ActionResult](../protocol/constructs/action#actionresult) shape |

### `navigates_to` entry fields

| Field | Required | Description |
|---|---|---|
| `screen` | Yes | Target screen name |
| `transition` | No | Page animation for this transition. Overrides `default_transition`. |
| `flow.name` | Yes | Flow identifier (e.g. `CHECKOUT`, `AUTH`) |
| `flow.behavior` | Yes | `START_NEW`, `KEEP`, or `REMOVE_PREVIOUS` |

### `errors` map

Errors are keyed by their code. Each code defines the `type` of ActionResult it produces.

**TOAST:**
```yaml
errors:
  EB010:
    type: TOAST
    severity: ERROR   # SUCCESS | ERROR | WARN
```

**ERROR:**
```yaml
errors:
  EV012:
    type: ERROR
```

**FORM_ERROR** — `fields` lists the field identifiers that may carry errors:
```yaml
errors:
  EV020:
    type: FORM_ERROR
    fields:
      - email
      - phone
```

`SUCCESS` is the implicit happy path — no entry needed in `errors`.

:::tip Use unique error codes
Using stable, unique codes makes errors programmatically handleable and supports i18n. See [Unique Error Codes](../common-patterns/unique-error-codes).
:::

### Example

```yaml
- type: SUBMIT_ORDER
  description: Submits the current cart as an order
  payload:
    paymentMethodId: string
    tip?: number
    notes?: string
  navigates_to:
    - screen: ORDER_CONFIRMATION
      transition: RIGHT_TO_LEFT
      flow:
        name: CHECKOUT
        behavior: REPLACE
    - screen: PAYMENT_FAILED
      transition: FADE
      flow:
        name: CHECKOUT
        behavior: KEEP
  errors:
    EB042:
      type: TOAST
      severity: ERROR
    EV010:
      type: FORM_ERROR
      fields:
        - payment_method
        - address
```

---

## Metric definition

### Fields

| Field | Required | Description |
|---|---|---|
| `description` | No | Human-friendly description for maintainability |
| `alias` | No | Short human-readable alias |
| `rel` | Yes | Stable identifier for this metric |
| `type` | Yes | Emitter type string — user-defined (e.g. `FIREBASE`, `GOOGLE_ANALYTICS`) |
| `name` | Yes | Event name as it appears in the analytics system |
| `payload` | Yes | Typed map of event properties |

### Example

```yaml
- rel: purchase_complete
  description: Fired after a successful order placement
  type: FIREBASE
  name: purchase
  payload:
    value: number
    currency: string
    item_id: string
```

---

## `$ref` syntax

Any list entry (component, action, metric) can be replaced with a `$ref` pointing to a shared definition.

### Referencing shared constructs

```yaml
components:
  - $ref: '#/shared/components/appbar'

actions:
  - $ref: '#/shared/actions/go_to_webview'

metrics:
  navigation:
    - $ref: '#/shared/metrics/screen_view'
```

Path format: `#/shared/<type>/<key>`

### Referencing screen files

```yaml
screens:
  HOME:
    $ref: './screens/home.ruf.yaml'
```

File paths are relative to the current file. The referenced file contains the screen definition directly at the root level — not nested under `screens:`.

---

## Type syntax

Payload and locale values use TypeScript-like type annotations:

| Syntax | Meaning |
|---|---|
| `string` | String value |
| `number` | Numeric value |
| `boolean` | Boolean value |
| `fieldName?: string` | Optional string field |
| `string[]` | Array of strings |
| `ProductItem[]` | Array of a named type |
| `'ios' \| 'android'` | String literal union |
| `Record<string, string>` | String-keyed string map |
| Inline object | Nested object (fields defined inline) |

Optional fields use `?` on the field name:

```yaml
payload:
  productId: string
  referrer?: string
  quantity: number
```

---

## Versioning

Any component, action, metric, or the `meta` section can declare version-specific variants using a `versions:` map. The top-level definition is always `latest`. See [Versioning Formats](../protocol/versioning/versioning-formats) for how the server resolves which variant to use.

### `versions:` on `meta`

Declares the SessionMeta shape at each historical version, enabling tooling to generate migration updaters. The `version` field is implicit — do not declare it.

```yaml
meta:
  token?: string
  cartCount: number
  selectedAddress?:
    id: string
    label: string
  versions:
    "1":
      token?: string
      # cartCount and selectedAddress were not present in v1
    "2":
      token?: string
      cartCount: number
      # selectedAddress was not present in v2
```

See [SessionMeta Versioning](../protocol/versioning/session-meta-versioning).

### `versions:` on components

```yaml
- rel: payment_method
  behaviors:
    - name: VISIBLE
      locale:
        brand_label: string
      payload:
        brand: string
        last4: string
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
```

### `versions:` on actions

```yaml
- type: PLACE_ORDER
  payload:
    paymentMethodId: string
  navigates_to:
    - screen: ORDER_CONFIRMATION
      transition: FADE
      flow:
        name: CHECKOUT
        behavior: REPLACE
  versions:
    "2.1.9":
      navigates_to:
        - screen: WEBVIEW
          transition: RIGHT_TO_LEFT
          flow:
            name: CHECKOUT
            behavior: KEEP
```

### `versions:` on metrics

```yaml
- rel: order_completed
  type: FIREBASE
  name: purchase
  payload:
    transaction_id: string
    value: number
    currency: string
  versions:
    "2.1.9":
      payload:
        order_id: string
        total: number
```

### Semantics

Each entry under `versions:` is a **full redefinition** of the construct — not a partial patch. The server selects exactly one variant per construct per request and does not merge definitions.

See [Constructs Versioning](../protocol/versioning/constructs-versioning) for a complete guide.
