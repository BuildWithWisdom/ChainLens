import { CheckCircleIcon, ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/solid";

type Tx = {
	id: string;
	hash: string;
	from: string;
	to: string;
	status: "success" | "pending" | "failed";
	value: string;
};

export default function TxFeed({ onSelect }: { onSelect: (tx: Tx) => void }) {
	const txs: Tx[] = [
		{ id: "1", hash: "0xabc123def456...", from: "0x123...", to: "0x456...", status: "success", value: "1.2 ETH" },
		{ id: "2", hash: "0xdef456abc123...", from: "0x789...", to: "0xabc...", status: "pending", value: "0.5 ETH" },
		{ id: "3", hash: "0xabc789def012...", from: "0xdef...", to: "0x012...", status: "failed", value: "5.0 ETH" },
	];

	const iconFor = (status: Tx["status"]) => {
		switch (status) {
			case "success":
				return <CheckCircleIcon className="h-6 w-6 text-emerald-400" />;
			case "pending":
				return <ArrowPathIcon className="h-6 w-6 text-yellow-400" />;
			default:
				return <XCircleIcon className="h-6 w-6 text-rose-500" />;
		}
	};

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold text-white">Real-time Transaction Feed</h2>
			<div className="space-y-4">
				{txs.map((tx) => (
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
									<p className="text-gray-200 font-medium">{tx.from} → {tx.to}</p>
								</div>
								<div className="justify-self-end">
									<p className="text-gray-400 text-right">Value</p>
									<p className="text-gray-200 font-semibold">{tx.value}</p>
								</div>
							</div>
						</div>
					</button>
				))}
			</div>
		</section>
	);
}


