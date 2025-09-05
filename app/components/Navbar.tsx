import { Link } from "react-router";

export default function Navbar() {
	return (
		<header className="fixed top-0 inset-x-0 z-40 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-6 w-6 rounded-lg bg-cyan-500" />
					<Link to="/" className="text-white font-semibold tracking-tight">Chainlens</Link>
				</div>
				<nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
					<a href="#" className="hover:text-white">Docs</a>
					<a href="#" className="hover:text-white">About</a>
					<button className="ml-2 inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors">Connect Wallet</button>
				</nav>
			</div>
		</header>
	);
}


