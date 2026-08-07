import type { OrderStatus } from "../../types";

export function statusTone(
  status: OrderStatus
): "neutral" | "green" | "red" | "amber" | "blue" {
  switch (status) {
    case "PENDING":
      return "amber";
    case "ACCEPTED":
    case "COOKING":
      return "blue";
    case "READY":
    case "DELIVERED":
      return "green";
    case "CANCELLED":
      return "red";
  }
}

// следующий статус и подпись кнопки для повара
export const NEXT_ACTION: Partial<
  Record<OrderStatus, { next: OrderStatus; labelKey: string }>
> = {
  PENDING: { next: "ACCEPTED", labelKey: "accept" },
  ACCEPTED: { next: "COOKING", labelKey: "startCooking" },
  COOKING: { next: "READY", labelKey: "markReady" },
  READY: { next: "DELIVERED", labelKey: "markDelivered" },
};
