import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Users, Building2, Wallet2 } from 'lucide-react';
import { getSystemStats } from '../lib/supabase/stats';

export function RewardsPage() {
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    totalBases: 0,
    ethPool: 0,
    basesHolders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Verified Users",
      value: stats.verifiedUsers.toString(),
      icon: Users,
      change: null
    },
    {
      title: "ETH Pool",
      value: `${stats.ethPool} ETH`,
      icon: Wallet2,
      change: null
    },
    {
      title: "Active Bases",
      value: stats.totalBases.toString(),
      icon: Building2,
      change: null
    },
    {
      title: "BASES Holders",
      value: stats.basesHolders.toString(),
      icon: Coins,
      change: null
    }
  ];

  const growthData = [
    { date: new Date().toISOString(), users: stats.verifiedUsers, bases: stats.totalBases, holders: stats.basesHolders }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Rewards Dashboard</h1>
        <div className="flex items-center bg-primary-500/10 text-primary-400 px-4 py-2 rounded-lg">
          <span>Next Reward: Coming Soon</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-100 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-500/10 p-2 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-400" />
              </div>
              {stat.change && (
                <span className="text-green-400 text-sm">{stat.change}</span>
              )}
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-100 rounded-lg p-6 border border-gray-800"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Growth Metrics</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis 
                dataKey="date" 
                stroke="#718096"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#718096" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a202c',
                  border: '1px solid #2d3748',
                  borderRadius: '0.5rem'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="Verified Users"
                stroke="#0066ff"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="bases" 
                name="Active Bases"
                stroke="#00ff88"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="holders" 
                name="BASES Holders"
                stroke="#ff0066"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}