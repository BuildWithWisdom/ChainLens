import { CheckCircleIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { api, type TxApi } from "../lib/api";
import SkeletonLoader from "./SkeletonLoader";

export default function TxFeed({ onSelect, limit, searchQuery, filter }: { 
	onSelect: (tx: TxApi) => void; 
	limit?: number;
	searchQuery?: string;
	filter?: string;
}) {
	const [txs, setTxs] = useState<TxApi[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTransactions = async () => {
			setLoading(true);
			try {
				let result: TxApi[];
				
				if (searchQuery && searchQuery.trim()) {
					result = await api.searchTransactions(searchQuery, limit || 50);
				} else if (filter && filter !== 'all') {
					result = await api.filterTransactions(filter, limit || 50);
				} else {
					result = await api.getLatestTransactions(limit || 50);
				}
				
				setTxs(result);
				setError(null);
			} catch (e) {
				setError("Could not load transactions. The data feed may be down.");
			} finally {
				setLoading(false);
			}
		};

		// Fetch immediately
		fetchTransactions();

		// Set up polling for latest transactions
		const interval = setInterval(fetchTransactions, 6000); // 6 seconds

		return () => clearInterval(interval);
	}, [limit, searchQuery, filter]);

	const iconFor = (status: TxApi["status"]) => {
		switch (status) {
			case "success":
				return <CheckCircleIcon className="h-6 w-6 text-emerald-400" />;
			case "pending":
				return <ArrowPathIcon className="h-6 w-6 text-yellow-400" />;
			default:
				return <XCircleIcon className="h-6 w-6 text-rose-500" />;
		}
	};

	const renderSkeletons = () => (
		<div className="space-y-4">
			{[...Array(limit || 3)].map((_, i) => (
				<div key={i} className="w-full text-left rounded-2xl bg-gray-900 border border-gray-800 p-4 shadow-sm">
					<div className="flex items-center gap-4">
						<SkeletonLoader className="h-6 w-6 rounded-full" />
						<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
							<SkeletonLoader className="h-5 w-3/4" />
							<SkeletonLoader className="h-5 w-1/2" />
							<SkeletonLoader className="h-5 w-1/4 justify-self-end" />
						</div>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold text-white">Real-time Transaction Feed</h2>
			{error && (
				<div className="rounded-2xl border border-rose-900 bg-rose-950 text-rose-300 p-4">{error}</div>
			)}
			<div className="space-y-4">
				{loading && txs.length === 0 ? (
					renderSkeletons()
				) : (
					txs.map((tx) => (
						<button
							key={tx.id}
							onClick={() => onSelect(tx)}
							className="w-full text-left rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-4 shadow-sm"
						>
							<div className="flex items-center gap-4">
								{iconFor(tx.status)}
								<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
									<div>
										<p className="text-gray-400">Tx Hash</p>
										<p className="text-gray-200 font-medium">{tx.hash}</p>
									</div>
									<div>
										<p className="text-gray-400">From / To</p>
										<div className="flex items-center gap-1 text-gray-200 font-medium">
											<span className="truncate max-w-[60px]">{tx.from}</span>
											<span>→</span>
											<span className="truncate max-w-[60px]">{tx.to ?? "(contract creation)"}</span>
										</div>
									</div>
									<div className="justify-self-end">
										<p className="text-gray-400 text-right">Value</p>
										<p className="text-gray-200 font-semibold">{tx.value}</p>
									</div>
								</div>
							</div>
						</button>
					))
				)}
			</div>
		</section>
	);
}