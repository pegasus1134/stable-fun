// src/views/MintView.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/useStore';

const MintView = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const { connected } = useWallet();
    const { toast } = useToast();
    const {
        getStablecoinBySymbol,
        mintTokens,
        loading,
        userBalances
    } = useStore();

    const [amount, setAmount] = useState('');
    const coin = getStablecoinBySymbol(symbol!);

    useEffect(() => {
        if (!coin) {
            navigate('/');
        }
    }, [coin, navigate]);

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connected || !coin) return;

        try {
            await mintTokens(coin.address, parseFloat(amount));
            toast({
                title: "Success",
                description: `Minted ${amount} ${coin.symbol} successfully!`,
            });
            setAmount('');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    if (!coin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const stablebondRequired = parseFloat(amount || '0') * coin.stablebondRequired;
    const userBalance = userBalances[coin.address] || 0;

    return (
        <div className="max-w-lg mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-slate-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Mint {coin.name} ({coin.symbol})
                    </h2>

                    {!connected ? (
                        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <Info className="h-4 w-4 text-blue-400 mr-2" />
                                <p className="text-blue-100">
                                    Please connect your wallet to mint tokens.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleMint} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount to Mint
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">{coin.symbol}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Current Price</span>
                                    <span className="text-white font-medium">
                                        ${coin.price.toFixed(2)} {coin.targetCurrency}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Stablebond Required</span>
                                    <span className="text-white font-medium">
                                        {stablebondRequired.toFixed(2)} BOND
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Your Balance</span>
                                    <span className="text-white font-medium">
                                        {userBalance.toFixed(2)} {coin.symbol}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount || parseFloat(amount) <= 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Minting...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        Mint Tokens
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MintView;