import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { uploadImage } from '../../lib/supabase/storage';
import { updateProfile } from '../../lib/supabase/profiles';
import { useAuthStore } from '../../stores/useAuthStore';

export function ImageUpload({ type }) {
  const { profile, setProfile } = useAuthStore();

  const handleUpload = useCallback(async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or WebP image');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image must be smaller than 5MB');
        return;
      }

      const publicUrl = await uploadImage(file, type);
      if (publicUrl) {
        const field = type === 'avatars' ? 'avatar_url' : 'banner_url';
        const updatedProfile = await updateProfile(profile.address, {
          [field]: publicUrl
        });
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, [type, profile?.address, setProfile]);

  return (
    <div className="relative group">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="bg-dark-200/80 hover:bg-dark-200 rounded-full p-1.5 transition-colors cursor-pointer">
        <Upload className="w-3 h-3 text-gray-400 group-hover:text-white" />
      </div>
    </div>
  );
}