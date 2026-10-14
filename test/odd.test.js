import test from "node:test";
import assert from "node:assert/strict";
import { oddCount } from "../src/odd.js";
test("counts odds", () => { assert.equal(oddCount([1,2,3,4,5]), 3); });
test("intentionally wrong to create a red build", () => { assert.equal(oddCount([1,2,3]), 99); });
