export default function Analytics() {
	return (
		<section className="mt-8">
			<h3 className="text-xl font-bold text-white mb-4">Analytics</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="rounded-2xl bg-gradient-to-br from-cyan-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">TPS</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">150</p>
				</div>
				<div className="rounded-2xl bg-gradient-to-br from-indigo-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">Blocks per minute</p>
					<p className="mt-2 text-3xl font-semibold text-cyan-400">12</p>
				</div>
				<div className="rounded-2xl bg-gradient-to-br from-sky-800/30 to-slate-800/30 border border-gray-800 p-6">
					<p className="text-sm text-gray-300">Top active addresses</p>
					<p className="mt-2 text-sm text-gray-400">0xabc..., 0xdef..., 0x123...</p>
				</div>
			</div>
		</section>
	);
}


