import { useState } from 'react';
import Navbar from './components/Navbar';
import AddStudentForm from './components/AddStudentForm';
import TestCamera from './components/TestCamera';
import AssignFace from './components/AssignFace';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('add-student');

  const renderContent = () => {
    switch (activeTab) {
      case 'add-student':
        return <AddStudentForm />;
      case 'test':
        return <TestCamera />;
      case 'assign':
        return <AssignFace />;
      case 'settings':
        return <Settings />; {/* Removed onSave prop */}
      default:
        return <AddStudentForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;