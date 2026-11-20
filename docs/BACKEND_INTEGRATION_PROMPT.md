# Backend Integration Handoff — Liberty Crest Escrow Services

Use this prompt when backend implementation is ready to be connected. Treat this as an engineering handoff, not permission to activate real money movement.

## Context
Implement backend capabilities for Liberty Crest Escrow Services in this repository. First inspect the actual repository and current database, authentication, and storage architecture. Do not assume Supabase, Lovable Cloud, or any provider until verified from source and deployment configuration. Follow docs/LIBERTY_CREST_ESCROW_PRODUCT_SPEC.md.

## Required backend work

### 1. Identity and access
- Implement passwordless email OTP login for buyers and supported staff.
- Add role records/claims for Administrator, Authorized Realtor, Buyer, and Escrow Officer.
- Realtor registration is open, but creates a pending applicant only. Require administrator verification/approval before enabling transaction creation.
- Enforce server-side authorization on every query and mutation. Realtors access only owned transactions; buyers only invited transactions; escrow officers only assigned transactions; administrators have global operational access.
- Protect OTP, invitation, and registration endpoints with rate limits, expiry, replay protection, and enumeration-resistant responses.

### 2. Invitations
- Create transaction invitation records with high-entropy random tokens. Store token hashes rather than plaintext where feasible.
- Bind invitations to transaction ID and intended buyer email; add expiry, revocation, accepted-at, and status fields.
- Invitation acceptance must verify the authenticated email matches the invited email.
- Never expose sequential database IDs or permit buyer transaction enumeration.

### 3. Transaction domain and state machine
- Create validated schemas/tables for transactions, parties, terms, documents, invitations, payment attempts, payment reconciliation, buyer confirmations, release requests, release decisions, refunds, disbursements, and audit events.
- Store terms as versioned snapshots; preserve accepted terms and buyer acceptance timestamps.
- Implement server-side state transitions with role and prerequisite checks. Reject invalid transitions.
- Use decimal-safe monetary representation (integer minor units for fiat) and explicit currency.
- Add indexes, foreign keys, uniqueness constraints, and ownership boundaries.
- Ensure privileged mutations produce append-only audit events with actor, action, entity, timestamp, request/correlation ID, and before/after references. Do not store secrets or unnecessary sensitive content.

### 4. Payment provider abstraction — intentionally not configured
Create provider interfaces/adapters and feature flags for bank wire transfer and cryptocurrency. Do not select or invent a provider, bank account, wallet, blockchain network, token, exchange rate, confirmation threshold, or settlement policy. Configuration validation must keep a method disabled until all required approved settings are present.

Bank wire:
- Configurable instruction content sourced only from approved server-side configuration.
- Payment reference generation and reconciliation records.
- Provider/bank statement import or webhook adapter interface.
- Distinguish reported/submitted from verified and reconciled.

Crypto:
- Adapter interface for a future qualified provider/custodian.
- Provider-side payment intent/deposit address lifecycle only after provider selection.
- Webhook signature verification, idempotency, replay protection, chain/network/asset validation, confirmation policy, custody confirmation, USD valuation policy, and reconciliation hooks.
- Never treat a user-supplied transaction hash or screenshot as authoritative settlement evidence.

Shared rules:
- Client must never set payment status to verified, funds secured, released, or reconciled.
- Webhooks must be authenticated, idempotent, replay-safe, and auditable.
- Maintain a ledger/reconciliation record; never derive available balance from frontend state.
- No release API may bypass an administrator approval record.
- Keep both methods in pending/unavailable state until approved configuration and integration tests exist.

### 5. Release and refund workflow
- Realtor can request release and attach evidence.
- Administrator must explicitly approve or reject each request.
- Escrow Officer may record a disbursement only against a valid approved release authorization.
- Enforce separation of duties; request creator cannot approve the same request.
- Capture amount, currency, recipient reference, execution date/time, external reference, executor, and evidence metadata.
- Refunds require a separate review/authorization path. Cancellation must not automatically move money.
- All decisions and execution records are immutable/audited.

### 6. Documents
- Private object storage; short-lived signed access URLs.
- Validate file type/content, size, and upload ownership; include malware-scanning integration point.
- Track document category, version, uploader, visibility, checksum, created time, and review status.
- Buyer access only to documents explicitly shared with that buyer/transaction.

### 7. Notifications and analytics
- Notification adapter for invitation, OTP, payment status, missing documents, buyer confirmation, release request, administrator decision, and disbursement events.
- Do not include private documents, OTPs, or sensitive payment details in email.
- Realtor analytics must be scoped to that realtor's transactions and derived from verified backend data, not client-calculated totals.

### 8. Tests and operational readiness
- Unit tests for state transitions and money calculations.
- Integration tests for role boundaries, invitation email binding/expiry/revocation, OTP abuse controls, payment webhook signatures/idempotency, and release authorization.
- Test that a realtor cannot approve a release, a buyer cannot access another buyer's transaction, an escrow officer cannot disburse without administrator approval, and no client mutation can mark funds verified.
- Add structured logs, correlation IDs, monitoring hooks, and documented backup/recovery procedures.
- Update environment variable examples with names/descriptions only; never commit real secrets.
- Provide migrations and rollback strategy.

## Critical production gate
Do not enable real wire or cryptocurrency deposits, claim that funds are held in legally compliant escrow, or execute disbursements until Texas legal/compliance counsel and the selected qualified escrow/custody provider confirm the operating model, account ownership, permitted flows, reconciliation controls, disclosures, and applicable licensing/regulatory requirements.

## Deliverables
1. Backend architecture summary based on the repository's actual stack.
2. Database migrations/schema and rollback plan.
3. Auth, role, invitation, transaction, payment-adapter, document, release/refund, audit, and notification implementation.
4. Automated tests and test results.
5. Environment/configuration checklist.
6. Provider-specific integration checklist identifying decisions still required.
7. Explicit statement of which flows are mocked, disabled, or production-ready.
