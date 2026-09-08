import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'ScaleCheck',
      appSubtitle: 'National Legal Metrology Verification System',
      docaHeader: 'Ministry of Consumer Affairs, Food & Public Distribution | Government of India',
      nav: {
        verify: 'Public QR Verify',
        dashboard: 'Dashboard',
        instruments: 'Instruments',
        applications: 'Applications',
        inspections: 'Inspections',
        certificates: 'Certificates',
        ledger: 'Audit Ledger',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      roles: {
        TRADER: 'Trader / Instrument Owner',
        LMO: 'Legal Metrology Officer',
        GATC: 'Approved Test Centre',
        STATE_ADMIN: 'State Administrator',
        CENTRAL_ADMIN: 'Central Administrator (DoCA)'
      },
      verifyPage: {
        title: 'Crowd-Verify Legal Metrology Certificate',
        subtitle: 'Instantly verify the cryptographic authenticity and validity of any weighing/measuring instrument stamped in India.',
        inputPlaceholder: 'Enter Certificate No. (e.g. DOCA-PY-2026-00101)',
        verifyBtn: 'Verify Authenticity',
        authenticBadge: 'AUTHENTIC & CRYPTOGRAPHICALLY SEALED',
        counterfeitBadge: 'INVALID OR COUNTERFEIT CERTIFICATE',
        certDetails: 'Certificate Specifications',
        instrumentDetails: 'Instrument Details',
        stampingRecord: 'Official Stamping Record',
        issuingOfficer: 'Issuing Officer',
        downloadPdf: 'Download Official PDF Certificate',
        daysLeft: 'days validity remaining'
      },
      wear: {
        optimal: 'Nominal Drift Envelope',
        moderate: 'Moderate Wear Warning',
        high: 'High Wear Risk',
        critical: 'Critical Wear Warning — Early Reverification Advised'
      },
      incentive: {
        banner: 'Early-Renewal Priority Incentive',
        desc: 'Renew before statutory expiry to secure fee concessions and priority queue scheduling.'
      }
    }
  },
  hi: {
    translation: {
      appName: 'स्केलचेक (ScaleCheck)',
      appSubtitle: 'राष्ट्रीय विधिक मापविज्ञान सत्यापन प्रणाली',
      docaHeader: 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय | भारत सरकार',
      nav: {
        verify: 'सार्वजनिक क्यूआर सत्यापन',
        dashboard: 'डैशबोर्ड',
        instruments: 'माप उपकरण',
        applications: 'सत्यापन आवेदन',
        inspections: 'निरीक्षण',
        certificates: 'प्रमाणपत्र',
        ledger: 'ऑडिट लेज़र',
        login: 'लॉग इन',
        register: 'पंजीकरण',
        logout: 'लॉग आउट'
      },
      roles: {
        TRADER: 'व्यापारी / उपकरण स्वामी',
        LMO: 'विधिक मापविज्ञान अधिकारी (LMO)',
        GATC: 'अनुमोदित परीक्षण केंद्र (GATC)',
        STATE_ADMIN: 'राज्य नियंत्रक / व्यवस्थापक',
        CENTRAL_ADMIN: 'केंद्रीय प्रशासक (DoCA)'
      },
      verifyPage: {
        title: 'विधिक मापविज्ञान प्रमाणपत्र का सार्वजनिक सत्यापन',
        subtitle: 'भारत में मुहरबंद किसी भी वजन/माप उपकरण की प्रामाणिकता और वैधता की तुरंत जांच करें।',
        inputPlaceholder: 'प्रमाणपत्र संख्या दर्ज करें (उदा. DOCA-PY-2026-00101)',
        verifyBtn: 'सत्यापन करें',
        authenticBadge: 'प्रमाणिक एवं डिजिटल रूप से सीलबंद',
        counterfeitBadge: 'अमान्य या जाली प्रमाणपत्र',
        certDetails: 'प्रमाणपत्र विवरण',
        instrumentDetails: 'उपकरण विनिर्देश',
        stampingRecord: 'आधिकारिक मुहर रिकॉर्ड',
        issuingOfficer: 'जारीकर्ता अधिकारी',
        downloadPdf: 'आधिकारिक पीडीएफ प्रमाणपत्र डाउनलोड करें',
        daysLeft: 'दिनों की वैधता शेष है'
      },
      wear: {
        optimal: 'सुरक्षित परिचालन सीमा',
        moderate: 'मध्यम घिसाव चेतावनी',
        high: 'उच्च घिसाव जोखिम',
        critical: 'गंभीर चेतावनी — शीघ्र पुनर्सत्यापन की सलाह'
      },
      incentive: {
        banner: 'समय-पूर्व नवीनीकरण प्रोत्साहन',
        desc: 'शुल्क छूट और प्राथमिकता शेड्यूलिंग प्राप्त करने के लिए वैधता समाप्त होने से पहले नवीनीकरण करें।'
      }
    }
  },
  ta: {
    translation: {
      appName: 'ஸ்கேல்செக் (ScaleCheck)',
      appSubtitle: 'தேசிய சட்ட அளவியல் சரிபார்ப்பு அமைப்பு',
      docaHeader: 'நுகர்வோர் விவகாரங்கள், உணவு மற்றும் பொது விநியோக அமைச்சகம் | இந்திய அரசு',
      nav: {
        verify: 'பொது QR சரிபார்ப்பு',
        dashboard: 'டாஷ்போர்டு',
        instruments: 'அளவீட்டு கருவிகள்',
        applications: 'விண்ணப்பங்கள்',
        inspections: 'ஆய்வு பணிகள்',
        certificates: 'சான்றிதழ்கள்',
        ledger: 'லெட்ஜர் பதிவு',
        login: 'உள்நுழைக',
        register: 'பதிவு செய்க',
        logout: 'வெளியேறுக'
      },
      roles: {
        TRADER: 'வணிகர் / கருவி உரிமையாளர்',
        LMO: 'சட்ட அளவியல் அதிகாரி (LMO)',
        GATC: 'அரசு அங்கீகரிக்கப்பட்ட பரிசோதனை மையம்',
        STATE_ADMIN: 'மாநில நிர்வாகி',
        CENTRAL_ADMIN: 'மத்திய நிர்வாகி (DoCA)'
      },
      verifyPage: {
        title: 'சட்ட அளவியல் சான்றிதழ் உடனடி சரிபார்ப்பு',
        subtitle: 'இந்தியாவில் முத்திரையிடப்பட்ட எந்தவொரு எடை/அளவு கருவியின் செல்லுபடியாகும் தன்மையை உடனே சரிபார்க்கவும்.',
        inputPlaceholder: 'சான்றிதழ் எண்ணை உள்ளிடவும் (எ.கா. DOCA-PY-2026-00101)',
        verifyBtn: 'சரிபார்க்கவும்',
        authenticBadge: 'உண்மையானது & டிஜிட்டல் முத்திரையிடப்பட்டது',
        counterfeitBadge: 'செல்லாத அல்லது போலியான சான்றிதழ்',
        certDetails: 'சான்றிதழ் விவரங்கள்',
        instrumentDetails: 'கருவி விவரங்கள்',
        stampingRecord: 'அதிகாரப்பூர்வ முத்திரை பதிவு',
        issuingOfficer: 'வழங்கிய அதிகாரி',
        downloadPdf: 'அசல் PDF சான்றிதழைப் பதிவிறக்கவும்',
        daysLeft: 'நாட்கள் செல்லுபடியாகும்'
      },
      wear: {
        optimal: 'பாதுகாப்பான துல்லியம்',
        moderate: 'மிதமான தேய்மானம் எச்சரிக்கை',
        high: 'அதிக தேய்மான ஆபத்து',
        critical: 'முக்கிய எச்சரிக்கை — முன்கூட்டியே புதுப்பிக்க பரிந்துரைக்கப்படுகிறது'
      },
      incentive: {
        banner: 'முன்கூட்டியே புதுப்பித்தல் சலுகை',
        desc: 'கட்டண சலுகை மற்றும் முன்னுரிமை பெற காலாவதி ஆவதற்கு முன்பே விண்ணப்பிக்கவும்.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
