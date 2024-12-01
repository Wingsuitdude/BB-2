import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { updateProfile } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

export function ProfileEdit({ onClose }) {
  const { profile, setProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    github: profile?.github || '',
    twitter: profile?.twitter || '',
    linkedin: profile?.linkedin || '',
    skills: profile?.skills?.join(', ') || '',
    available_for_work: profile?.available_for_work || false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateProfile(profile.address, {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      });
      if (updatedProfile) {
        setProfile(updatedProfile);
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-100 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="available_for_work"
              checked={formData.available_for_work}
              onChange={handleChange}
              className="h-4 w-4 text-primary-500 rounded border-gray-700 bg-dark-200"
            />
            <label className="ml-2 text-sm text-gray-300">
              Available for work
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}