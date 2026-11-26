import { describe, expect, test } from "bun:test";
import { paymentReferenceAllowed, safeReturnPath } from "./escrow-rules";

describe("inactive payment placeholders", () => {
  test("bank wire cannot accept payment references before configuration", () => {
    expect(paymentReferenceAllowed("wire")).toBe(false);
  });
  test("crypto cannot accept payment references before configuration", () => {
    expect(paymentReferenceAllowed("crypto")).toBe(false);
  });
});
describe("sign-in return destination", () => {
  test("retains the buyer's invitation", () => {
    expect(safeReturnPath("/invite/abc123")).toBe("/invite/abc123");
  });
  test("rejects off-site destinations", () => {
    expect(safeReturnPath("//example.com")).toBeUndefined();
    expect(safeReturnPath("https://example.com")).toBeUndefined();
  });
});