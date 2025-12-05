import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';
import { AppDetails } from './pages/AppDetails';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/app/:id" element={<AppDetails />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
};

export default App;
