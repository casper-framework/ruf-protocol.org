---
sidebar_position: 1
---

# Overview

The RUF Spec YAML is an infrastructure-as-code artifact that fully describes a RUF application. It is the single source of truth for every screen, component, action, metric, and state field in your project.

## What it does

A `.ruf.yaml` file serves three purposes at once:

| Purpose | Description |
|---|---|
| **Code generation** | Generates TypeScript types for the BFF, Dart models for Flutter clients, or any other platform artifact from the same spec. |
| **Validation** | Validates that server responses and client implementations conform to the declared contract. |
| **Living documentation** | A human-readable, version-controlled description of the entire application flow. |

## The infrastructure-as-code analogy

Just as tools like Terraform or CloudFormation let you declare infrastructure in a file and have it materialized and validated, the RUF Spec YAML lets you declare your entire frontend application contract in a file. The implementation follows the spec — not the other way around.

## File conventions

| Convention | Value |
|---|---|
| Extension | `.ruf.yaml` |
| Root file | `app.ruf.yaml` |
| Screen files | Any name — e.g. `screens/home.ruf.yaml`, `screens/checkout.ruf.yaml` |

A project may use a single `app.ruf.yaml` for the entire application, or split it across multiple files. There is no fixed unit per file — you decide how to organize.

## Root structure

Every root `.ruf.yaml` file follows this shape:

```yaml
ruf: "1.0"            # Required: spec version

versioning: semantic  # Optional: "semantic" or "incremental"
current_version: "2.2.1"  # Optional: current app version (follows versioning format)

meta: {}              # Optional: SessionMeta field definitions

shared: {}            # Optional: reusable components, actions, metrics

screens: {}           # Required: screen definitions
```

The `ruf` field is required and declares which version of the RUF Spec YAML format the file targets.

## Splitting across files

When a project grows, screen definitions can be moved to separate files and referenced from the root:

```yaml
# app.ruf.yaml
ruf: "1.0"

meta:
  token?: string

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
        - name: HIDDEN

screens:
  HOME:
    $ref: './screens/home.ruf.yaml'
  CHECKOUT:
    $ref: './screens/checkout.ruf.yaml'
```

The referenced file contains the screen definition directly — not nested under `screens:`:

```yaml
# screens/home.ruf.yaml
description: Main discovery screen
default_transition: FADE
flows:
  - DISCOVERY
components:
  - rel: skeleton
    behaviors:
      - name: VISIBLE
      - name: HIDDEN
actions:
  - type: GET_HOME_CONTENT
    payload: {}
```

:::info Shared constructs stay in the root
Only screen definitions can be split into separate files. Shared components, actions, and metrics always live under the root `shared:` key and are referenced via `$ref: '#/shared/...'` from anywhere.
:::

## Where to go from here

- [Reference](./reference) — complete field-by-field specification
- [Example](./example) — a full annotated application spec
