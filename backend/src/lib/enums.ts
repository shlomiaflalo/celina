// Строковые "enum"-типы (SQLite не поддерживает нативные enum).

export type Role = "BUYER" | "COOK";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "COOKING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type Fulfillment = "DELIVERY" | "PICKUP";
