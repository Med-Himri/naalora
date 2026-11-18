// Client-safe pricing rules (the server recomputes everything at checkout).

/** Delivery settings, editable in Admin → Réglages. fee 0 = free delivery. */
export type ShippingSettings = { fee: number; freeFrom: number | null };

/** Default until the admin saves something: free delivery everywhere. */
export const DEFAULT_SHIPPING: ShippingSettings = { fee: 0, freeFrom: null };

export const MAX_QTY_PER_LINE = 10;

export function shippingFor(subtotal: number, s: ShippingSettings): number {
  if (subtotal <= 0 || s.fee <= 0) return 0;
  if (s.freeFrom !== null && s.freeFrom > 0 && subtotal >= s.freeFrom) return 0;
  return s.fee;
}

export const isFreeShipping = (s: ShippingSettings) => s.fee <= 0;
export const hasFreeThreshold = (s: ShippingSettings) => s.fee > 0 && s.freeFrom !== null && s.freeFrom > 0;
