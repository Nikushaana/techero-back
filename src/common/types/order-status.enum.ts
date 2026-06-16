export enum OrderStatus {
  PENDING_CREATION_PAYMENT  = 'pending_creation_payment',
  PROCESSING = 'processing',
  ASSIGNED = 'assigned',

  // off site
  PICKUP_STARTED = 'pickup_started',
  PICKED_UP = 'picked_up',
  TO_TECHNICIAN = 'to_technician',
  DELIVERED_TO_TECHNICIAN = 'delivered_to_technician',
  INSPECTION = 'inspection',
  WAITING_DECISION = 'waiting_decision',
  // approve
  PENDING_REPAIRING_OFF_SITE_PAYMENT = 'pending_repairing_off_site_payment',
  REPAIRING_OFF_SITE = 'repairing_off_site',
  FIXED_READY = 'fixed_ready',
  RETURNING_FIXED = 'returning_fixed',
  RETURNED_FIXED = 'returned_fixed',
  COMPLETED = 'completed',
  // cancel
  REPAIR_CANCELLED = 'repair_cancelled',
  BROKEN_READY = 'broken_ready',
  RETURNING_BROKEN = 'returning_broken',
  RETURNED_BROKEN = 'returned_broken',
  CANCELLED = 'cancelled',

  // on site
  TECHNICIAN_COMING = 'technician_coming',
  INSTALLING = 'installing',
  REPAIRING_ON_SITE = 'repairing_on_site',
  WAITING_PAYMENT = 'waiting_payment',
  PENDING_ON_SITE_PAYMENT = 'pending_on_site_payment',
  COMPLETED_ON_SITE_INSTALLING = 'completed_on_site_installing',
  COMPLETED_ON_SITE_REPAIRING = 'completed_on_site_repairing'
}