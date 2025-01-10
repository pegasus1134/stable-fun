// src/views/CreateCoin.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/useStore';

function CreateCoin() {
    const { connected } = useWallet();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { createStablecoin, loading } = useStore();

    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        currency: 'USD',
        description: '',
        icon: '' // new field for icon URL
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connected) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please connect your wallet first.',
            });
            return;
        }

        try {
            const signature = await createStablecoin({
                name: formData.name,
                symbol: formData.symbol,
                currency: formData.currency,
                description: formData.description,
                icon: formData.icon,
            });

            toast({
                title: 'Stablecoin Created',
                description: `Transaction signature: ${signature.slice(0, 8)}...`,
            });

            navigate('/');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Stablecoin</h2>

                {!connected ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">
                            Connect your wallet to create a stablecoin
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Coin Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                                placeholder="e.g., My Stable Dollar"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Symbol
                            </label>
                            <input
                                type="text"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                                placeholder="e.g., MSD"
                                required
                                maxLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Target Currency
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="MXN">MXN - Mexican Peso</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                                rows={3}
                                placeholder="Describe your stablecoin..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Icon URL
                            </label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                                placeholder="https://example.com/icon.png"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    Create Stablecoin
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </div>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CreateCoin;
