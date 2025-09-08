import { useEffect, useState } from "react";
import { api, type TxApi } from "../lib/api";
import TxFeed from "./TxFeed";

const TXS_PER_PAGE = 10;

export default function PaginatedTxFeed({ onSelect, searchQuery, filter }: {
	onSelect: (tx: TxApi) => void;
	searchQuery?: string;
	filter?: string;
}) {
	console.log("PaginatedTxFeed rendered");
	const [txs, setTxs] = useState<TxApi[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);

	const fetchTransactions = async (currentPage: number, currentSearchQuery: string, currentFilter: string) => {
		console.log(`fetchTransactions called for page: ${currentPage}`);
		setLoading(true);
		try {
			const offset = currentPage * TXS_PER_PAGE;
			let result: TxApi[];
			
			if (currentSearchQuery && currentSearchQuery.trim()) {
				result = await api.searchTransactions(currentSearchQuery, TXS_PER_PAGE, offset);
			} else if (currentFilter && currentFilter !== 'all') {
				result = await api.filterTransactions(currentFilter, TXS_PER_PAGE, offset);
			} else {
				result = await api.getLatestTransactions(TXS_PER_PAGE, offset);
			}
			
			console.log(`API returned ${result.length} transactions for page ${currentPage}.`);
			
			setTxs(prevTxs => {
				const newTxs = currentPage === 0 ? result : [...prevTxs, ...result];
				const uniqueTxs = Array.from(new Map(newTxs.map(tx => [tx.id, tx])).values());
				console.log(`Total transactions in state after setTxs: ${uniqueTxs.length}`);
				return uniqueTxs;
			});
			const newHasMore = result.length === TXS_PER_PAGE;
			setHasMore(newHasMore);
			console.log(`hasMore set to: ${newHasMore}`);
			setError(null);
		} catch (e) {
			setError("Could not load transactions. The data feed may be down.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		console.log("useEffect [searchQuery, filter] triggered");
		setPage(0); // Always reset page to 0 when search/filter changes
		setHasMore(true); // Assume hasMore until first fetch
		setTxs([]); // Clear transactions on new search/filter
		fetchTransactions(0, searchQuery, filter);
	}, [searchQuery, filter]);

	const loadMoreTxs = () => {
		console.log("loadMoreTxs called");
		if (hasMore && !loading) {
			const nextPage = page + 1;
			console.log(`Setting page to: ${nextPage}`);
			setPage(nextPage);
			fetchTransactions(nextPage, searchQuery, filter);
		} else {
			console.log(`loadMoreTxs not executed. hasMore: ${hasMore}, loading: ${loading}`);
		}
	};

	return (
		<>
			<TxFeed 
				txs={txs}
				loading={loading}
				error={error}
				onSelect={onSelect} 
				skeletonCount={TXS_PER_PAGE}
			/>
			{hasMore && !loading && !error && (
				<div className="text-center mt-4">
					<button
						onClick={loadMoreTxs}
						className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900"
					>
						Load More
					</button>
				</div>
			)}
		</>
	);
}