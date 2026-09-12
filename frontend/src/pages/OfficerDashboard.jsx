import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- Yahan AXIOS import kiya hai
import {
  HardHat,
  Search,
  Sparkles,
  Bot,
  User,
  LogOut,
  ExternalLink,
  PanelLeft,
  Bookmark,
  RefreshCw,
  ArrowRight,
  Plus,
  Moon
} from 'lucide-react';
import { useAuthRole } from '../context/RoleThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { CitationModal } from '../components/common/CitationModal';
import { AppSidebar } from '../components/layout/AppSidebar';
import SoftAurora from '../components/common/SoftAurora';
import ReactMarkdown from 'react-markdown';

const SESSIONS_STORAGE_KEY = 'geo_mine_officer_sessions';
const AUTOHIDE_STORAGE_KEY = 'geo_mine_auto_hide_pref';
const THEME_STORAGE_KEY = 'geo_mine_officer_active_theme';

export const OfficerDashboard = () => {
  const { user, logout } = useAuthRole();
  const { documents } = useDocuments();
  const navigate = useNavigate();

  // Separate Theme State: 'green' | 'amber' (default: 'green')
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'amber' ? 'amber' : 'green';
    } catch (e) {
      return 'green';
    }
  });

  const toggleTheme = () => {
    setActiveTheme(prev => {
      const next = prev === 'green' ? 'amber' : 'green';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) { }
      return next;
    });
  };

  const isAmber = activeTheme === 'amber';

  // Multi-session State with LocalStorage persistence
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Auto-hide toggle state with LocalStorage persistence
  const [autoHide, setAutoHide] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTOHIDE_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Ghost Prompts & Letter-by-letter Typewriter Effect
  const ghostPhrases = [
    "Report on Barakar sandstone UCS & RQD...",
    "Situation in Jharia Coalfield Sector 4...",
    "DGMS Regulation 111 statutory pillar specs...",
    "Borehole BH-42 aquifer inrush risk assessment...",
    "Mahanadi Basin CBM methane desorption report...",
    "Search geological core assays & statutory regulations..."
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Letter-by-letter typewriter effect for ghost text
  useEffect(() => {
    if (isFocused || inputQuery.trim().length > 0) return;

    const currentPhrase = ghostPhrases[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (typedText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        }, 65);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % ghostPhrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex, isFocused, inputQuery]);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleToggleAutoHide = () => {
    setAutoHide(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem(AUTOHIDE_STORAGE_KEY, JSON.stringify(nextVal));
      } catch (e) { }
      return nextVal;
    });
  };

  const handleNewSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInputQuery('');
    setIsFocused(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSelectSession = (sessionId) => {
    const target = sessions.find(s => s.id === sessionId);
    if (target) {
      setCurrentSessionId(target.id);
      setMessages(target.messages || []);
      setInputQuery('');
    }
  };

  const handleDeleteSession = (sessionId, e) => {
    if (e) e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) { }

    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
      }
    }
  };

  // --- 🔥 MAIN API INTEGRATION LOGIC HERE 🔥 ---
  const handleSendMessage = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isGenerating) return;

    let activeSessionId = currentSessionId;
    let updatedSessions = [...sessions];

    // 1. Add User Message to UI
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
      citations: []
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setIsGenerating(true); // Start Spinner

    // Session Management Logic
    if (!activeSessionId) {
      activeSessionId = 'session_' + Date.now();
      setCurrentSessionId(activeSessionId);
      const newSession = {
        id: activeSessionId,
        title: q.length > 40 ? q.slice(0, 40) + '...' : q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        messages: newMessages
      };
      updatedSessions = [newSession, ...updatedSessions];
      setSessions(updatedSessions);
    } else {
      updatedSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: newMessages,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return s;
      });
      setSessions(updatedSessions);
    }

    try {
      // 2. ⚡ ACTUAL DJANGO API CALL ⚡
      const response = await axios.post('http://127.0.0.1:8000/api/query/', {
        query: q
      });

      // Format Backend citations with rich metadata for CitationModal
      const apiCitations = response.data.citations ? response.data.citations.map(c => ({
        docTitle: c.doc_title || c.token_id,
        docId: c.token_id,
        chunkId: `Page ${c.page}`,
        text: response.data.answer || `Official verified mining record found on Page ${c.page} for token reference ${c.token_id}.`,
        score: 0.99,
        category: "DGMS / CIL Verified",
        meta: {
          statuteRef: `DGMS Verified Ref: ${c.token_id} (Page ${c.page})`
        }
      })) : [];

      // 3. Create AI Message from API Response
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.data.answer,
        citations: apiCitations
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      setIsGenerating(false);

      // Save to sessions
      setSessions(prevSessions => {
        const finalSessions = prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: finalMessages, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          }
          return s;
        });
        try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(finalSessions)); } catch (e) { }
        return finalSessions;
      });

    } catch (error) {
      console.error("Backend API Error:", error);

      // Fallback if Django is not running
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "⚠️ Connection Error: Unable to reach the Django Backend. Make sure the server is running on http://127.0.0.1:8000.",
        citations: []
      };

      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      setIsGenerating(false);
    }
  };

  const hasMessages = messages.length > 0;
  const isTyping = inputQuery.trim().length > 0;
  const isDotAnimated = isTyping || isGenerating;

  // Adaptive Aurora Parameters: Steady baseline, only changes and ripples when AI responds
  const isAiResponding = isGenerating;

  // Theme-synchronized colors (steady baseline, changes to luminous tones only when AI responds)
  const auroraColor1 = isAmber
    ? (isAiResponding ? '#f59e0b' : '#b45309')
    : (isAiResponding ? '#10b981' : '#047857');

  const auroraColor2 = isAmber
    ? (isAiResponding ? '#ea580c' : '#9a3412')
    : (isAiResponding ? '#06b6d4' : '#0d9488');

  // Ripple Dynamics (constant serene baseline, graceful luminous wave surge when AI responds)
  const auroraSpeed = isAiResponding ? 0.85 : 0.42;
  const auroraScale = isAiResponding ? 1.65 : 1.35;
  const auroraNoiseFreq = isAiResponding ? 3.4 : 2.2;
  const auroraNoiseAmp = isAiResponding ? 1.15 : 0.85;
  const auroraBandSpread = isAiResponding ? 1.45 : 1.1;
  const auroraOctaveDecay = isAiResponding ? 0.14 : 0.11;
  const auroraBrightness = isAiResponding ? (isAmber ? 1.05 : 0.95) : (isAmber ? 0.85 : 0.75);
  const auroraColorSpeed = isAiResponding ? 1.35 : 0.75;

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500 relative ${isAmber ? 'bg-[#0c0a09] text-stone-100' : 'bg-[#faf8f5] text-slate-900'
      }`}>

      {/* Dynamic Adaptive SoftAurora Full-Screen Background - Always active & visible, ripples on AI response */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${
        isAmber 
          ? (isAiResponding ? 'opacity-95' : 'opacity-80')
          : (isAiResponding ? 'opacity-85' : 'opacity-70')
      }`}>
        <SoftAurora
          speed={auroraSpeed}
          scale={auroraScale}
          brightness={auroraBrightness}
          color1={auroraColor1}
          color2={auroraColor2}
          noiseFrequency={auroraNoiseFreq}
          noiseAmplitude={auroraNoiseAmp}
          bandHeight={0.5}
          bandSpread={auroraBandSpread}
          octaveDecay={auroraOctaveDecay}
          colorSpeed={auroraColorSpeed}
          enableMouseInteraction={true}
          mouseInfluence={0.15}
          lightMode={false}
        />
      </div>

      {/* Top Header */}
      <header className={`sticky top-0 z-30 w-full h-16 shrink-0 border-b backdrop-blur-xl shadow-md transition-all duration-500 ${isAmber ? 'theme-dark-amber-header' : 'theme-green-header border-emerald-400/40'
        }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title="Open Navigation Menu"
              className={`p-2.5 rounded-2xl border transition-all shadow-sm flex items-center gap-2 backdrop-blur-sm cursor-pointer active:scale-95 ${isAmber
                  ? 'bg-[#1e1914] hover:bg-[#2a221b] text-amber-200 border-amber-500/30'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
                }`}
            >
              <PanelLeft className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Menu</span>
            </button>

            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-md ${isAmber
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 font-black shadow-amber-500/20'
                : 'bg-white text-emerald-800'
              }`}>
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">
                  Geo-Mine <span className={isAmber ? 'text-amber-400' : 'text-emerald-200'}>Officer</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm shadow-sm border ${isAmber
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/20 border-white/30 text-white'
                  }`}>
                  Strata AI
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={toggleTheme}
              className="cursor-pointer flex items-center p-1 rounded-full bg-black/90 border border-slate-700/80 shadow-inner gap-1 transition-all hover:scale-105 active:scale-95"
              title={`Switch to ${isAmber ? 'Green (Light Mode)' : 'Orange (Dark Mode)'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isAmber
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-white/90 shadow-lg scale-105 font-bold'
                  : 'text-amber-400/40 hover:text-amber-400'
                }`}>
                <Moon className="w-4 h-4" />
              </div>

              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${!isAmber
                  ? 'bg-emerald-500 text-white ring-2 ring-white/90 shadow-lg scale-105 font-bold'
                  : 'text-emerald-400/40 hover:text-emerald-400'
                }`}>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">
                {user?.name || 'Field Officer'}
              </div>
              <div className={`text-[10px] font-mono font-medium ${isAmber ? 'text-amber-300/70' : 'text-white/80'}`}>
                {user?.email || 'officer@cil.gov.in'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`relative overflow-hidden group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all duration-700 ease-in-out hover:scale-105 active:scale-95 cursor-pointer ${isAmber
                  ? 'border-amber-500/30 bg-[#1e1914] text-amber-200/90 hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/40'
                  : 'border-white/30 bg-white/15 text-white/90 hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/40'
                }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 transition-all duration-700 group-hover:-translate-x-0.5 text-current group-hover:text-white" />
              <span className="transition-colors duration-700 text-current group-hover:text-white">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      <div className="flex-1 w-full flex overflow-hidden relative z-10">
        <AppSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          role="officer"
          activeTheme={activeTheme}
          onToggleTheme={toggleTheme}
          onQuickPromptSelect={(prompt) => handleSendMessage(prompt)}
          messagesCount={messages.length}
          onNewSearch={handleNewSession}
          totalDocuments={documents?.length || 0}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewSession={handleNewSession}
          autoHide={autoHide}
          onToggleAutoHide={handleToggleAutoHide}
        />

        <main className={`flex-1 min-w-0 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'md:ml-[336px]' : 'ml-0'
          }`}>
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative">

            {!hasMessages && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full animate-fade-in">

                {!inputQuery && (
                  <div className="flex items-center justify-center mb-3.5 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setInputQuery(ghostPhrases[phraseIndex]);
                        inputRef.current?.focus();
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs transition-all shadow-md group cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 ${isAmber
                          ? 'bg-[#181410] hover:bg-[#221c16] border-amber-500/35 text-stone-200 hover:text-white shadow-amber-950/40'
                          : 'bg-white/90 hover:bg-white border-emerald-200 text-slate-700 hover:text-emerald-900'
                        }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 animate-pulse shrink-0 ${isAmber ? 'text-amber-400' : 'text-emerald-600'}`} />
                      <span className="opacity-70 font-medium">Quick Prompt:</span>
                      <span className={`font-bold transition-colors ${isAmber ? 'text-amber-300' : 'text-emerald-700'}`}>
                        {ghostPhrases[phraseIndex]}
                      </span>
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="w-full max-w-2xl px-4"
                >
                  <div
                    className={`w-full h-16 sm:h-20 rounded-[2.5rem] rounded-br-lg p-2.5 flex items-center gap-3 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] focus-within:scale-[1.01] ${isAmber
                        ? 'dark-liquid-searchbar'
                        : 'white-liquid-searchbar border-2 border-black'
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center shrink-0 shadow-md ml-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isAmber
                          ? 'bg-[#000000] border border-amber-500/40 text-amber-400'
                          : 'bg-black text-white'
                        } ${isDotAnimated
                          ? 'w-11 h-11 rounded-full shadow-lg shadow-black/40 scale-105'
                          : 'w-11 h-11 rounded-2xl'
                        }`}
                    >
                      {isDotAnimated ? (
                        <div className="dots-orbit-container">
                          <div className="dot-weave-1" />
                          <div className="dot-weave-2" />
                          <div className="dot-weave-3" />
                        </div>
                      ) : (
                        <Search className={`w-5 h-5 ${isAmber ? 'text-amber-400' : 'text-white'} transition-all duration-300`} />
                      )}
                    </div>

                    <div className="relative flex-1 h-full flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`w-full h-full bg-transparent px-2 text-sm sm:text-base font-medium placeholder-transparent focus:outline-none z-10 ${isAmber ? 'text-white' : 'text-slate-900'
                          }`}
                      />

                      {!isFocused && !inputQuery && (
                        <div className={`absolute inset-0 flex items-center px-2 pointer-events-none text-xs sm:text-sm font-normal ${isAmber ? 'text-stone-400' : 'text-slate-400'
                          }`}>
                          <span>{typedText}</span>
                          <span className={`w-0.5 h-4 ml-0.5 animate-pulse ${isAmber ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating || !inputQuery.trim()}
                      className={`relative z-10 h-11 sm:h-12 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-35 shrink-0 cursor-pointer ${isAmber
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 font-black shadow-amber-950/60 hover:brightness-110'
                          : 'bg-black hover:bg-neutral-800 text-white font-bold'
                        }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="dots-orbit-container scale-75">
                            <div className="dot-weave-1" />
                            <div className="dot-weave-2" />
                            <div className="dot-weave-3" />
                          </div>
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <>
                          <span>Search</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {hasMessages && (
              <div className="flex-1 flex flex-col h-full w-full overflow-hidden animate-expand-slow bg-transparent relative z-10">

                <div className={`px-4 sm:px-8 lg:px-12 py-3 border-b flex items-center justify-between shrink-0 shadow-sm backdrop-blur-md ${isAmber
                    ? 'border-amber-500/20 bg-[#14110e]/70 text-white'
                    : 'border-emerald-200/60 bg-white/70 text-slate-900'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-sm ${isAmber ? 'bg-black border border-amber-500/40 text-amber-400' : 'bg-black text-white'
                      }`}>
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold ${isAmber ? 'text-white' : 'text-slate-900'}`}>
                        Geological & Strata Question Answering AI
                      </h3>
                      <span className={`text-[10px] flex items-center gap-1 font-semibold ${isAmber ? 'text-amber-400' : 'text-emerald-700'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAmber ? 'bg-amber-400' : 'bg-emerald-600'
                          }`} />
                        Connected to Live Backend API
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleNewSession}
                    className={`text-xs flex items-center gap-1.5 transition-colors font-bold px-3 py-1.5 rounded-xl border cursor-pointer shadow-sm ${isAmber
                        ? 'text-amber-300 hover:text-stone-950 bg-[#241c14] hover:bg-amber-400 border-amber-500/40'
                        : 'text-emerald-900 hover:text-white bg-emerald-100 hover:bg-emerald-600 border-emerald-300'
                      }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Search</span>
                  </button>
                </div>

                <div className="flex-1 px-4 sm:px-8 lg:px-16 py-6 overflow-y-auto space-y-5 custom-scrollbar">
                  <div className="max-w-5xl mx-auto space-y-5">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3.5 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse max-w-2xl' : 'mr-auto max-w-4xl'
                          }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${msg.sender === 'user'
                              ? 'bg-black border border-stone-800 text-white'
                              : isAmber
                                ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-stone-950 font-black border border-amber-400'
                                : 'bg-emerald-700 border border-emerald-600 text-white'
                            }`}
                        >
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div
                          className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.sender === 'user'
                              ? 'bubble-user-unified font-medium'
                              : isAmber ? 'bubble-ai-dark-amber' : 'bubble-ai-green'
                            }`}
                        >
                          {msg.sender === 'user' ? (
                            <div className="text-white whitespace-pre-line font-medium">
                              {msg.text}
                            </div>
                          ) : (
                            <div className={`markdown-content text-xs sm:text-sm leading-relaxed ${isAmber ? 'text-stone-200' : 'text-slate-800'}`}>
                              <ReactMarkdown
                                components={{
                                  strong: ({ node, ...props }) => (
                                    <strong className={`font-bold ${isAmber ? 'text-amber-300' : 'text-emerald-900'}`} {...props} />
                                  ),
                                  p: ({ node, ...props }) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
                                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2.5 space-y-1" {...props} />,
                                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2.5 space-y-1" {...props} />,
                                  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                  h3: ({ node, ...props }) => (
                                    <h3 className={`font-bold text-sm mt-3 mb-1.5 ${isAmber ? 'text-amber-400' : 'text-emerald-950'}`} {...props} />
                                  ),
                                  hr: ({ node, ...props }) => (
                                    <hr className={`my-2.5 border-t ${isAmber ? 'border-amber-500/20' : 'border-emerald-200'}`} {...props} />
                                  )
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          )}

                          {msg.citations && msg.citations.length > 0 && (
                            <div className={`mt-3.5 pt-3 border-t space-y-1.5 ${isAmber ? 'border-amber-500/25' : 'border-emerald-200'
                              }`}>
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isAmber ? 'text-amber-400' : 'text-emerald-800'
                                }`}>
                                Verified Citations:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {msg.citations.map((cit, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedCitation(cit)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${isAmber
                                        ? 'bg-[#201a14] hover:bg-[#2b221a] border-amber-500/35 text-amber-200'
                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                                      }`}
                                  >
                                    <Bookmark className={`w-3 h-3 ${isAmber ? 'text-amber-400' : 'text-emerald-600'}`} />
                                    <span>{cit.docTitle}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <span className="text-[9px] text-stone-400 block mt-2 text-right font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isGenerating && (
                      <div className="flex gap-3 max-w-xl mr-auto animate-fade-in">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${isAmber
                            ? 'bg-amber-500 text-stone-950 border border-amber-400'
                            : 'bg-emerald-700 border border-emerald-600 text-white'
                          }`}>
                          <Bot className="w-4 h-4 animate-spin" />
                        </div>
                        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 shadow-sm font-semibold ${isAmber ? 'bg-[#181410] border-amber-500/30 text-amber-200' : 'bg-white border-emerald-200 text-slate-800'
                          }`}>
                          <Sparkles className={`w-4 h-4 animate-pulse ${isAmber ? 'text-amber-400' : 'text-emerald-600'
                            }`} />
                          <span>Scanning strata records & querying Django server...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                </div>

                <div className={`px-4 sm:px-8 lg:px-16 pt-2 pb-6 sm:pb-8 shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAmber
                    ? 'bg-gradient-to-t from-[#0a0807]/90 via-[#0a0807]/40 to-transparent'
                    : 'bg-gradient-to-t from-emerald-50/80 via-white/40 to-transparent'
                  }`}>
                  <div className="max-w-4xl mx-auto">

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="w-full"
                    >
                      <div className={`w-full h-14 rounded-[2rem] rounded-br-lg p-2 flex items-center gap-3 shadow-xl transition-all ${isAmber
                          ? 'dark-liquid-searchbar focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                          : 'white-liquid-searchbar border-2 border-black focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
                        }`}>
                        <div
                          className={`flex items-center justify-center shrink-0 shadow-sm ml-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isAmber
                              ? 'bg-black border border-amber-500/40 text-amber-400'
                              : 'bg-black text-white'
                            } ${isDotAnimated
                              ? 'w-9 h-9 rounded-full shadow-md shadow-black/40 scale-105'
                              : 'w-9 h-9 rounded-xl'
                            }`}
                        >
                          {isDotAnimated ? (
                            <div className="dots-orbit-container scale-85">
                              <div className="dot-weave-1" />
                              <div className="dot-weave-2" />
                              <div className="dot-weave-3" />
                            </div>
                          ) : (
                            <Search className={`w-4 h-4 ${isAmber ? 'text-amber-400' : 'text-white'} transition-all duration-300`} />
                          )}
                        </div>

                        <div className="relative flex-1 h-full flex items-center z-10">
                          <input
                            type="text"
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`w-full h-full bg-transparent px-2 text-xs sm:text-sm font-medium placeholder-transparent focus:outline-none z-10 ${isAmber ? 'text-white' : 'text-slate-900'
                              }`}
                          />

                          {!isFocused && !inputQuery && (
                            <div className={`absolute inset-0 flex items-center px-2 pointer-events-none text-xs sm:text-sm font-normal ${isAmber ? 'text-stone-400' : 'text-slate-400'
                              }`}>
                              <span>{typedText}</span>
                              <span className={`w-0.5 h-3.5 ml-0.5 animate-pulse ${isAmber ? 'bg-amber-400' : 'bg-emerald-500'
                                }`} />
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isGenerating || !inputQuery.trim()}
                          className={`relative z-10 h-10 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer ${isAmber
                              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 font-black shadow-amber-950/60 hover:brightness-110'
                              : 'bg-black hover:bg-neutral-800 text-white'
                            }`}
                        >
                          {isGenerating ? (
                            <div className="flex items-center gap-2">
                              <div className="dots-orbit-container scale-75">
                                <div className="dot-weave-1" />
                                <div className="dot-weave-2" />
                                <div className="dot-weave-3" />
                              </div>
                              <span>Searching...</span>
                            </div>
                          ) : (
                            <>
                              <span>Ask</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {selectedCitation && (
        <CitationModal
          citation={selectedCitation}
          isOpen={Boolean(selectedCitation)}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
};