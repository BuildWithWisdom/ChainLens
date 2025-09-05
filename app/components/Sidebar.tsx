export default function Sidebar() {
	return (
		<aside className="hidden lg:block w-72 shrink-0 pr-6">
			<div className="sticky top-20 space-y-6">
				<div>
					<label className="sr-only" htmlFor="search">Search</label>
					<input
						id="search"
						placeholder="Search transactions"
						className="w-full rounded-2xl bg-gray-900 border border-gray-800 text-gray-200 placeholder-gray-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
				<div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
					<h3 className="text-sm font-semibold text-gray-300 mb-3">Filters</h3>
					<div className="space-y-3 text-sm text-gray-300">
						<label className="flex items-center gap-3"><input type="radio" name="filter" defaultChecked className="accent-cyan-500"/> All</label>
						<label className="flex items-center gap-3"><input type="radio" name="filter" className="accent-cyan-500"/> Token Transfers</label>
						<label className="flex items-center gap-3"><input type="radio" name="filter" className="accent-cyan-500"/> Contract Calls</label>
						<label className="flex items-center gap-3"><input type="radio" name="filter" className="accent-cyan-500"/> Failed</label>
					</div>
				</div>
			</div>
		</aside>
	);
}


