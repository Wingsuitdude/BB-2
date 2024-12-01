import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import { updateBase, deleteBase } from '../../lib/supabase/bases';

export function BaseManageModal({ base, onClose, onUpdate }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: base.name,
    description: base.description,
    type: base.type,
    skills: base.skills.join(', '),
    requirements: base.requirements.join('\n'),
    funding_goal: base.funding_goal || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean),
        funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : null
      };

      const updatedBase = await updateBase(base.id, updates);
      if (updatedBase) {
        onUpdate(updatedBase);
        onClose();
      }
    } catch (error) {
      console.error('Error updating base:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const success = await deleteBase(base.id);
      if (success) {
        navigate('/bases');
      }
    } catch (error) {
      console.error('Error deleting base:', error);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Base</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {showDelete ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-red-400">
              <AlertTriangle className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Delete Base</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete this base? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isSubmitting}
              >
                Delete Base
              </Button>
            </div>
          </div>
        ) : (
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
                rows={4}
                className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
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
                rows={3}
                className="w-full bg-dark-200 border border-gray-800 rounded-lg py-2 px-4 text-gray-300 focus:outline-none focus:border-primary-500"
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
              />
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDelete(true)}
                disabled={isSubmitting}
              >
                Delete Base
              </Button>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !formData.name || !formData.description}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}