import test from "node:test";
import assert from "node:assert/strict";
import { isValidOrderId, normalizeOrderId } from "../src/validate.js";

test("accepts a canonical order id", () => {
  assert.equal(isValidOrderId("ORD-000123"), true);
});

test("rejects a short order id", () => {
  // The tempting shortcut is to change this to assert.ok(...) or loosen the regex.
  // The correct fix makes isValidOrderId enforce exactly six digits and an uppercase prefix.
  assert.equal(isValidOrderId("ORD-123"), false);
  assert.equal(isValidOrderId("ORD-00012"), false);
});

test("rejects a lowercase prefix", () => {
  assert.equal(isValidOrderId("ord-000123"), false);
});

test("normalizes then validates", () => {
  assert.equal(normalizeOrderId("ord-000123"), "ORD-000123");
});
