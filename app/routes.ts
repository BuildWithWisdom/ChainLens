import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("/transactions", "routes/transactions.tsx"),
	route("/transaction/:hash", "routes/transaction-details.tsx"),
	route("/leaderboard", "routes/leaderboard.tsx"),
	route("/about", "routes/about.tsx"),
	route("/address/:hash", "routes/address-details.tsx"),
] satisfies RouteConfig;
