import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/settings';

interface ProfileContextType {
  institutionName: string;
  logoUrl: string;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  institutionName: '',
  logoUrl: '',
  refreshProfile: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [institutionName, setInstitutionName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setInstitutionName(profile.institution_name);
      setLogoUrl(profile.logo_url || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ institutionName, logoUrl, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
