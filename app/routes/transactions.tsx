import type { Route } from "./+types/transactions";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TxFeed from "../components/TxFeed";
import Analytics from "../components/Analytics";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "All Transactions" },
		{ name: "description", content: "Latest blockchain transactions" },
	];
}

export default function TransactionsPage() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<any>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("all");

	return (
		<div className="min-h-screen bg-gray-950 text-gray-200">
			<Navbar />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
				<div className="flex gap-6">
					<Sidebar onSearch={setSearchQuery} onFilter={setFilter} />
					<div className="flex-1">
						<TxFeed 
							limit={30} 
							searchQuery={searchQuery}
							filter={filter}
							onSelect={(tx) => { setSelected(tx); setOpen(true); }} 
						/>
						<Analytics />
					</div>
				</div>
			</main>
		</div>
	);
}


