import { HeartIcon } from "@heroicons/react/24/solid";

export default function Footer() {
	return (
		<footer className="bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-t border-gray-800 mt-8 py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
				<h3 className="text-lg font-semibold text-white mb-2">Powered by Somnia Network</h3>
				<p className="text-gray-400 text-sm">ChainLens is a realtime block explorer for Somnia, a high‑performance, cost‑efficient EVM‑compatible Layer‑1 blockchain.</p>
				<p className="text-gray-400 text-sm mt-4 flex items-center justify-center">
					Built with <HeartIcon className="h-5 w-5 text-cyan-400 mx-1" /> by Wisdom for the Somnia community.
				</p>
			</div>
		</footer>
	);
}

