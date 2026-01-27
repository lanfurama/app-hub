import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';
import { AppDetails } from './pages/AppDetails';
import { CategoryPage } from './pages/CategoryPage';
import { SystemPage } from './pages/SystemPage';
import { LogoutPage } from './pages/LogoutPage';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="ml-64">
            <Header onSearch={setSearchQuery} />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
                <Route path="/app/:id" element={<AppDetails />} />
                <Route path="/category/:categoryId" element={<CategoryPage searchQuery={searchQuery} />} />
                <Route path="/system/:pageId" element={<SystemPage />} />
                <Route path="/logout" element={<LogoutPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </ToastProvider>
    </Router>
  );
};

export default App;
