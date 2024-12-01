import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { createBase } from '../lib/supabase/bases';

export function CreateBasePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team',
    skills: '',
    requirements: '',
    funding_goal: '',
    verified: false,
    creator_id: profile?.id
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      const baseData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean),
        funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : null,
        verified: false,
        creator_id: profile.id
      };

      const newBase = await createBase(baseData);
      if (newBase?.id) {
        navigate(`/bases/${newBase.id}`);
      }
    } catch (error) {
      console.error('Error creating base:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value
    }));
  };

  if (!profile?.verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Verification Required</h1>
        <p className="text-gray-400 mb-6">
          You need to verify your profile before creating a Base of Operation.
        </p>
        <Button onClick={() => navigate('/profile/' + profile?.address)}>
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-100 rounded-lg p-8 border border-gray-800"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Create New Base</h1>
        <p className="text-gray-400 mb-8">Launch your decentralized organization or solo builder profile</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
              placeholder="Enter base name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
              placeholder="Describe your base's mission and goals"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="solo"
                  checked={formData.type === 'solo'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-300">Solo Builder</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="team"
                  checked={formData.type === 'team'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-300">Team/Organization</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
              placeholder="e.g., React, Solidity, TypeScript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Requirements (one per line)
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
              placeholder="List your requirements, one per line"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Funding Goal (ETH)
            </label>
            <input
              type="number"
              name="funding_goal"
              value={formData.funding_goal}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
              placeholder="Enter funding goal in ETH (optional)"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/bases')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting || !formData.name || !formData.description}
            >
              Create Base
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}