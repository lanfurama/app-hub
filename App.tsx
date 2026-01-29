import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastProvider } from './components/ToastProvider';
import { PageLayout } from './components/PageLayout';
import { AppStoreProvider } from './hooks/useAppStore';
import { CategoriesProvider } from './hooks/useCategories';
import { Dashboard } from './pages/Dashboard';
import { AppDetails } from './pages/AppDetails';
import { CategoryPage } from './pages/CategoryPage';
import { SystemPage } from './pages/SystemPage';
import { LogoutPage } from './pages/LogoutPage';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <Router>
      <ToastProvider>
        <AppStoreProvider>
        <CategoriesProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="ml-0 md:ml-64 transition-[margin] duration-200">
            <Header onSearch={setSearchQuery} onMenuClick={() => setSidebarOpen(true)} />
            <main className="pt-14 sm:pt-16 min-h-screen">
              <Routes>
                <Route element={<PageLayout />}>
                  <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
                  <Route path="/app/:id" element={<AppDetails />} />
                  <Route path="/category/:categoryId" element={<CategoryPage searchQuery={searchQuery} />} />
                  <Route path="/system/:pageId" element={<SystemPage />} />
                  <Route path="/logout" element={<LogoutPage />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
        </CategoriesProvider>
        </AppStoreProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
