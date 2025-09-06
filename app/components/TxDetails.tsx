import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { Link } from "react-router";
import type { TxApi } from "../lib/api";

type Props = {
	open: boolean;
	onClose: () => void;
	tx: (TxApi & {
		blockNumber?: number;
		timestamp?: string;
		gasUsed?: string;
		gasPrice?: string;
	}) | null;
};

export default function TxDetails({ open, onClose, tx }: Props) {
	return (
		<Transition show={open} as={Fragment}>
			<Dialog onClose={onClose} className="relative z-50">
				<TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
					<div className="fixed inset-0 bg-black/60" />
				</TransitionChild>
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-4" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
						<DialogPanel className="w-full max-w-4xl rounded-2xl bg-gray-900 border border-gray-800 p-6 text-gray-200">
							<Dialog.Title className="text-lg font-semibold text-white">Transaction Details</Dialog.Title>
							{tx && (
								<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-gray-400">Tx Hash</p>
										<p className="break-all">{tx.hash}</p>
									</div>
									<div>
										<p className="text-gray-400">Status</p>
										<p className="capitalize">{tx.status}</p>
									</div>
									<div>
										<p className="text-gray-400">From</p>
										<p className="break-all font-mono text-xs">{tx.from}</p>
									</div>
									<div>
										<p className="text-gray-400">To</p>
										<p className="break-all font-mono text-xs">{tx.to}</p>
									</div>
									<div>
										<p className="text-gray-400">Value</p>
										<p>{tx.value}</p>
									</div>
									<div>
										<p className="text-gray-400">Block</p>
										<p>{tx.blockNumber}</p>
									</div>
									<div>
										<p className="text-gray-400">Timestamp</p>
										<p>{tx.timestamp}</p>
									</div>
									<div>
										<p className="text-gray-400">Gas</p>
										<p>
											{tx.gasUsed} @ {tx.gasPrice}
										</p>
									</div>
								</div>
							)}
							<div className="mt-6 flex justify-end gap-4">
								<button onClick={onClose} className="rounded-xl bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white">Close</button>
								{tx && (
									<Link to={`/transaction/${tx.fullHash}`} className="rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-900">See full details</Link>
								)}
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}


