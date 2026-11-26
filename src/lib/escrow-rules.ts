import { paymentConfig, type PaymentMethod } from "./payment-config";

export function paymentReferenceAllowed(method: PaymentMethod) {
  return Boolean(paymentConfig[method].enabled);
}

export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return /^\/(?:admin|realtor|escrow-officer|invite\/[a-zA-Z0-9-]+|transactions\/[a-zA-Z0-9-]+)$/.test(value) ? value : undefined;
}