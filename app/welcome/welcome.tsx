import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TxFeed from "../components/TxFeed";
import Analytics from "../components/Analytics";
import TransactionChart from "../components/TransactionChart";
import TxDetails from "../components/TxDetails";
import { transactionStorageService } from "../lib/storageService";
import type { TxApi } from "../lib/api";

export function Welcome() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<TxApi | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("all");

	// Start the background storage service
	useEffect(() => {
		transactionStorageService.start();
		return () => {
			transactionStorageService.stop();
		};
	}, []);

	return (
		<div className="min-h-screen bg-gray-950 text-gray-200">
			<Navbar />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
				<div className="flex flex-col lg:flex-row gap-6">
					<Sidebar onSearch={setSearchQuery} onFilter={setFilter} />
					<div className="flex-1">
						<TxFeed
							limit={3}
							searchQuery={searchQuery}
							filter={filter}
							onSelect={(tx) => {
								setSelected(tx);
								setOpen(true);
							}}
						/>
						<div className="mt-4">
							<a href="/transactions" className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900">Show all transactions</a>
						</div>
						<Analytics />
						<TransactionChart />
					</div>
				</div>
			</main>
			<TxDetails open={open} onClose={() => setOpen(false)} tx={selected} />
		</div>
	);
}
