import { useState } from "react";

export default function Sidebar({ onSearch, onFilter }: { 
	onSearch: (query: string) => void;
	onFilter: (filter: string) => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		onSearch(query);
	};

	const handleFilterChange = (filter: string) => {
		setSelectedFilter(filter);
		onFilter(filter);
	};

	return (
		<aside className="hidden lg:block w-72 shrink-0 pr-6">
			<div className="sticky top-20 space-y-6">
				<div>
					<label className="sr-only" htmlFor="search">Search</label>
					<input
						id="search"
						placeholder="Search transactions"
						value={searchQuery}
						onChange={handleSearch}
						className="w-full rounded-2xl bg-gray-900 border border-gray-800 text-gray-200 placeholder-gray-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
				<div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
					<h3 className="text-sm font-semibold text-gray-300 mb-3">Filters</h3>
					<div className="space-y-3 text-sm text-gray-300">
						<label className="flex items-center gap-3">
							<input 
								type="radio" 
								name="filter" 
								checked={selectedFilter === "all"}
								onChange={() => handleFilterChange("all")}
								className="accent-cyan-500"
							/> 
							All
						</label>
						<label className="flex items-center gap-3">
							<input 
								type="radio" 
								name="filter" 
								checked={selectedFilter === "token_transfers"}
								onChange={() => handleFilterChange("token_transfers")}
								className="accent-cyan-500"
							/> 
							Token Transfers
						</label>
						<label className="flex items-center gap-3">
							<input 
								type="radio" 
								name="filter" 
								checked={selectedFilter === "contract_calls"}
								onChange={() => handleFilterChange("contract_calls")}
								className="accent-cyan-500"
							/> 
							Contract Calls
						</label>
						<label className="flex items-center gap-3">
							<input 
								type="radio" 
								name="filter" 
								checked={selectedFilter === "failed"}
								onChange={() => handleFilterChange("failed")}
								className="accent-cyan-500"
							/> 
							Failed
						</label>
					</div>
				</div>
			</div>
		</aside>
	);
}


