import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Settings } from 'lucide-react';
import { Button } from '../components/common/Button';
import { BaseMembers } from '../components/bases/BaseMembers';
import { BaseApplications } from '../components/bases/BaseApplications';
import { BaseFunding } from '../components/bases/BaseFunding';
import { BaseProjects } from '../components/bases/BaseProjects';
import { JoinBaseButton } from '../components/bases/JoinBaseButton';
import { BaseManageModal } from '../components/bases/BaseManageModal';
import { useAuthStore } from '../stores/useAuthStore';
import { getBaseById } from '../lib/supabase/bases';
import { truncateAddress } from '../lib/utils/formatters';

export function BaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [base, setBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showManageModal, setShowManageModal] = useState(false);
  const { profile } = useAuthStore();

  useEffect(() => {
    const loadBase = async () => {
      try {
        const data = await getBaseById(id);
        if (!data) {
          navigate('/bases');
          return;
        }
        setBase(data);
      } catch (error) {
        console.error('Error fetching base:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBase();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!base) return null;

  const isOwner = profile?.id === base.creator.id;
  const isMember = base.members?.some(member => member.id === profile?.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'projects', label: 'Projects' },
    { id: 'funding', label: 'Funding' },
    ...(isOwner ? [{ id: 'applications', label: 'Applications' }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-dark-100 rounded-lg p-6 border border-gray-800 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-white">{base.name}</h1>
              {base.verified && <Shield className="w-6 h-6 text-primary-400" />}
            </div>
            <p className="text-gray-400 max-w-3xl">{base.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            {isOwner ? (
              <Button onClick={() => setShowManageModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Base
              </Button>
            ) : !isMember && (
              <JoinBaseButton baseId={base.id} />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-dark-200 overflow-hidden">
              <img
                src={base.creator.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${base.creator.address}`}
                alt={base.creator.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Created by </span>
              <span className="text-primary-400">
                {base.creator.username || truncateAddress(base.creator.address)}
              </span>
            </div>
          </div>
          {base.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {base.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {base.requirements?.length > 0 && (
              <div className="bg-dark-100 rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {base.requirements.map((req, index) => (
                    <li key={index} className="flex items-start text-gray-400">
                      <span className="text-primary-400 mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <BaseMembers
            members={base.members}
            isOwner={isOwner}
            baseId={base.id}
          />
        )}

        {activeTab === 'projects' && (
          <BaseProjects
            baseId={base.id}
            isOwner={isOwner}
            isMember={isMember}
          />
        )}

        {activeTab === 'funding' && (
          <BaseFunding
            base={base}
            isOwner={isOwner}
            isMember={isMember}
          />
        )}

        {activeTab === 'applications' && isOwner && (
          <BaseApplications baseId={base.id} />
        )}
      </div>

      {/* Manage Modal */}
      {showManageModal && (
        <BaseManageModal
          base={base}
          onClose={() => setShowManageModal(false)}
          onUpdate={setBase}
        />
      )}
    </div>
  );
}