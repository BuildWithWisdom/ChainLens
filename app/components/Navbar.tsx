import { Link } from "react-router";

export default function Navbar() {
	return (
		<header className="fixed top-0 inset-x-0 z-40 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<img src="/favicon.ico" alt="App Logo" className="h-6 w-6" />
					
					<Link to="/" className="text-white font-semibold tracking-tight">Chainlens</Link>
				</div>
				<nav className="md:flex items-center gap-8 text-sm text-gray-300">
					<Link to="/transactions" className="hover:text-white">Transactions</Link>
					<Link to="/leaderboard" className="hover:text-white">Leaderboards</Link>
					<button disabled title="Coming soon" className="hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Try Somnia gas free</button>
					<button disabled title="Coming soon" className="hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Join Pool</button>
					<Link to="/about" className="hover:text-white">About Chainlens</Link>
					<button disabled title="Coming soon" className="ml-2 inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Connect Wallet</button>
				</nav>
			</div>
		</header>
	);
}


