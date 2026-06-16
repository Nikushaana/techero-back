import { OrderStatus } from "../types/order-status.enum";

export const OrderStatusLabelsGeorgian: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_CREATION_PAYMENT]: "წინასწარი ანგარიშსწორების მოლოდინში",
    [OrderStatus.PROCESSING]: "მუშავდება",
    [OrderStatus.ASSIGNED]: "გადანაწილებულია",

    // off site
    [OrderStatus.PICKUP_STARTED]: "კურიერი გზაშია",
    [OrderStatus.PICKED_UP]: "ტექნიკა ჩატვირთულია",
    [OrderStatus.TO_TECHNICIAN]: "მიდის ტექნიკოსთან",
    [OrderStatus.DELIVERED_TO_TECHNICIAN]: "ტექნიკოსს გადაეცა",
    [OrderStatus.INSPECTION]: "მიმდინარეობს დიაგნოსტიკა",
    [OrderStatus.WAITING_DECISION]: "გადაწყვეტილების მოლოდინში",
    // approve
    [OrderStatus.PENDING_REPAIRING_OFF_SITE_PAYMENT]: "სერვისცენტრში სერვისის დასაწყებად ანგარიშსწორების მოლოდინში",
    [OrderStatus.REPAIRING_OFF_SITE]: "სერვისი მიმდინარეობს სერვისცენტრში",
    [OrderStatus.FIXED_READY]: "შეკეთებულია",
    [OrderStatus.RETURNING_FIXED]: "შეკეთებული ტექნიკა ბრუნდება",
    [OrderStatus.RETURNED_FIXED]: "შეკეთებული ტექნიკა დაბრუნდა",
    [OrderStatus.COMPLETED]: "დასრულდა წარმატებით",
    // cancel
    [OrderStatus.REPAIR_CANCELLED]: "შეკეთებაზე დაფიქსირდა უარი",
    [OrderStatus.BROKEN_READY]: "შეუკეთებელი ტექნიკა მზად არის დაბრუნებისთვის",
    [OrderStatus.RETURNING_BROKEN]: "ბრუნდება შეუკეთებელი ტექნიკა",
    [OrderStatus.RETURNED_BROKEN]: "დაბრუნდა შეუკეთებელი ტექნიკა",
    [OrderStatus.CANCELLED]: "დასრულდა შეუკეთებლად",

    // on site
    [OrderStatus.TECHNICIAN_COMING]: "ტექნიკოსი გზაშია",
    [OrderStatus.INSTALLING]: "მიმდინარეობს მონტაჟი",
    [OrderStatus.REPAIRING_ON_SITE]: "მიმდინარეობს ადგილზე შეკეთება",
    [OrderStatus.WAITING_PAYMENT]: "ანგარიშსწორების მოლოდინში",
    [OrderStatus.PENDING_ON_SITE_PAYMENT]: "მიმდინარეობს გადახდა",
    [OrderStatus.COMPLETED_ON_SITE_INSTALLING]: "მონტაჟი დასრულდა",
    [OrderStatus.COMPLETED_ON_SITE_REPAIRING]: "ადგილზე შეკეთება დასრულდა",
};