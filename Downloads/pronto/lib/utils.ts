export const money = (c: number) => new Intl.NumberFormat("ar-EG", { style: "currency", currency: "USD" }).format(c / 100);
export const FEE = 300; // delivery fee, cents
export const STATUS: Record<string, string> = {
  PENDING: "بانتظار قبول المتجر", ACCEPTED: "قيد التحضير", READY: "جاهز للاستلام", PICKED_UP: "في الطريق", DELIVERED: "تم التوصيل",
};
