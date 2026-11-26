import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { paymentReferenceAllowed, safeReturnPath } from "./escrow-rules";

describe("inactive payment placeholders", () => {
  test("bank wire cannot accept payment references before configuration", () => {
    assert.equal(paymentReferenceAllowed("wire"), false);
  });
  test("crypto cannot accept payment references before configuration", () => {
    assert.equal(paymentReferenceAllowed("crypto"), false);
  });
});
describe("sign-in return destination", () => {
  test("retains the buyer's invitation", () => {
    assert.equal(safeReturnPath("/invite/abc123"), "/invite/abc123");
  });
  test("rejects off-site destinations", () => {
    assert.equal(safeReturnPath("//example.com"), undefined);
    assert.equal(safeReturnPath("https://example.com"), undefined);
  });
});