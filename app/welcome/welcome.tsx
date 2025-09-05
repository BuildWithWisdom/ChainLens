import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TxFeed from "../components/TxFeed";
import Analytics from "../components/Analytics";
import TxDetails from "../components/TxDetails";
import { transactionStorageService } from "../lib/storageService";

type TxForDetails = {
	hash: string;
	status: string;
	from: string;
	to: string;
	value: string;
	blockNumber: number;
	timestamp: string;
	gasUsed: string;
	gasPrice: string;
};

export function Welcome() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<TxForDetails | null>(null);
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
				<div className="flex gap-6">
					<Sidebar onSearch={setSearchQuery} onFilter={setFilter} />
					<div className="flex-1">
						<TxFeed
							limit={3}
							searchQuery={searchQuery}
							filter={filter}
							onSelect={(tx) => {
								setSelected({
									hash: tx.fullHash, // Use full hash in details
									status: tx.status,
									from: tx.from,
									to: tx.to,
									value: tx.value,
									blockNumber: tx.blockNumber ?? 0,
									timestamp: tx.timestamp ?? "",
									gasUsed: tx.gasUsed ?? "",
									gasPrice: tx.gasPrice ?? "",
								});
								setOpen(true);
							}}
						/>
						<div className="mt-4">
							<a href="/transactions" className="inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900">Show all transactions</a>
						</div>
						<Analytics />
					</div>
				</div>
			</main>
			<TxDetails open={open} onClose={() => setOpen(false)} tx={selected} />
		</div>
	);
}
