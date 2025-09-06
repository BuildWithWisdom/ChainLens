import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("/transactions", "routes/transactions.tsx"),
	route("/transaction/:hash", "routes/transaction-details.tsx"),
] satisfies RouteConfig;
