import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TxFeed from "../components/TxFeed";
import Analytics from "../components/Analytics";
import TransactionChart from "../components/TransactionChart";
import TxDetails from "../components/TxDetails";
import { api, type TxApi } from "../lib/api"; // Import api
import NewLeaderboard from "../components/NewLeaderboard";

export function Welcome() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<TxApi | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("all");

	// Add state for transactions, loading, and error
	const [txs, setTxs] = useState<TxApi[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch transactions for the homepage
	useEffect(() => {
		const fetchHomepageTransactions = async () => {
			setLoading(true);
			try {
				const limit = 3; // Fixed limit for homepage
				let result: TxApi[];

				if (searchQuery && searchQuery.trim()) {
					result = await api.searchTransactions(searchQuery, limit, 0);
				} else if (filter && filter !== 'all') {
					result = await api.filterTransactions(filter, limit, 0);
				} else {
					result = await api.getLatestTransactions(limit, 0);
				}
				setTxs(result);
				setError(null);
			} catch (e) {
				setError("Could not load transactions for homepage. The data feed may be down.");
			} finally {
				setLoading(false);
			}
		};

		fetchHomepageTransactions();

		// Set up polling for latest transactions (optional, based on desired real-time update frequency)
		const interval = setInterval(fetchHomepageTransactions, 6000); // Poll every 6 seconds

		return () => clearInterval(interval);
	}, [searchQuery, filter]); // Re-fetch when search/filter changes

	

	return (
		<div className="min-h-screen bg-gray-950 text-gray-200">
			<Navbar />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
					<Analytics />
					<div className="flex flex-col lg:flex-row gap-6 mt-8">
					<Sidebar onSearch={setSearchQuery} onFilter={setFilter} />
					<div className="flex-1">
						<TxFeed
							txs={txs}
							loading={loading}
							error={error}
							onSelect={(tx) => {
								setSelected(tx);
								setOpen(true);
							}}
							skeletonCount={3} // Fixed number of skeletons for homepage
						/>
						<div className="mt-4">
							<a href="/transactions" className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900">Show all transactions</a>
						</div>
					</div>
				</div>
				<TransactionChart />
				<NewLeaderboard limit={3} isHomepage={true} />
			</main>
			<TxDetails open={open} onClose={() => setOpen(false)} tx={selected} />
		</div>
	);
}