import { CheckCircleIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { type TxApi } from "../lib/api";
import SkeletonLoader from "./SkeletonLoader"; // Keep this import for skeleton loading

export default function TxFeed({ onSelect, txs, loading, loadingMore, error, skeletonCount }: {
	onSelect: (tx: TxApi) => void;
	txs: TxApi[];
	loading: boolean;
	loadingMore?: boolean;
	error: string | null;
	skeletonCount?: number;
}) {

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
			{[...Array(skeletonCount || 3)].map((_, i) => (
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
					<>
						{Array.isArray(txs) && txs.map((tx) => (
							<button
							key={tx.id}
							onClick={() => onSelect(tx)}
							className="w-full text-left rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors p-4 shadow-sm cursor-pointer"
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
												<a href={`/address/${tx.from}`} className="truncate max-w-[60px] text-cyan-300 hover:underline">{tx.from}</a>
												<span>→</span>
												<a href={`/address/${tx.to}`} className="truncate max-w-[60px] text-cyan-300 hover:underline">{tx.to ?? "(contract creation)"}</a>
											</div>
										</div>
										<div className="justify-self-end">
											<p className="text-gray-400 text-right">Value</p>
											<p className="text-gray-200 font-semibold">{tx.value}</p>
										</div>
									</div>
								</div>
							</button>
						))}
						{loadingMore && renderSkeletons()}
					</>
				)}
			</div>
		</section>
	);
}
