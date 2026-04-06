---
sidebar_position: 3
---

# Force Update

Versioning lets the server maintain backwards compatibility with older client builds. But backwards compatibility has limits. Some changes — security patches, deprecated payment flows, breaking API redesigns — simply cannot be served correctly to very old clients. The `FORCE_UPDATE` screen is the escape hatch.

## What it is

`FORCE_UPDATE` is a special screen that blocks app usage and presents the user with a prompt to update the app. When the server determines a client version is too old to be served, it navigates to this screen instead of attempting to respond normally.

The screen itself is defined like any other screen in the spec YAML. What makes it special is how the server uses it: any action handler can navigate to `FORCE_UPDATE` when the incoming client version falls below the minimum threshold.

## When to use it

- **Minimum supported version drops**: the team decides to stop supporting clients below a given version, and the construct version history for those builds is being pruned
- **Critical security issue**: a vulnerability in old clients requires them to update before using the app
- **Breaking contract change**: a new version introduces a change so fundamental that no backwards-compatible variant is possible

## How to implement it

Declare `FORCE_UPDATE` as a screen in your spec YAML:

```yaml
screens:
  FORCE_UPDATE:
    description: Mandatory update screen — blocks usage until the user updates the app
    default_transition: FADE
    components:
      - rel: force_update_prompt
        behaviors:
          - name: VISIBLE
            locale:
              title: string
              message: string
              update_button: string
            payload:
              minimumVersion: string
    actions:
      - type: OPEN_STORE
        description: Opens the app store listing
        payload: {}
```

Then, in any action handler where version enforcement applies, navigate to `FORCE_UPDATE` when the client version is below the threshold:

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
    "2.1.8":
      navigates_to:
        - screen: FORCE_UPDATE
          transition: FADE
          flow:
            name: CHECKOUT
            behavior: REPLACE
```

## Relationship to versioning

`FORCE_UPDATE` and versioning are complementary strategies:

| Strategy | Use when |
|---|---|
| **Versioning** | You can serve a compatible response to the old client |
| **FORCE_UPDATE** | You cannot — the old client must update to continue |

Versioning is the preferred approach because it doesn't interrupt the user. Reserve `FORCE_UPDATE` for situations where serving the old client is genuinely not possible.

See [Why Versioning](../protocol/versioning/why-versioning) for more context on managing the app release lifecycle.
