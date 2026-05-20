import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
	route("products", "routes/products.tsx"),
	route("services", "routes/services.tsx"),
] satisfies RouteConfig;
