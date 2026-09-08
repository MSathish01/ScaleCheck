import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, QrCode, Database, LogOut, User as UserIcon, Globe, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VoiceAssistant } from './VoiceAssistant';
import { LedgerViewerModal } from './LedgerViewerModal';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);

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
      {/* Top Official Government Banner */}
      <header className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            {t('docaHeader')}
          </span>
          <span className="text-slate-500 hidden md:inline">| Legal Metrology Act, 2009</span>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold tracking-tight text-slate-900">
                      Scale<span className="text-blue-700">Check</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      DoCA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                    {t('appSubtitle')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/verify"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 transition border border-blue-200"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>{t('nav.verify')}</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to={getDashboardRoute()}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  {t('nav.dashboard')}
                </Link>
              )}

              <button
                onClick={() => setShowLedgerModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Inspect blockchain-inspired tamper-evident verification ledger"
              >
                <Database className="w-4 h-4 text-slate-500" />
                <span>{t('nav.ledger')}</span>
              </button>
            </div>

            {/* Right Controls: Multilingual, Voice Assist, Auth */}
            <div className="flex items-center gap-2.5">
              {/* Voice Assist Button */}
              <VoiceAssistant textToSpeak={getVoiceContextText()} />

              {/* Language Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded ${
                    i18n.language === 'en' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-2 py-1 rounded ${
                    i18n.language === 'hi' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => changeLanguage('ta')}
                  className={`px-2 py-1 rounded ${
                    i18n.language === 'ta' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              {/* User Authentication Status */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
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
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition shadow-sm"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Ledger Modal */}
      <LedgerViewerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
      />
    </>
  );
};
