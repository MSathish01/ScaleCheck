import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data.data;
      login(token, user);

      // Route to appropriate role dashboard
      switch (user.role) {
        case 'TRADER': navigate('/trader'); break;
        case 'LMO': navigate('/lmo'); break;
        case 'GATC': navigate('/gatc'); break;
        case 'STATE_ADMIN': navigate('/state-admin'); break;
        case 'CENTRAL_ADMIN': navigate('/central-admin'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-200">
      <div className="max-w-md w-full space-y-6">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ScaleCheck Portal Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Secure authentication for Traders, Legal Metrology Officers & Admins
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. lmo.puducherry@gov.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials for Evaluators */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Demo Credentials:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('lmo.puducherry@gov.in', 'Officer@123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-bold text-slate-800">LMO Inspector</div>
                <div className="text-[10px] text-slate-500">Puducherry Zone</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('trader.petrol@puducherry.in', 'Trader@123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-bold text-slate-800">Trader (Petrol)</div>
                <div className="text-[10px] text-slate-500">Fuel Dispenser</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('doca.admin@nic.in', 'Admin@123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-bold text-slate-800">Central Admin</div>
                <div className="text-[10px] text-slate-500">DoCA National HQ</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('gatc.south@testlab.org', 'Gatc@123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-bold text-slate-800">GATC Test Centre</div>
                <div className="text-[10px] text-slate-500">Puducherry Lab</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-900 hover:underline">
              Register New Stakeholder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
