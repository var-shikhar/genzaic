export type FulfillmentAction = "already_fulfilled" | "out_of_stock" | "proceed"

/**
 * The single decision fulfillOrder makes under the order row lock. Pure so it
 * can be exhaustively tested without a DB. `null` stock means unlimited.
 */
export function decideFulfillment(args: {
  orderStatus: "pending" | "completed"
  stock: number | null
}): FulfillmentAction {
  if (args.orderStatus === "completed") return "already_fulfilled"
  if (args.stock !== null && args.stock <= 0) return "out_of_stock"
  return "proceed"
}
