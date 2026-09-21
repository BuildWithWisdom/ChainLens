import { useEffect } from "react";
import { Link } from "react-router";
import type { TxApi } from "../lib/api";
import SkeletonLoader from "./SkeletonLoader";

type Props = {
	open: boolean;
	onClose: () => void;
	tx: (TxApi & {
		blockNumber?: number;
		timestamp?: string;
		gasUsed?: string;
		fee?: string;
	}) | null;
};

export default function TxDetails({ open, onClose, tx }: Props) {
	// Close on Escape and lock body scroll while open
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="relative z-50" role="dialog" aria-modal="true" aria-label="Transaction Details">
			<div className="fixed inset-0 bg-black/60" onClick={onClose} />
			<div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
				<div className="pointer-events-auto w-full max-w-4xl rounded-2xl bg-gray-900 border border-gray-800 p-6 text-gray-200 max-h-[90vh] overflow-y-auto">
					<h2 className="text-lg font-semibold text-white">Transaction Details</h2>
					{!tx ? (
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<SkeletonLoader className="h-5 w-3/4" />
							<SkeletonLoader className="h-5 w-1/2" />
							<SkeletonLoader className="h-5 w-full" />
							<SkeletonLoader className="h-5 w-2/3" />
							<SkeletonLoader className="h-5 w-1/4" />
							<SkeletonLoader className="h-5 w-full" />
							<SkeletonLoader className="h-5 w-1/2" />
							<SkeletonLoader className="h-5 w-3/4" />
						</div>
					) : (
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-400">Tx Hash</p>
								<p className="break-all">{tx.fullHash}</p>
							</div>
							<div>
								<p className="text-gray-400">Status</p>
								<p className="capitalize">{tx.status}</p>
							</div>
							<div>
								<p className="text-gray-400">From</p>
								<Link to={`/address/${tx.from}`} className="break-all font-mono text-xs text-cyan-300 hover:underline">{tx.from}</Link>
							</div>
							<div>
								<p className="text-gray-400">To</p>
								<Link to={`/address/${tx.to}`} className="break-all font-mono text-xs text-cyan-300 hover:underline">{tx.to ?? "(contract creation)"}</Link>
							</div>
							<div>
								<p className="text-gray-400">Value</p>
								<p>{tx.value}</p>
							</div>
							<div>
								<p className="text-gray-400">Slot</p>
								<p>{tx.blockNumber}</p>
							</div>
							<div>
								<p className="text-gray-400">Timestamp</p>
								<p>{tx.timestamp}</p>
							</div>
							<div>
								<p className="text-gray-400">Fee</p>
								<p>{tx.fee ?? 'N/A'}</p>
							</div>
							<div>
								<p className="text-gray-400">Compute Units</p>
								<p>{tx.gasUsed ? Number(tx.gasUsed).toLocaleString() : 'N/A'}</p>
							</div>
						</div>
					)}
					<div className="mt-6 flex justify-end gap-4">
						<button onClick={onClose} className="rounded-xl bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white">Close</button>
						{tx && (
							<Link to={`/transaction/${tx.fullHash}`} className="rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900">See full details</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
