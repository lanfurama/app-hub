import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AppDetails } from './pages/AppDetails';
import { NewApp } from './pages/NewApp';
import { EditApp } from './pages/EditApp';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewApp />} />
            <Route path="/app/:id" element={<AppDetails />} />
            <Route path="/app/:id/edit" element={<EditApp />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
