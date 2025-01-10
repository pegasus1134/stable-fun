import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins } from 'lucide-react';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center">
                                <Coins className="h-8 w-8 text-blue-500" />
                                <span className="ml-2 text-xl font-bold text-white">stable.fun</span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        isActiveRoute('/')
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/create"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        isActiveRoute('/create')
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    Create Coin
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 text-white rounded-lg px-4 py-2" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="border-t border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-400">
                            © 2025 stable.fun. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="https://twitter.com/etherfuse" className="text-slate-400 hover:text-blue-400">
                                Twitter
                            </a>
                            <a href="https://docs.etherfuse.com" className="text-slate-400 hover:text-blue-400">
                                Docs
                            </a>
                            <a href="https://etherfuse.com" className="text-slate-400 hover:text-blue-400">
                                Etherfuse
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;