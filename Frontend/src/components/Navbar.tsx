import React from 'react';
import { Camera, UserPlus, UserCheck, Settings as SettingsIcon } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { institutionName, logoUrl } = useProfile();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Institution Logo" 
                className="h-10 w-10 object-contain rounded-full border-2 border-white"
              />
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold">{institutionName || 'FaceID System'}</span>
              <span className="text-xs opacity-80">Smart Recognition System</span>
            </div>
          </div>
          
          {/* Rest of your Navbar code remains the same */}
          <div className="hidden md:flex space-x-1">
            <NavButton 
              active={activeTab === 'add-student'} 
              onClick={() => setActiveTab('add-student')}
              icon={<UserPlus className="h-4 w-4 mr-2" />}
              text="Add Student"
            />
            <NavButton 
              active={activeTab === 'test'} 
              onClick={() => setActiveTab('test')}
              icon={<Camera className="h-4 w-4 mr-2" />}
              text="Test Camera"
            />
            <NavButton 
              active={activeTab === 'assign'} 
              onClick={() => setActiveTab('assign')}
              icon={<UserCheck className="h-4 w-4 mr-2" />}
              text="Assign Face"
            />
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<SettingsIcon className="h-4 w-4 mr-2" />}
              text="Settings"
            />
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden flex justify-center pb-3">
          <div className="flex space-x-1">
            <NavButton 
              active={activeTab === 'add-student'} 
              onClick={() => setActiveTab('add-student')}
              icon={<UserPlus className="h-4 w-4" />}
              text="Add"
              mobile
            />
            <NavButton 
              active={activeTab === 'test'} 
              onClick={() => setActiveTab('test')}
              icon={<Camera className="h-4 w-4" />}
              text="Test"
              mobile
            />
            <NavButton 
              active={activeTab === 'assign'} 
              onClick={() => setActiveTab('assign')}
              icon={<UserCheck className="h-4 w-4" />}
              text="Assign"
              mobile
            />
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<SettingsIcon className="h-4 w-4" />}
              text="Settings"
              mobile
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  mobile?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, text, mobile }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
        ${active 
          ? 'bg-white text-blue-600 shadow-md' 
          : 'text-white hover:bg-white/20'}
        ${mobile ? 'flex flex-col items-center space-y-1' : 'flex items-center'}
      `}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default Navbar;