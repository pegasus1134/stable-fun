// src/views/Dashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PlusCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import useStore from '@/store/useStore';

function Dashboard() {
    const navigate = useNavigate();
    const { connected, publicKey } = useWallet();
    const { toast } = useToast();
    const {
        stablecoins,
        loading,
        error,
        fetchStablecoins,
        fetchUserBalance
    } = useStore();

    useEffect(() => {
        fetchStablecoins().catch(error => {
            toast({
                variant: "destructive",
                title: "Error loading stablecoins",
                description: error.message,
            });
        });
    }, [fetchStablecoins]);

    useEffect(() => {
        if (connected && publicKey) {
            stablecoins.forEach(coin => {
                fetchUserBalance(coin.address);
            });
        }
    }, [connected, publicKey, stablecoins]);

    const getTotalValue = () => {
        return stablecoins.reduce((total, coin) => {
            return total + (coin.totalSupply * coin.price);
        }, 0);
    };

    const getAveragePrice = () => {
        if (stablecoins.length === 0) return 0;
        return stablecoins.reduce((total, coin) => total + coin.price, 0) / stablecoins.length;
    };

    const getTotalHolders = () => {
        return stablecoins.reduce((total, coin) => total + coin.holders, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Total Value Locked</p>
                            <p className="text-2xl font-semibold text-white">
                                ${getTotalValue().toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-600/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Active Coins</p>
                            <p className="text-2xl font-semibold text-white">
                                {stablecoins.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                            <Users className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Total Holders</p>
                            <p className="text-2xl font-semibold text-white">
                                {getTotalHolders()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stablecoins List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stablecoins.map((coin) => (
                    <div key={coin.address} className="bg-slate-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {coin.name} ({coin.symbol})
                            </h3>
                            <span className="text-sm text-gray-400">
                                {coin.targetCurrency}
                            </span>
                        </div>

                        <div className="h-48 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={coin.chartData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        domain={[0.98, 1.02]}
                                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate(`/mint/${coin.symbol}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Mint
                            </button>
                            <button
                                onClick={() => navigate(`/redeem/${coin.symbol}`)}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Redeem
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create New Card */}
                <div className="bg-slate-800 rounded-lg p-8">
                    <div className="text-center">
                        {!connected ? (
                            <>
                                <PlusCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Connect Your Wallet</h3>
                                <p className="text-gray-400 mb-4">Connect your wallet to create your first stablecoin</p>
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Create Your Own Stablecoin</h3>
                                <p className="text-gray-400 mb-4">Launch your own stablecoin backed by Stablebonds</p>
                                <button
                                    onClick={() => navigate('/create')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;