// Placeholder payment configuration. Edit these values once a provider/custodian is approved.
// Nothing here moves money; methods stay "pending configuration" while enabled = false.
export const paymentConfig = {
  wire: {
    enabled: false,
    label: "Bank wire transfer",
    bankName: "[Bank name — to be configured]",
    accountName: "[Escrow account name — to be configured]",
    routingNumber: "[Routing number — to be configured]",
    accountNumber: "[Account number — to be configured]",
    pendingMessage: "Wire instructions will be provided when this payment method is activated.",
  },
  crypto: {
    enabled: false,
    label: "Cryptocurrency",
    network: "[Network — to be configured]",
    asset: "[Asset — to be configured]",
    depositAddress: "[Deposit address — to be configured]",
    pendingMessage: "Cryptocurrency deposits will be available once a qualified custody provider is configured.",
  },
} as const;

export type PaymentMethod = "wire" | "crypto";

export const statusLabels: Record<string, string> = {
  invitation_sent: "Invitation sent",
  buyer_onboarding: "Buyer onboarding",
  awaiting_payment: "Awaiting payment",
  payment_submitted: "Payment submitted",
  funds_secured: "Funds secured",
  buyer_confirmed: "Buyer confirmed",
  release_requested: "Release requested",
  release_authorized: "Release authorized",
  completed: "Completed",
  cancelled: "Cancelled",
  instructions_pending: "Instructions pending",
  submitted: "Submitted — under review",
  verified: "Verified",
  rejected: "Rejected",
  pending: "Pending review",
  approved: "Approved",
};

export const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
