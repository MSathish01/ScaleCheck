import React, { useState } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceAssistantProps {
  textToSpeak: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ textToSpeak }) => {
  const { i18n } = useTranslation();
  const [speaking, setSpeaking] = useState<boolean>(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Voice synthesis is not supported on this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Pick appropriate voice code
    if (i18n.language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (i18n.language === 'ta') {
      utterance.lang = 'ta-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      title="Audio Voice Assist (Speech Synthesis for Accessibility)"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
        speaking
          ? 'bg-amber-500 text-white animate-pulse'
          : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
      }`}
    >
      {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{speaking ? 'Stop Voice' : 'Voice Assist'}</span>
    </button>
  );
};
