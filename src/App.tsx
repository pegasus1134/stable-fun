import { Outlet, Link, useLocation } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-900">
            <nav className="border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center">
                                <Coins className="h-8 w-8 text-blue-500" />
                                <span className="ml-2 text-xl font-bold text-white">stable.fun</span>
                            </Link>

                            <div className="ml-10 flex space-x-4">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        location.pathname === '/'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-blue-600 hover:text-white'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/create"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        location.pathname === '/create'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-blue-600 hover:text-white'
                                    }`}
                                >
                                    Create Coin
                                </Link>
                            </div>
                        </div>

                        <div>
                            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </main>

            <footer className="border-t border-slate-800 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">© 2025 stable.fun</p>
                        <div className="flex space-x-6">
                            <a href="https://twitter.com/etherfuse" className="text-gray-400 hover:text-blue-400">
                                Twitter
                            </a>
                            <a href="https://docs.etherfuse.com" className="text-gray-400 hover:text-blue-400">
                                Docs
                            </a>
                            <a href="https://etherfuse.com" className="text-gray-400 hover:text-blue-400">
                                Etherfuse
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;