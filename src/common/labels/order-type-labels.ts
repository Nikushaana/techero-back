import { OrderType } from "../types/order-type.enum";

export const OrderTypeLabelsGeorgian: Record<OrderType, string> = {
    [OrderType.FIX_OFF_SITE]: 'შეკეთება სერვისცენტრში',
    [OrderType.INSTALLATION]: 'მონტაჟი',
    [OrderType.FIX_ON_SITE]: 'შეკეთება ადგილზე',
};