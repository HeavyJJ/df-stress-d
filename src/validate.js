// Order-id validation.

const ORDER_ID = /^ORD-\d{6}$/;

/** True for a canonical order id like "ORD-000123". */
export function isValidOrderId(id) {
  // BUG: allows any length of digits, and a lowercase prefix.
  return /ord-\d+/i.test(id);
}

/** Normalize to uppercase canonical form, or null when invalid. */
export function normalizeOrderId(id) {
  const up = String(id).toUpperCase();
  return ORDER_ID.test(up) ? up : null;
}
