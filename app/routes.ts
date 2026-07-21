import { type RouteConfig, index, route, layout } from '@react-router/dev/routes'

export default [
  // ─── Public Routes ─────────────────────────────────────────────────────────
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('reset-password', 'routes/reset-password.tsx'),
  route('oauth2/success', 'routes/oauth2-success.tsx'),
  route('blog', 'routes/blog.tsx'),
  route('blog/:postId', 'routes/blog-post-detail.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('cart', 'routes/cart.tsx'),
  route('products', 'routes/products.tsx'),
  route('products/:productId', 'routes/product-detail.tsx'),
  route('services', 'routes/services.tsx'),
  route('services/:serviceId', 'routes/service-detail.tsx'),
  route('payment/momo/return', 'routes/momo-return.tsx'),

  // ─── Authenticated General Routes ─────────────────────────────────────────
  layout('routes/auth-layout.tsx', [
    route('profile', 'routes/profile.tsx'),
    route('change-password', 'routes/change-password.tsx'),
    route('profile/pets', 'routes/profile-pets.tsx'),
    route('profile/pets/new', 'routes/profile-pet-new.tsx'),
    route('profile/pets/:petId/edit', 'routes/profile-pet-edit.tsx'),
    route('profile/pets/:petId', 'routes/profile-pet-detail.tsx'),
    route('profile/orders', 'routes/profile-orders.tsx'),
    route('profile/orders/:orderId', 'routes/profile-order-detail.tsx'),
    route('profile/orders/:orderId/cancel', 'routes/profile-order-cancel.tsx'),
    route('profile/services', 'routes/profile-services.tsx'),
    route('my-bookings', 'routes/my-bookings.tsx'),
    route('my-bookings/:bookingId', 'routes/my-booking-detail.tsx'),
    route('profile/returns', 'routes/profile-returns.tsx'),
    route('booking', 'routes/booking.tsx'),
    route('checkout', 'routes/checkout.tsx'),
    route('payment', 'routes/payment.tsx'),
    route('payment-failed', 'routes/payment-failed.tsx'),
    route('order', 'routes/order.tsx'),
    route('order/address', 'routes/order-address.tsx'),
    route('order/voucher', 'routes/order-voucher.tsx'),
    route('order-success', 'routes/order-success.tsx'),
    route('services/:serviceId/book', 'routes/service-booking.tsx')
  ]),

  // ─── Staff Only Routes ────────────────────────────────────────────────────
  layout('routes/staff-layout.tsx', [
    route('staff/dashboard', 'routes/staff-dashboard.tsx'),
    route('staff/groomer-bookings', 'routes/staff-groomer-bookings.tsx'),
    route('staff/groomer-bookings/:bookingId', 'routes/staff-groomer-booking-detail.tsx'),
    route('staff/coordinator-bookings', 'routes/staff-coordinator-bookings.tsx'),
    route('staff/attendance', 'routes/staff-attendance.tsx'),
    route('staff/disposal-request', 'routes/staff-disposal-request.tsx'),
    route('staff/weekly-schedule', 'routes/staff-weekly-schedule.tsx'),
    route('staff/weekly-schedule/:staffScheduleId', 'routes/staff-schedule-detail.tsx'),
    route('staff/add-product', 'routes/staff-add-product.tsx'),
    route('staff/orders', 'routes/staff-orders.tsx'),
    route('staff/orders/:orderId', 'routes/staff-order-detail.tsx'),
    route('staff/orders/:orderId/cancel', 'routes/staff-order-cancel.tsx'),
    route('staff/returns', 'routes/staff-returns.tsx'),
    route('staff/shipper-assignment', 'routes/staff-shipper-assignment.tsx'),
    route('staff/delivery-route', 'routes/staff-delivery-route.tsx')
  ]),

  // ─── Admin Only Routes ────────────────────────────────────────────────────
  layout('routes/admin-layout.tsx', [
    route('admin/dashboard', 'routes/admin-dashboard.tsx'),
    route('admin/blog', 'routes/admin-blog-management.tsx'),
    route('admin/employees', 'routes/admin-employees.tsx'),
    route('admin/employees/new', 'routes/admin-customer-new.tsx'),
    route('admin/employees/:userId/edit', 'routes/admin-customer-edit.tsx'),
    route('admin/employees/:userId', 'routes/admin-customer-detail.tsx'),
    route('admin/services', 'routes/admin-services.tsx'),
    route('admin/bookings', 'routes/admin-bookings.tsx'),
    route('admin/service-bookings', 'routes/admin-service-bookings.tsx'),
    route('admin/users', 'routes/admin-users.tsx'),
    route('admin/users/new', 'routes/admin-user-new.tsx'),
    route('admin/users/:userId/edit', 'routes/admin-user-edit.tsx'),
    route('admin/users/:userId', 'routes/admin-user-detail.tsx'),
    route('admin/vouchers', 'routes/admin-vouchers.tsx'),
    route('admin/orders', 'routes/admin-orders.tsx'),
    route('admin/orders/:orderId', 'routes/admin-order-detail.tsx'),
    route('admin/shipping', 'routes/admin-shipping.tsx'),
    route('admin/audit-logs', 'routes/admin-audit-logs.tsx'),
    route('admin/audit-logs/:auditLogId', 'routes/admin-audit-detail.tsx')
  ]),

  // ─── Manager Only Routes ──────────────────────────────────────────────────
  layout('routes/manager-layout.tsx', [
    route('manager/products', 'routes/manager-products.tsx'),
    route('manager/services', 'routes/manager-services.tsx'),
    route('manager/bookings', 'routes/manager-bookings.tsx'),
    route('manager/inventory-transactions', 'routes/manager-inventory-transactions.tsx'),
    route('manager/staff-schedule', 'routes/manager-staff-schedule.tsx'),
    route('manager/staff-schedule/new', 'routes/manager-staff-schedule-new.tsx'),
    route('manager/staff-schedule/:workScheduleId/edit', 'routes/manager-staff-schedule-edit.tsx'),
    route('manager/staff-schedule/:workScheduleId/staff', 'routes/manager-staff-schedule-staff.tsx'),
    route('manager/restock', 'routes/manager-restock.tsx'),
    route('manager/staff-schedule/:workScheduleId', 'routes/manager-staff-schedule-detail.tsx'),
    route('manager/products/:productId', 'routes/manager-product-detail.tsx'),
    route('manager/promotions', 'routes/manager-promotions.tsx'),
    route('manager/promotions/new', 'routes/manager-promotion-create.tsx'),
    route('manager/promotions/:promotionId/edit', 'routes/manager-promotion-edit.tsx'),
    route('manager/store-locations', 'routes/manager-store-locations.tsx'),
    route('manager/reviews', 'routes/manager-reviews.tsx'),
    route('manager/vouchers', 'routes/manager-vouchers.tsx')
  ])
] satisfies RouteConfig
