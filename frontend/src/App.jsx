import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Sidebar, { MobileTopBar } from './components/Layout/Sidebar';

const LoadingScreen = () => (
  <div className="flex-center" style={{ minHeight: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '52px', height: '52px',
        background: 'var(--gradient-primary)',
        borderRadius: 'var(--radius-xl)',
        margin: '0 auto 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm.75 16.5v1.25a.75.75 0 0 1-1.5 0V17.5A3.75 3.75 0 0 1 8.5 14h.75a3 3 0 0 0 3 3 3 3 0 0 0 0-6 4.5 4.5 0 0 1 0-9V.75a.75.75 0 0 1 1.5 0V2a3.75 3.75 0 0 1 3.25 3.75h-.75A3 3 0 0 0 12 3a3 3 0 0 0 0 6 4.5 4.5 0 0 1 0 9v-.5z" />
        </svg>
      </div>
      <div className="loading-skeleton" style={{ width: '120px', height: '8px', margin: '0 auto', borderRadius: '4px' }} />
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <MobileTopBar onMenuOpen={() => setMobileMenuOpen(true)} />
      <main
        className="app-content"
        style={{ marginLeft: sidebarCollapsed ? '68px' : '240px' }}
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
