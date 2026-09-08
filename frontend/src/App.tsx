import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { VerifyPortal } from './pages/public/VerifyPortal';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { TraderDashboard } from './pages/trader/TraderDashboard';
import { LmoWorkbench } from './pages/lmo/LmoWorkbench';
import { GatcWorkbench } from './pages/gatc/GatcWorkbench';
import { StateAdminDashboard } from './pages/stateAdmin/StateAdminDashboard';
import { CentralAdminDashboard } from './pages/centralAdmin/CentralAdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500">Checking credentials...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Inter',sans-serif]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/verify" element={<VerifyPortal />} />
              <Route path="/verify/:certId" element={<VerifyPortal />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Role-Protected Portals */}
              <Route
                path="/trader"
                element={
                  <ProtectedRoute allowedRoles={['TRADER']}>
                    <TraderDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/lmo"
                element={
                  <ProtectedRoute allowedRoles={['LMO', 'GATC']}>
                    <LmoWorkbench />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gatc"
                element={
                  <ProtectedRoute allowedRoles={['GATC']}>
                    <GatcWorkbench />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/state-admin"
                element={
                  <ProtectedRoute allowedRoles={['STATE_ADMIN', 'CENTRAL_ADMIN']}>
                    <StateAdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/central-admin"
                element={
                  <ProtectedRoute allowedRoles={['CENTRAL_ADMIN']}>
                    <CentralAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-900 text-xs text-center">
            <div className="max-w-7xl mx-auto px-4 space-y-1">
              <p className="font-medium text-slate-300">
                Department of Consumer Affairs (DoCA) | Ministry of Consumer Affairs, Food & Public Distribution
              </p>
              <p className="text-slate-500 text-[11px]">
                ScaleCheck — Smart Online Verification & Tamper-Proof Certification System | Legal Metrology Act, 2009
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
