# Mina ombud — How the Representatives/Mandates System Works

## What It Is

"Mina ombud" (My Representatives) is the part of the portal that lets users **act on behalf of an organization** and manage **fullmakter** (mandates/powers of attorney). It integrates with the external **MyRepresentatives API v4.2**.

## Core Concepts

| Swedish | English | Purpose |
|---------|---------|---------|
| **Fullmakt** | Mandate | Legal power of attorney to act for an organization |
| **Ombud** | Delegate | Person receiving notifications on someone's behalf |
| **Vitlistning** | Whitelisting | A flag on a mandate granting access without being a formal signatory |
| **Behörig signerare** | Authorized signatory | Person with legal right to sign for an org |

## How Whitelisting Works

When a user switches to **BUSINESS mode** (representing an organization):

1. Backend calls the MyRepresentatives API for **ACTIVE mandates** where the org is grantor and the user is grantee
2. If any mandate has `whitelisted: true`, the user gets access to mandate management — **even if they're not a formal authorized signatory**
3. This flag is stored in the session and sent to the frontend to control UI visibility

The check lives in `backend/src/services/mandate.service.ts` → `getIsWhitelisted()`.

## Mandate (Fullmakt) Lifecycle

### Endpoints

Located in `backend/src/controllers/mandate.controller.ts`:

- `GET /mandates/personal` — mandates granted TO the user
- `GET /mandates/org` — mandates granted BY the organization
- `POST /mandates` — create (requires BankID signing)
- `DELETE /mandates/:id` — soft delete

### Creation Flow

1. User fills in person number + dates in the UI
2. **BankID signing** is initiated via `/sign/mandate`
3. After BankID completion, `POST /mandates` submits to MyRepresentatives API with the signing proof (signature, OCSP response, etc.)
4. Mandate is created with status `ACTIVE`, defaults to 36 months validity

### Who Can Create

Only users where `isAuthorizedSignatory || whitelisted` is true.

## Three Distinct Delegation Mechanisms

### 1. Mandates (Fullmakter) — via MyRepresentatives API v4.2

- Legal powers of attorney for business operations
- Requires BankID signing

### 2. Contact Delegates (Ombud) — via ContactSettings API v2.0

- Delegates who receive notifications on your behalf
- Filter-based rules (channel, attribute matching)

### 3. Facility Delegation — via InstalledBase API v3.1

- Delegating utility/facility access to another person
- Resolves person by personnummer via Citizen API

## Authorization Matrix

| Feature | PRIVATE Mode | BUSINESS Mode |
|---------|--------------|---------------|
| Mandates section | Hidden | Visible if `isAuthorizedSignatory \|\| whitelisted` |
| Create mandate | No | Yes, if `isAuthorizedSignatory \|\| whitelisted` |
| View org mandates | No | Yes |
| Facility delegation | No | Yes (only for owned facilities) |
| Contact delegates | Yes | Yes |

## Representing Mode Switch

When a user selects an organization (`POST /representing`):

1. Backend fetches business details from LegalEntity API
2. Calls `getIsWhitelisted(user, orgPartyId)` against MyRepresentatives API
3. Updates session with `RepresentingEntity` (mode, partyId, whitelisted flag, etc.)
4. Clears cached relations
5. Fetches delegated facilities
6. Returns entity to frontend, which updates UI visibility accordingly

Controller: `backend/src/controllers/representing.controller.ts`

## Key Files

| Area | File |
|------|------|
| Representing switch | `backend/src/controllers/representing.controller.ts` |
| Mandate CRUD | `backend/src/controllers/mandate.controller.ts` |
| Whitelist check | `backend/src/services/mandate.service.ts` |
| Mandate types | `backend/src/interfaces/mandates.interface.ts` |
| Session schema | `backend/src/types/express-session.d.ts` |
| Delegate CRUD | `backend/src/controllers/delegate.controller.ts` |
| Facility delegation | `backend/src/controllers/facility-delegation.controller.ts` |
| Frontend mandates UI | `frontend/src/layouts/pages/mypages-sections/profile/components/mandates/` |
| E2E test | `frontend/cypress/e2e/fullmakter.cy.ts` |
