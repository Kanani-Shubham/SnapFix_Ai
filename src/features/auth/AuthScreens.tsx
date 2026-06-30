import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, Language } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Camera, Check, Info, Shield, LogOut, Bell, HelpCircle, 
  ChevronRight, Globe, Lock, ArrowRight, BookOpen, MessageSquare 
} from "lucide-react";

interface AuthProps {
  onNavigate: (screenId: string) => void;
}

// 1. Splash Screen
export const SplashScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-between p-8 min-h-[550px] bg-white text-center" id="splash-screen">
      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        {/* Animated Icon */}
        <motion.div 
          initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-24 h-24 bg-[#FFFC00] rounded-3xl flex items-center justify-center shadow-xl shadow-[#FFFC00]/20"
        >
          <Camera className="w-12 h-12 text-black" />
        </motion.div>
        
        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SnapFix <span className="text-[#FFFC00] bg-black px-2 py-0.5 rounded-lg">AI</span></h1>
          <p className="text-slate-550 text-sm font-semibold tracking-wider uppercase mt-2">Snap. Report. Resolve.</p>
        </motion.div>

        <p className="text-xs text-slate-400 max-w-xs mt-4">
          AI-Powered Hyperlocal Community Issue Reporting Platform. Together, we build better cities.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4">
        <button
          onClick={() => onNavigate("onboarding")}
          className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm tracking-wide uppercase"
          id="splash-start-btn"
        >
          Get Started
        </button>
        <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Powered by Gemini AI</span>
      </div>
    </div>
  );
};

// 2. Onboarding Screen (3 slides)
export const OnboardingScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Snap Issues Instantly",
      description: "Capture a photo or video of any local civic issue. Our platform instantly logs details.",
      image: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&q=80&w=300",
    },
    {
      title: "AI Detects & Routes",
      description: "8 specialized AI Agents automatically categorize, assess severity, and route reports directly to municipal teams.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=300",
    },
    {
      title: "Track Community Impact",
      description: "Follow resolution steps live. Unlock custom badges and earn XP to rise on the city leaderboard!",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=300",
    }
  ];

  const handleNext = () => {
    if (slide < 2) {
      setSlide(slide + 1);
    } else {
      onNavigate("login");
    }
  };

  return (
    <div className="flex flex-col justify-between p-6 min-h-[550px] bg-white" id="onboarding-screen">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Onboarding {slide + 1}/3</span>
        <button 
          onClick={() => onNavigate("login")}
          className="text-slate-400 hover:text-black text-xs font-semibold"
          id="onboarding-skip-btn"
        >
          Skip
        </button>
      </div>

      {/* Content Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-6"
        >
          <img 
            src={slides[slide].image} 
            alt={slides[slide].title} 
            className="w-48 h-48 rounded-3xl object-cover mb-8 shadow-md border border-slate-100"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">{slides[slide].title}</h2>
          <p className="text-slate-600 text-sm max-w-xs leading-relaxed">{slides[slide].description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4">
        {/* Dot Indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-350 ${i === slide ? "w-6 bg-black" : "w-2 bg-slate-250"}`} 
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-12 h-12 bg-[#FFFC00] text-black rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-300 active:scale-95 transition-all"
          id="onboarding-next-btn"
          aria-label="Next slide"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// 3. Login / Signup Screen
export const LoginScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onNavigate("stories");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      onNavigate("stories");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between p-6 min-h-[550px] bg-white" id="login-screen">
      <div className="flex flex-col gap-6">
        {/* Header Title */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back! 👋"}
          </h2>
          <p className="text-slate-500 text-xs mt-1.5">Sign in to report civic problems instantly</p>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-semibold leading-relaxed" id="login-error-alert">
            {error}
          </div>
        )}

        {/* Google Authentication FAB Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 border border-slate-200 rounded-full flex items-center justify-center gap-3 font-semibold text-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          id="google-login-btn"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{loading ? "Please wait..." : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          <div className="flex-1 h-[1px] bg-slate-100" />
          <span className="px-3">or</span>
          <div className="flex-1 h-[1px] bg-slate-100" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3.5" id="login-form">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              disabled={loading}
              placeholder="e.g. citizen@snapfix.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-black text-sm disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm tracking-wide mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            id="login-submit-btn"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
          </button>
        </form>
      </div>

      {/* Footer Switcher */}
      <div className="text-center pt-4 border-t border-slate-55">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-black font-medium disabled:opacity-50"
          id="login-switch-btn"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

// 4. Language Selection Screen
export const LanguageSelectionScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const { language, setLanguage } = useApp();

  const langList = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी (Hindi)" },
    { code: "gu", name: "ગુજરાતી (Gujarati)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "bn", name: "বাংলা (Bangla)" }
  ];

  return (
    <div className="flex flex-col justify-between p-6 min-h-[500px] bg-white" id="language-screen">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <Globe className="w-8 h-8 text-[#2196F3] mx-auto mb-2" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select Language</h2>
          <p className="text-slate-500 text-xs mt-1">App UI localized translates automatically</p>
        </div>

        <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 max-h-[250px] overflow-y-auto">
          {langList.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                language === lang.code 
                  ? "bg-[#FFFC00]/15 text-black border border-[#FFFC00]/40" 
                  : "bg-white text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              <span>{lang.name}</span>
              {language === lang.code && <Check className="w-4 h-4 text-black" />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNavigate("stories")}
        className="w-full py-3.5 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm tracking-wide"
        id="language-apply-btn"
      >
        Apply
      </button>
    </div>
  );
};

// 5. Settings Screen
export const SettingsScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const { currentProfile } = useApp();
  const [toggleLocation, setToggleLocation] = useState(true);

  return (
    <div className="flex flex-col gap-5 p-5 min-h-[500px] bg-white" id="settings-screen">
      {/* Profile Header Card */}
      <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <img 
          src={currentProfile.avatar_url} 
          alt={currentProfile.name} 
          className="w-12 h-12 rounded-full object-cover border border-slate-200"
        />
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-base">{currentProfile.name}</h3>
          <p className="text-slate-500 text-xs truncate">{currentProfile.email}</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Preferences</h4>
        
        <button 
          onClick={() => onNavigate("language")}
          className="flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl text-slate-700 transition-colors text-sm"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>App Language</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button 
          onClick={() => onNavigate("notifications")}
          className="flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl text-slate-700 transition-colors text-sm"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Notifications Manager</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Location Toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-sm">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Auto-GPS Geolocation</span>
          </div>
          <button 
            onClick={() => setToggleLocation(!toggleLocation)}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${toggleLocation ? "bg-black" : "bg-slate-200"}`}
            aria-label="Location Toggle"
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${toggleLocation ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Support & Legals</h4>
        
        <button 
          onClick={() => onNavigate("help")}
          className="flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl text-slate-700 transition-colors text-sm"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help & FAQ Center</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-xl text-slate-500 text-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Privacy and Security policy</span>
          </div>
        </div>
      </div>

      {/* Log Out button */}
      <button 
        onClick={() => onNavigate("login")}
        className="w-full mt-2 py-3.5 border border-red-250 text-[#F44336] hover:bg-red-50/40 rounded-full font-bold flex items-center justify-center gap-2 text-sm transition-colors"
        id="settings-logout-btn"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

// 6. Help & Support FAQ Accordion
export const HelpSupportScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I report a civic issue?",
      a: "Simply tap the yellow Camera FAB in the center of the navigation, capture a photo or short video, and our AI pipeline will handle category detection, severity ratings, and routing automatically."
    },
    {
      q: "How does the gamification XP work?",
      a: "Reporting issues gets you +100 XP. Verifying reports submitted by other citizens awards you +20 XP. High impact resolutions tracked successfully yield +250 XP. These points level you up on the city leaderboards!"
    },
    {
      q: "Who assigns departments to my issues?",
      a: "Our Google Gemini-powered Routing Agent maps categories (potholes, streetlights, garbage, etc.) to the respective municipality or board automatically on report submission."
    },
    {
      q: "Does the app support offline mode?",
      a: "Yes! If you report an issue in an area with bad reception, we queue your photo and GPS coordinates in a local database and upload them automatically once you regain connectivity."
    }
  ];

  return (
    <div className="flex flex-col gap-5 p-5 min-h-[500px] bg-white" id="help-screen">
      <div className="text-center">
        <BookOpen className="w-8 h-8 text-[#FF9800] mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Help & Support FAQ</h2>
        <p className="text-slate-500 text-xs mt-1">Get instant guides on how SnapFix AI operates</p>
      </div>

      {/* FAQ list */}
      <div className="flex flex-col gap-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div 
              key={idx} 
              className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50"
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 text-sm hover:bg-slate-100/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-90 text-black" : ""}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100/50 bg-white">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Support Message Bubble */}
      <div className="bg-[#FFF7A6]/20 p-4 rounded-2xl border border-[#FFFC00]/20 flex items-center gap-3 mt-4">
        <MessageSquare className="w-5 h-5 text-black shrink-0" />
        <div>
          <h4 className="font-semibold text-slate-900 text-xs">Need human support?</h4>
          <p className="text-slate-500 text-[10px] mt-0.5">Reach our desk at helpdesk@snapfix.ai</p>
        </div>
      </div>
    </div>
  );
};
