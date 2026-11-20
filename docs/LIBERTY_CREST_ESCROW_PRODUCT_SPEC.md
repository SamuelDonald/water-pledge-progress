# Liberty Crest Escrow Services — Product Specification

## Product direction
Transform the existing Liberty Crest Realty property-listing experience into Liberty Crest Escrow Services: a Texas-focused residential real-estate transaction and escrow coordination platform. This is not a brokerage or public property marketplace. The core product is transaction creation, buyer onboarding, document review, payment tracking, property confirmation, release requests, and controlled disbursement workflows.

## Locked decisions
- Texas residential property transactions; feature major Texas markets while allowing other Texas locations.
- Luxury Texas real estate design: warm, editorial, premium, architectural photography, restrained typography, ivory/sand/stone surfaces, deep charcoal text, muted brass accents, generous whitespace.
- Payment methods displayed: bank wire transfer and cryptocurrency.
- Payment providers, bank instructions, wallet addresses, networks, custody, conversion, verification thresholds, and settlement integrations remain placeholders pending formal selection and approval.
- Buyer authentication: email OTP/passwordless.
- Realtor onboarding: open registration, verification, and administrator approval before transaction privileges.
- Roles: Administrator, Authorized Realtor, Buyer, Escrow Officer.
- Buyer access: realtor sends a transaction invitation; buyer registers/signs in through it.
- Release authorization: administrator manually authorizes every release.
- Buyer journey: transaction preview → create account/sign in → review documents → pay → confirmation dashboard.
- Realtor workspace: create transactions, track payments, upload documents, monitor buyer confirmations, view transaction history, request fund release, and view performance analytics.

## Public website
1. Premium landing page explaining the service and transaction process.
2. Texas coverage featuring Greater Houston, Greater San Antonio, Dallas–Fort Worth, Greater Austin, and additional Texas markets. Featured cities are examples, not an exhaustive boundary.
3. How it works for realtors and buyers.
4. Security, document handling, and payment-status explanation. Do not claim regulatory approval, insured escrow, or legal custody arrangements unless verified and approved.
5. Realtor registration and sign-in entry points.
6. Contact/help and concise FAQs.
7. Remove legacy property marketplace, public listing search, seller property submission, and Water for All / NavalHomes remnants unless a component is intentionally reused as visual material.

## Roles and access
### Public visitor
Can view public information and start realtor registration. Cannot view private transaction data.

### Realtor applicant
Can submit registration and verification information. Applicant remains pending until administrator approval. Pending, rejected, suspended, and approved states must be visible. Only approved/active realtors can create or manage their own transactions.

### Authorized Realtor
Can create transactions, invite buyers, upload transaction documents, view payment status, monitor buyer confirmation, view transaction history, request fund release, and view analytics limited to their own transactions. Cannot verify their own payment, approve their own release, or alter audit events.

### Buyer
Can access only transactions to which their verified email/account has been invited. Can review terms/documents, select a configured payment method, see payment instructions/status, submit required confirmations, and view relevant transaction activity. Cannot edit realtor-defined transaction terms or authorize release.

### Escrow Officer
Can access assigned transactions and perform explicitly granted operational tasks such as payment reconciliation, custody-status recording, and disbursement recording. Cannot override administrator release authorization.

### Administrator
Can approve/suspend realtors, manage users and roles, review all transactions, verify/reconcile payment evidence where authorized, review release requests, authorize or reject releases, manage platform configuration, and inspect audit history. Every sensitive action must be recorded.

Enforce permissions server-side; hiding UI controls is not authorization.

## Core transaction data
A transaction should include:
- Immutable internal ID and human-readable reference.
- Unique high-entropy invitation token; store only a secure hash where practical. Token must be revocable, expiring, and scoped to one transaction and intended invitee.
- Property address and Texas location metadata.
- Transaction type.
- Realtor owner and invited buyer identity.
- Deposit amount, currency (USD as initial transaction accounting currency), and payment deadline.
- Release conditions and refund conditions, versioned and timestamped.
- Required documents and uploaded document metadata.
- Payment method selection and payment records.
- Buyer property/transaction confirmation and evidence.
- Release request, administrator decision, escrow officer disbursement record.
- Full status history and append-only audit events.

## Suggested lifecycle
draft → invitation_sent → buyer_onboarding → terms_under_review → awaiting_payment → payment_submitted → payment_verification → funds_secured → awaiting_buyer_confirmation → buyer_confirmed or buyer_disputed → release_requested → admin_review → release_authorized → disbursement_recorded → completed.

Exception states: cancelled, expired, payment_failed, refund_requested, refund_review, refunded, on_hold, disputed.

Do not automatically advance a transaction based only on a client-side action. Each transition must be validated by a server-side state machine and authorized role.

## Payment placeholders — no live money movement
### Bank wire
Display a clearly marked Wire transfer option and configurable instruction panel. Until a provider and escrow account are formally configured, show: “Wire instructions will be provided when this payment method is activated.” Do not display invented bank details. Suggested states: not_started, instructions_pending, submitted, under_review, verified, rejected, reconciled.

### Cryptocurrency
Display a clearly marked Cryptocurrency option with a pending-configuration state. Do not show a wallet address, chain, token, conversion quote, or confirmation count until configured. Distinguish transaction submitted, chain confirmation, custody/provider verification, USD valuation if applicable, and reconciliation to the designated escrow ledger.

### Shared payment rules
- Payment method selection is not payment.
- User-entered transaction hashes, transfer receipts, and screenshots are evidence only, not proof of cleared funds.
- Never let the browser set payment to verified, funds secured, or eligible for release.
- Keep payment integration behind provider adapters and server-side feature flags/configuration.
- Log provider webhooks with signature verification, idempotency, replay protection, and reconciliation.
- Do not represent a conventional gateway or wallet as legally compliant escrow custody by itself.
- No live payment processing or disbursement until custody model, provider, compliance requirements, and legal operating structure are reviewed and approved.

## Release and refund controls
- Realtor submits a release request with reason and supporting evidence.
- Administrator reviews transaction terms, payment reconciliation, buyer confirmation/dispute status, and required documents.
- Administrator explicitly approves or rejects each request; no automatic release.
- Escrow Officer records execution only after approved authorization and records recipient, amount, timestamp, reference, and evidence.
- Enforce separation of duties: requester cannot approve own request. Consider a second administrator for high-value releases as a configurable future control.
- Refunds use a separate review/authorization workflow; cancellation alone does not trigger a refund.
- Every decision is immutable in audit history; corrections are new events, not silent edits.

## Key screens
### Public
Home, How It Works, Texas Coverage, Security & FAQs, Realtor Registration, Login.

### Buyer
Invitation landing/transaction preview, passwordless email verification, transaction terms, document viewer, payment method selection, payment instructions/status, property confirmation, transaction dashboard, dispute/help.

### Realtor
Overview/analytics, transactions list, create transaction wizard, transaction detail, buyer invitation status, document management, payment tracking, buyer confirmation, release request, history.

### Admin
Operations dashboard, realtor applications/verification, users and roles, all transactions, payment reconciliation queue, release approval queue, refund review queue, audit log, configuration.

### Escrow Officer
Assigned transaction queue, payment/custody reconciliation, approved disbursement work queue, disbursement records.

## UX and accessibility
- Responsive desktop-first operations workspace with excellent mobile buyer flow.
- Use plain-language financial states and timestamps with timezone clarity (Texas local time where appropriate).
- Show amount, currency, deadline, next action, and responsible party prominently.
- Provide empty, loading, error, expired invitation, rejected verification, disputed, and unavailable-payment states.
- Never use color alone to communicate payment/release status.
- Make document version, uploader, upload time, and visibility clear.
- Avoid fake balances, fabricated transactions, fake testimonials, and demo payment-success screens in production.

## Security and privacy baseline
- Server-side role-based access control and transaction-level ownership checks.
- Invite tokens are high entropy, expiring, revocable, single-purpose, and bound to intended email.
- Rate-limit OTP and invitation endpoints; protect against account enumeration.
- Private document storage with short-lived signed URLs and access logging.
- Validate uploads by MIME/content, size, malware scanning integration point, and allowed file types.
- Encrypt sensitive data in transit and at rest; never log OTPs, secrets, full payment credentials, or private document contents.
- Append-only audit trail for role changes, transaction changes, payment verification, release decisions, and disbursements.
- Apply data retention, privacy, and incident-response policies before production.

## Definition of done
- Legacy listing/seller-submission model is removed from primary navigation and replaced with escrow-focused journeys.
- All four roles have distinct navigation and enforced permissions.
- Realtor registration cannot create transactions before approval.
- Buyer invitations securely scope access to one transaction and invited email.
- Payment options are visible but clearly marked as pending configuration; no live funds flow is implied.
- Release always requires explicit administrator authorization.
- All important state changes are audited.
- Texas coverage is presented as featured markets plus statewide inquiry capability.
- Build, lint, route checks, and authorization tests pass before merge.
