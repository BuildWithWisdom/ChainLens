import { useEffect, useState } from "react";
import { api } from "../lib/api";
import SkeletonLoader from "./SkeletonLoader";

export default function Analytics() {
	const [stats, setStats] = useState({
		tps: 0,
		blocksPerMinute: 0,
		activeAddresses: 0,
		totalTxs: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const updateStats = async () => {
			setLoading(true);
			try {
				const analytics = await api.getAnalytics();
				setStats(analytics);
				setError(null);
			} catch (error) {
				console.error('Failed to update analytics:', error);
				setError("Analytics data is currently unavailable.");
			} finally {
				setLoading(false);
			}
		};

		// Update stats immediately and then every 6 seconds
		updateStats();
		const interval = setInterval(updateStats, 6000);
		
		return () => clearInterval(interval);
	}, []);

	const renderStat = (label: string, value: string | number) => (
		<div className="rounded-2xl bg-gradient-to-br from-cyan-800/30 to-slate-800/30 border border-gray-800 p-6">
			<p className="text-sm text-gray-300">{label}</p>
			{loading ? (
				<SkeletonLoader className="h-8 w-3/4 mt-2" />
			) : (
				<p className="mt-2 text-3xl font-semibold text-cyan-400">{value}</p>
			)}
		</div>
	);

	return (
		<section className="mt-8">
			<h3 className="text-xl font-bold text-white mb-4">Analytics</h3>
			{error && (
				<div className="rounded-2xl border border-rose-900 bg-rose-950 text-rose-300 p-4 mb-4">{error}</div>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{renderStat("TPS (est.)", stats.tps)}
				{renderStat("Blocks (1min)", stats.blocksPerMinute)}
				{renderStat("Active addresses (1min)", stats.activeAddresses)}
				{renderStat("Recent txs (1min)", stats.totalTxs)}
			</div>
		</section>
	);
}


