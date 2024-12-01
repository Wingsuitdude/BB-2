import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '../common/Button';
import { getBaseApplications, updateApplicationStatus } from '../../lib/supabase/applications';
import { truncateAddress } from '../../lib/utils/formatters';

export function BaseApplications({ baseId }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getBaseApplications(baseId);
        setApplications(data);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [baseId]);

  const handleUpdateStatus = async (application, status) => {
    setProcessingIds(prev => new Set(prev).add(application.id));
    try {
      await updateApplicationStatus(
        application.id,
        status,
        baseId,
        application.applicant_id
      );
      setApplications(prev => prev.filter(app => app.id !== application.id));
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(application.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No pending applications
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div
          key={application.id}
          className="bg-dark-100 rounded-lg p-6 border border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-dark-200 overflow-hidden">
                <img
                  src={application.applicant.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${application.applicant.address}`}
                  alt={application.applicant.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-white">
                    {application.applicant.username || truncateAddress(application.applicant.address)}
                  </h3>
                  {application.applicant.verified && (
                    <Shield className="w-4 h-4 ml-1 text-primary-400" />
                  )}
                </div>
                {application.applicant.headline && (
                  <p className="text-sm text-gray-400 mb-2">{application.applicant.headline}</p>
                )}
                {application.applicant.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {application.applicant.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {application.message && (
                  <p className="mt-4 text-gray-400">{application.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleUpdateStatus(application, 'accepted')}
                isLoading={processingIds.has(application.id)}
                disabled={processingIds.has(application.id)}
                className="px-3 py-2"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => handleUpdateStatus(application, 'rejected')}
                isLoading={processingIds.has(application.id)}
                disabled={processingIds.has(application.id)}
                className="px-3 py-2"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}