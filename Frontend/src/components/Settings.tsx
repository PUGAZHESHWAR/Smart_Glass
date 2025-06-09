import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { setProfile } from '../api/settings';

const Settings: React.FC = () => {
  const { institutionName: currentName, logoUrl: currentLogo, refreshProfile } = useProfile();
  const [institutionName, setInstitutionName] = useState(currentName);
  const [logoUrl, setLogoUrl] = useState(currentLogo);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ipCameraUrl, setIpCameraUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string }>({});
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    setInstitutionName(currentName);
    setLogoUrl(currentLogo);
  }, [currentName, currentLogo]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({});
    
    try {
      const formData = new FormData();
      formData.append('institution_name', institutionName);
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      await setProfile(formData);
      await refreshProfile();
      setSaveStatus({ success: true, message: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus({ success: false, message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      {saveStatus.message && (
        <div className={`mb-4 p-3 rounded ${saveStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {saveStatus.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Institution Name</label>
          <input
            type="text"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            className={`w-full p-2 rounded border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block mb-2">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className={`w-full p-2 rounded border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Institution logo"
              className="mt-2 h-20 w-auto object-contain"
            />
          )}
        </div>

        <div>
          <label className="block mb-2">IP Camera URL</label>
          <input
            type="text"
            value={ipCameraUrl}
            onChange={(e) => setIpCameraUrl(e.target.value)}
            placeholder="e.g., rtsp://your-camera-ip"
            className={`w-full p-2 rounded border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3">Dark Mode</span>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;