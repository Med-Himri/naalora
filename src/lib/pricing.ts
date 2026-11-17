// Client-safe pricing rules (the server recomputes everything at checkout).
export const SHIPPING_FEE = 35;
export const FREE_SHIPPING_FROM = 500;
export const MAX_QTY_PER_LINE = 10;

export function shippingFor(subtotal: number): number {
  return subtotal <= 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}
