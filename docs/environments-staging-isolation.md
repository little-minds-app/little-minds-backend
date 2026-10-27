# Staging Isolation — Backend Pointer (LMP-19 / F-028)

**Role of this file:** Backend **reference/pointer** only.  
**Canonical document:** client repo  
[`little-minds-app/little-minds-client` → `docs/environments-staging-isolation.md`](https://github.com/little-minds-app/little-minds-client/blob/main/docs/environments-staging-isolation.md)

**Status of rules below:** **LOCKED** (Blueprint §26.1 / F-028)  
Provisioning is **out of scope** for LMP-19 (see LMP-29 and related infrastructure tasks).

**Related pointers:** [Device support matrix](./device-support-matrix.md) · [ADR index](./adr/README.md)

---

## Non-negotiable isolation (**LOCKED**)

Staging must **not** share with production:

- Database
- Object-storage bucket
- Auth tenant / identity project
- Signing secrets
- Payment / store credentials

Additional **LOCKED** rules:

- Do **not** copy real child profiles or raw production activity data into staging.
- Use **synthetic** fixtures only.
- Protect staging web/admin with authentication; restrict test enrollment.
- Mobile flavors `development` / `staging` / `production` each use separate API base URL, app identifiers where needed, storage/cache namespace, and purchase test configuration.

Source: Blueprint §26.1. Full narrative: [canonical client staging doc](https://github.com/little-minds-app/little-minds-client/blob/main/docs/environments-staging-isolation.md).

---

## TECHNICAL ASSUMPTIONS (not provisioned here)

Exact hosting vendor/region and staging hostnames are **TECHNICAL ASSUMPTION** items chosen at provision time — see the canonical client doc. Synthetic seed month guidance remains Blueprint intent (**LOCKED**); seed-job implementation is a later task.
