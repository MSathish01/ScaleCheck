import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  QrCode,
  Database,
  LogOut,
  User as UserIcon,
  Zap,
  ChevronDown,
  Scale,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { VoiceAssistant } from './VoiceAssistant';
import { LedgerViewerModal } from './LedgerViewerModal';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [showDemoMenu, setShowDemoMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'TRADER': return '/trader';
      case 'LMO': return '/lmo';
      case 'GATC': return '/gatc';
      case 'STATE_ADMIN': return '/state-admin';
      case 'CENTRAL_ADMIN': return '/central-admin';
      default: return '/';
    }
  };

  const quickLoginAs = async (email: string, pass: string, roleName: string, route: string) => {
    try {
      setLoggingInRole(roleName);
      const res = await authApi.login({ email, password: pass });
      if (res.data?.data?.token && res.data?.data?.user) {
        login(res.data.data.token, res.data.data.user);
        setShowDemoMenu(false);
        setMobileMenuOpen(false);
        navigate(route);
      }
    } catch (err) {
      console.error('Quick demo login error:', err);
    } finally {
      setLoggingInRole(null);
    }
  };

  const getVoiceContextText = () => {
    if (i18n.language === 'hi') {
      return 'स्केलचेक राष्ट्रीय विधिक मापविज्ञान पोर्टल में आपका स्वागत है। आप क्यूआर कोड स्कैन करके किसी भी उपकरण की प्रामाणिकता की जांच कर सकते हैं, या सत्यापन के लिए नया आवेदन जमा कर सकते हैं।';
    }
    if (i18n.language === 'ta') {
      return 'ஸ்கேல்செக் தேசிய சட்ட அளவியல் தளத்திற்கு வரவேற்கிறோம். க்யூஆர் குறியீட்டை ஸ்கேன் செய்து எடை கருவிகளை சரிபார்க்கலாம் அல்லது மறுசரிபார்ப்புக்கு விண்ணப்பிக்கலாம்.';
    }
    return 'Welcome to ScaleCheck National Legal Metrology portal. Scan any certificate QR code to crowd-verify its authenticity, or submit an online verification application.';
  };

  return (
    <>
      {/* Indian National Tricolor Ribbon */}
      <div className="tricolor-stripe w-full" />

      {/* Top Official Government Banner (Responsive) */}
      <header className="bg-slate-950 text-slate-300 text-[10px] sm:text-[11px] py-1.5 px-3 sm:px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200 tracking-wide truncate">
              {t('docaHeader')}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">Legal Metrology Act, 2009</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px] shrink-0">
            <span className="hidden sm:inline bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              🇮🇳 {currentTime || 'IST'}
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">Cloud Active</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all duration-200 border border-blue-800/40 shrink-0">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-heading">
                      Scale<span className="text-blue-700">Check</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      DoCA
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                    National Legal Metrology Verification System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              <Link
                to="/verify"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900 bg-blue-50/80 hover:bg-blue-100 transition border border-blue-200 shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-700" />
                <span>Public QR Verify</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to={getDashboardRoute()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  My Dashboard
                </Link>
              )}

              <button
                onClick={() => setShowLedgerModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Audit Ledger</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  8 Blocks
                </span>
              </button>
            </div>

            {/* Desktop Right Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Quick Demo Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xs transition transform hover:scale-[1.02]"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Demo Switcher</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showDemoMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Instant Evaluator Logins
                    </div>
                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => quickLoginAs('trader.mandi@chennai.com', 'Trader@123', 'TRADER', '/trader')}
                        disabled={!!loggingInRole}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-amber-50 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-amber-800">🌾 Agro Trader</div>
                          <div className="text-[10px] text-slate-500">S. Ramanathan (Kaveri Mandi)</div>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Launch</span>
                      </button>
                      <button
                        onClick={() => quickLoginAs('lmo.puducherry@gov.in', 'Officer@123', 'LMO', '/lmo')}
                        disabled={!!loggingInRole}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-blue-50 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-800">⚖️ Legal Metrology Officer</div>
                          <div className="text-[10px] text-slate-500">Inspector M. Anbarasan</div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Launch</span>
                      </button>
                      <button
                        onClick={() => quickLoginAs('gatc.south@testlab.org', 'Gatc@123', 'GATC', '/gatc')}
                        disabled={!!loggingInRole}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-purple-50 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-purple-800">🔬 Approved Test Lab (GATC)</div>
                          <div className="text-[10px] text-slate-500">NMCL Calibration Laboratories</div>
                        </div>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">Launch</span>
                      </button>
                      <button
                        onClick={() => quickLoginAs('doca.admin@nic.in', 'Admin@123', 'CENTRAL_ADMIN', '/central-admin')}
                        disabled={!!loggingInRole}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800">🏛️ National Command (DoCA)</div>
                          <div className="text-[10px] text-slate-500">Dr. Rajesh Verma, IAS</div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Launch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Assist Button */}
              <VoiceAssistant textToSpeak={getVoiceContextText()} />

              {/* Language Switcher */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-bold">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition ${
                    i18n.language === 'en' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2 py-1 rounded-lg transition ${
                    i18n.language === 'hi' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('ta')}
                  className={`px-2 py-1 rounded-lg transition ${
                    i18n.language === 'ta' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              {/* User Authentication Status */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-none">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    title="Logout"
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Voice button + Hamburger Button */}
            <div className="flex items-center gap-1.5 md:hidden">
              <VoiceAssistant textToSpeak={getVoiceContextText()} />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {/* Quick Demo Switcher on Mobile */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Instant Evaluator Demo Login</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => quickLoginAs('trader.mandi@chennai.com', 'Trader@123', 'TRADER', '/trader')}
                  className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:bg-amber-100/50 transition"
                >
                  <div className="text-[11px] font-bold text-slate-900">🌾 Trader</div>
                  <div className="text-[9px] text-slate-500">Agro Mandi</div>
                </button>
                <button
                  onClick={() => quickLoginAs('lmo.puducherry@gov.in', 'Officer@123', 'LMO', '/lmo')}
                  className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:bg-amber-100/50 transition"
                >
                  <div className="text-[11px] font-bold text-slate-900">⚖️ LMO Officer</div>
                  <div className="text-[9px] text-slate-500">Inspector</div>
                </button>
                <button
                  onClick={() => quickLoginAs('gatc.south@testlab.org', 'Gatc@123', 'GATC', '/gatc')}
                  className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:bg-amber-100/50 transition"
                >
                  <div className="text-[11px] font-bold text-slate-900">🔬 Test Lab</div>
                  <div className="text-[9px] text-slate-500">GATC Lab</div>
                </button>
                <button
                  onClick={() => quickLoginAs('doca.admin@nic.in', 'Admin@123', 'CENTRAL_ADMIN', '/central-admin')}
                  className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:bg-amber-100/50 transition"
                >
                  <div className="text-[11px] font-bold text-slate-900">🏛️ Admin HQ</div>
                  <div className="text-[9px] text-slate-500">National DoCA</div>
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200"
              >
                <QrCode className="w-4 h-4 text-blue-700" />
                <span>Public QR Verify</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLedgerModal(true);
                }}
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200"
              >
                <Database className="w-4 h-4 text-slate-600" />
                <span>Audit Ledger</span>
              </button>
            </div>

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-slate-500" /> Language:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    i18n.language === 'en' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    i18n.language === 'hi' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('ta')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    i18n.language === 'ta' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Mobile Auth Actions */}
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                  <div className="text-[10px] text-blue-700 font-bold">{user.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="p-1.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-blue-900 text-white font-bold text-xs shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Ledger Modal */}
      <LedgerViewerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
      />
    </>
  );
};
