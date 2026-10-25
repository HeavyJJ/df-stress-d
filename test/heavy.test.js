import test from "node:test";
import assert from "node:assert/strict";
import { percentOf } from "../src/clamp.js";

// Bounded memory hog: ~300 MB. Fine on a GitHub runner; on a 256 MB server the
// child should be killed WITHOUT taking the webhook process down with it.
test("allocates a large buffer and still computes", () => {
  const blocks = [];
  for (let i = 0; i < 300; i += 1) {
    const b = Buffer.alloc(1024 * 1024, i & 0xff); // 1 MB each, touched so it is resident
    blocks.push(b);
  }
  assert.equal(blocks.length, 300);
});

// The real bug Draft Fixer should fix (percentOf is off by one):
test("percentOf returns exactly ten percent", () => {
  assert.equal(percentOf(200, 10), 20);
  assert.equal(percentOf(150, 10), 15);
});
