import React from 'react';
import { motion } from 'framer-motion';
import { BaseCard } from './BaseCard';

export function BasesList({ bases }) {
  if (bases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No bases found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {bases.map((base, index) => (
        <motion.div
          key={base.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <BaseCard base={base} />
        </motion.div>
      ))}
    </div>
  );
}