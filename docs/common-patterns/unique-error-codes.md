---
sidebar_position: 2
---

# Unique Error Codes

When an [Action](../protocol/constructs/action) fails, the server returns an [ActionResult](../protocol/constructs/action#actionresult) with a `code` field. Using unique, stable error codes is **strongly recommended** — though the protocol does not mandate any specific format.

## Why unique codes matter

String error messages change. Codes don't have to. When you use stable, unique codes:

- **The client can handle specific errors programmatically** — showing different UI, offering retry options, or redirecting — without parsing message strings
- **Analytics are meaningful** — you can track error frequencies by code rather than by fragile message strings
- **i18n is decoupled** — the client can map codes to locally translated strings, independent of whatever language the server returns
- **Debugging is easier** — a code like `E042` is searchable; a message like "Something went wrong" is not

## A suggested approach

One effective convention is to use a structured prefix format:

```
{severity}{domain}{number}

Examples:
  E001   — error, number 001
  W023   — warning, number 023
```

You can extend this with domain namespacing to organize codes by category:

```
  EB001  — business error 001
  EV012  — validation error 012
  WU005  — user warning 005
```

The specific domains and numbering are entirely up to your implementation. What matters is that:

1. Each code is **unique** across your system
2. Codes are **stable** — once defined, a code's meaning does not change
3. Codes are **documented** — your team knows what each code means

## Using codes in ActionResult

Error codes appear in `TOAST` and `ERROR` action results:

```json
{
  "type": "TOAST",
  "severity": "ERROR",
  "code": "E042",
  "message": "Payment method declined"
}
```

```json
{
  "type": "ERROR",
  "code": "EV012",
  "message": "Email address is not valid"
}
```

The `message` is a human-readable fallback. The `code` is what the client should use for programmatic handling and i18n lookup.
