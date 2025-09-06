import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Analytics() {
	const [stats, setStats] = useState({
		tps: 0,
		blocksPerMinute: 0,
		activeAddresses: 0,
		totalTxs: 0,
	});

	useEffect(() => {
		const updateStats = async () => {
			try {
				const analytics = await api.getAnalytics();
				setStats(analytics);
			} catch (error) {
				console.error('Failed to update analytics:', error);
			}
		};

		// Update stats immediately and then every 6 seconds
		updateStats();
		const interval = setInterval(updateStats, 6000);
		
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="mt-8">
			<h3 className="text-xl font-bold text-white mb-4">Analytics</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="rounded-2xl bg-gradient-to-br from-cyan-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">TPS (est.)</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">{stats.tps}</p>
				</div>
				<div className="rounded-2xl bg-gradient-to-br from-indigo-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">Blocks per minute</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">{stats.blocksPerMinute}</p>
				</div>
				<div className="rounded-2xl bg-gradient-to-br from-sky-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">Active addresses</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">{stats.activeAddresses}</p>
				</div>
				<div className="rounded-2xl bg-gradient-to-br from-emerald-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">Recent txs (1min)</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">{stats.totalTxs}</p>
				</div>
			</div>
		</section>
	);
}


