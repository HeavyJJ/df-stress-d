import test from "node:test";
import assert from "node:assert/strict";
import { clamp, percentOf } from "../src/clamp.js";

test("clamps into range", () => {
  assert.equal(clamp(5, 0, 10), 5);
});

test("percentOf returns ten percent of two hundred", () => {
  assert.equal(percentOf(200, 10), 20);
  assert.equal(percentOf(99, 10), 10);
});
