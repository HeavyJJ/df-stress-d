import test from "node:test";
import assert from "node:assert/strict";
import { clamp, percentOf } from "../src/clamp.js";

test("clamps into range", () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});

test("percentOf rounds", () => {
  assert.equal(percentOf(200, 10), 20);
});
