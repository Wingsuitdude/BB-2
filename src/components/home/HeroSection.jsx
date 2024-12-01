import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';
import { SpaceBackground } from '../layout/SpaceBackground';

export function HeroSection() {
  return (
    <section className="relative text-center mb-16 min-h-[80vh] flex items-center">
      <SpaceBackground />

      {/* Content */}
      <div className="relative z-10 w-full pt-20 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-12">
            <Logo size={160} className="mx-auto mb-8" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="animate-gradient-text">Are you based?</span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Connect, Build, and Earn in the largest on-chain ecosystem
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Connect",
                description: "Join a community of creators"
              },
              {
                title: "Build",
                description: "Collaborate on projects"
              },
              {
                title: "Earn",
                description: "Get rewarded"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-dark-200/40 backdrop-blur-sm border border-primary-500/20 rounded-xl p-6 hover:bg-dark-200/60 transition-all hover:scale-105 hover:border-primary-500/40 text-center"
              >
                <h3 className="text-2xl font-bold text-primary-400 mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}