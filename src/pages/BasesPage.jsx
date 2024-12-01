import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/common/Button';
import { BasesList } from '../components/bases/BasesList';
import { useAuthStore } from '../stores/useAuthStore';
import { getBases } from '../lib/supabase/bases';

export function BasesPage() {
  const [bases, setBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, solo, team
  const { profile } = useAuthStore();

  useEffect(() => {
    const loadBases = async () => {
      try {
        const data = await getBases();
        setBases(data);
      } catch (error) {
        console.error('Error loading bases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBases();
  }, []);

  const filteredBases = bases.filter(base => {
    const matchesSearch = base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      base.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      base.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === 'all') return matchesSearch;
    return matchesSearch && base.type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bases of Operation</h1>
          <p className="text-gray-400">Discover and join decentralized organizations, guilds, and solo builders</p>
        </div>
        {profile?.verified && (
          <Link to="/bases/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Base
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bases by name, description, or skills..."
            className="w-full bg-dark-100 border border-gray-800 rounded-lg py-2 px-10 text-gray-300 focus:outline-none focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'solo' ? 'primary' : 'secondary'}
            onClick={() => setFilter('solo')}
          >
            Solo Builders
          </Button>
          <Button 
            variant={filter === 'team' ? 'primary' : 'secondary'}
            onClick={() => setFilter('team')}
          >
            Teams
          </Button>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <BasesList bases={filteredBases} />
      )}
    </div>
  );
}