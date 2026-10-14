import "server-only";
import { sendOrderConfirmation } from "@/lib/notify";
import { repo } from "@/lib/repo";

/** Marca como pagado y envía la confirmación una sola vez. */
export async function completeOrder(code: string, providerRef?: string) {
  const before = await repo.getOrderByCode(code);
  if (!before) return null;
  if (before.status === "pagado") return before;
  const order = await repo.markOrderPaid(code, providerRef);
  if (order) {
    const bookings = await repo.listBookings({ orderCode: code });
    await sendOrderConfirmation(order, bookings);
  }
  return order;
}
