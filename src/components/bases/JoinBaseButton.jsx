import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../common/Button';
import { applyToBase } from '../../lib/supabase/applications';
import { useAuthStore } from '../../stores/useAuthStore';

export function JoinBaseButton({ baseId }) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      const application = await applyToBase(baseId, profile.id, message);
      if (application) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error applying to base:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <UserPlus className="w-4 h-4 mr-2" />
        Apply to Join
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-100 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Apply to Join Base</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you'd like to join..."
                  className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[120px] focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}