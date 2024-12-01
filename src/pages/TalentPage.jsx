import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../components/common/Button';
import { TalentCard } from '../components/talent/TalentCard';
import { getAllProfiles } from '../lib/supabase/profiles';

export function TalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await getAllProfiles();
        setProfiles(data);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.username?.toLowerCase().includes(searchLower) ||
      profile.headline?.toLowerCase().includes(searchLower) ||
      profile.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      profile.location?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Find Talent</h1>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by skill, location, or expertise..."
            className="w-full bg-dark-100 border border-gray-800 rounded-lg py-2 px-10 text-gray-300 focus:outline-none focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="space-y-6">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile, index) => (
            <TalentCard key={profile.id} profile={profile} index={index} />
          ))
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>No profiles found matching your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}