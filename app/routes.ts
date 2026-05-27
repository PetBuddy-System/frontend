import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
	route("profile", "routes/profile.tsx"),
	route("profile/services", "routes/profile-services.tsx"),
	route("cart", "routes/cart.tsx"),
	route("checkout", "routes/checkout.tsx"),
	route("order-success", "routes/order-success.tsx"),
	route("products", "routes/products.tsx"),
	route("products/:productId", "routes/product-detail.tsx"),
	route("services", "routes/services.tsx"),
	route("services/:serviceId/book", "routes/service-booking.tsx"),
	route("services/:serviceId", "routes/service-detail.tsx"),
] satisfies RouteConfig;
