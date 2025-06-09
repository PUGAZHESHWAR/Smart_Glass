import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  institutionName: string;
  logoUrl: string;
}

const Header: React.FC<HeaderProps> = ({ institutionName, logoUrl }) => {
  const { isDarkMode } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${institutionName} logo`}
              className="h-10 w-auto object-contain"
            />
          )}
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {institutionName}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 