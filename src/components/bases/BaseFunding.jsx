import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { Button } from '../common/Button';

export function BaseFunding({ base, isOwner, isMember }) {
  const progress = (base.current_funding / base.funding_goal) * 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-100 rounded-lg p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Funding Goal</h2>
            <p className="text-gray-400">Support this base's mission and development</p>
          </div>
          <div className="text-2xl font-bold text-white">
            {base.current_funding} / {base.funding_goal} ETH
          </div>
        </div>

        <div className="relative h-4 bg-dark-200 rounded-full mb-6">
          <div
            className="absolute left-0 top-0 h-full bg-primary-500 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-400">
            <span className="font-semibold text-white">{base.backers || 0}</span> backers
          </div>
          <Button>
            <Wallet className="w-4 h-4 mr-2" />
            Fund this Base
          </Button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <div className="bg-dark-100 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {base.transactions?.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-dark-200 overflow-hidden">
                  <img
                    src={tx.from.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${tx.from.address}`}
                    alt={tx.from.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-white font-medium">{tx.from.username}</div>
                  <div className="text-sm text-gray-400">{tx.timestamp}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{tx.amount} ETH</span>
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}