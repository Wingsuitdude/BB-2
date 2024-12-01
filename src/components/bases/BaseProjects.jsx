import React from 'react';
import { motion } from 'framer-motion';
import { Plus, GitBranch, Star, Clock } from 'lucide-react';
import { Button } from '../common/Button';

export function BaseProjects({ baseId, isOwner, isMember }) {
  return (
    <div className="space-y-6">
      {(isOwner || isMember) && (
        <div className="flex justify-end">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Sample projects - replace with real data */}
        {[1, 2, 3].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-100 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sample Project {index + 1}
                </h3>
                <p className="text-gray-400">
                  This is a sample project description. Replace with real project data.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-1" />
                  <span>4</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-1" />
                  <span>12</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>Updated 2 days ago</span>
              </div>
              <Button variant="secondary">View Project</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}