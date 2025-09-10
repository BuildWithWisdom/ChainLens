import { useState } from "react";
import { Link } from "react-router";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import classnames from "classnames";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<header className="fixed top-0 inset-x-0 z-40 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<img src="/favicon.ico" alt="App Logo" className="h-6 w-6" />
					
					<Link to="/" className="text-white font-semibold tracking-tight">Chainlens</Link>
				</div>
				<div className="flex items-center">
					<nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
						<Link to="/transactions" className="hover:text-white">Transactions</Link>
						<Link to="/leaderboard" className="hover:text-white">Leaderboards</Link>
						{/* <button disabled title="Coming soon" className="hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Try Somnia gas free</button> */}
						<Link to="/about" className="hover:text-white">About</Link>
						<button disabled title="Coming soon" className="hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">Join Pool</button>
						<button disabled title="Coming soon" className="ml-2 inline-flex items-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Connect Wallet</button>
					</nav>
					<div className="-mr-2 flex md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white cursor-pointer"
							aria-controls="mobile-menu"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							{isOpen ? (
								<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
							) : (
								<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
							)}
						</button>
					</div>
				</div>
			</div>
			<div className={classnames("md:hidden absolute top-16 inset-x-0 transition-all duration-300 ease-in-out", {
				"max-h-screen opacity-100 pointer-events-auto": isOpen,
				"max-h-0 opacity-0 pointer-events-none": !isOpen,
			})} id="mobile-menu">
				<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-b border-gray-800">
						<Link to="/transactions" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>Transactions</Link>
						<Link to="/leaderboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>Leaderboards</Link>
						<Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>About</Link>
						<button disabled title="Coming soon" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left">Try Somnia gas free</button>
						<button disabled title="Coming soon" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left">Join Pool</button>
						<button disabled title="Coming soon" className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-cyan-500/90 hover:bg-cyan-400 px-3 py-2 text-base font-medium text-gray-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Connect Wallet</button>
					</div>
				</div>
				
		</header>
	);
}


