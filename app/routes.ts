import { type RouteConfig, index, route, layout } from '@react-router/dev/routes'

export default [
  // ─── Public Routes ─────────────────────────────────────────────────────────
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('reset-password', 'routes/reset-password.tsx'),
  route('blog', 'routes/blog.tsx'),
  route('blog/:postId', 'routes/blog-post-detail.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('cart', 'routes/cart.tsx'),
  route('products', 'routes/products.tsx'),
  route('products/:productId', 'routes/product-detail.tsx'),
  route('services', 'routes/services.tsx'),
  route('services/:serviceId', 'routes/service-detail.tsx'),

  // ─── Authenticated General Routes ─────────────────────────────────────────
  layout('routes/auth-layout.tsx', [
    route('profile', 'routes/profile.tsx'),
    route('profile/orders', 'routes/profile-orders.tsx'),
    route('profile/tracking', 'routes/profile-tracking.tsx'),
    route('profile/services', 'routes/profile-services.tsx'),
    route('profile/returns', 'routes/profile-returns.tsx'),
    route('checkout', 'routes/checkout.tsx'),
    route('order', 'routes/order.tsx'),
    route('order/address', 'routes/order-address.tsx'),
    route('order/voucher', 'routes/order-voucher.tsx'),
    route('order-success', 'routes/order-success.tsx'),
    route('services/:serviceId/book', 'routes/service-booking.tsx')
  ]),

  // ─── Staff Only Routes ────────────────────────────────────────────────────
  layout('routes/staff-layout.tsx', [
    route('staff/dashboard', 'routes/staff-dashboard.tsx'),
    route('staff/attendance', 'routes/staff-attendance.tsx'),
    route('staff/disposal-request', 'routes/staff-disposal-request.tsx'),
    route('staff/shift-request', 'routes/staff-shift-request.tsx'),
    route('staff/add-product', 'routes/staff-add-product.tsx'),
    route('staff/orders', 'routes/staff-orders.tsx')
  ]),

  // ─── Admin Only Routes ────────────────────────────────────────────────────
  layout('routes/admin-layout.tsx', [
    route('admin/dashboard', 'routes/admin-dashboard.tsx'),
    route('admin/blog', 'routes/admin-blog-management.tsx'),
    route('admin/employees', 'routes/admin-employees.tsx'),
    route('admin/services', 'routes/admin-services.tsx'),
    route('admin/service-bookings', 'routes/admin-service-bookings.tsx'),
    route('admin/users', 'routes/admin-users.tsx'),
    route('admin/vouchers', 'routes/admin-vouchers.tsx'),
    route('admin/shipping', 'routes/admin-shipping.tsx')
  ]),

  // ─── Manager Only Routes ──────────────────────────────────────────────────
  layout('routes/manager-layout.tsx', [
    route('manager/dashboard', 'routes/manager-dashboard.tsx'),
    route('manager/products', 'routes/manager-products.tsx'),
    route('manager/inventory-transactions', 'routes/manager-inventory-transactions.tsx'),
    route('manager/disposal-approvals', 'routes/manager-disposal-approvals.tsx'),
    route('manager/return-requests', 'routes/manager-return-requests.tsx'),
    route('manager/staff-schedule', 'routes/manager-staff-schedule.tsx')
  ])
] satisfies RouteConfig
