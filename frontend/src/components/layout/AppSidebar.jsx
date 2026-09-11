import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Layers, 
  UploadCloud, 
  FileText, 
  Cpu, 
  Bot, 
  HardHat, 
  ChevronRight, 
  PanelLeft, 
  Sparkles, 
  MessageSquare, 
  Activity, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Pin, 
  Clock, 
  Eye, 
  Search,
  Moon,
  Database,
  FileCode
} from 'lucide-react';

export const AppSidebar = ({ 
  isOpen, 
  setIsOpen, 
  onClose, 
  role = 'officer', 
  activeTab = 'ingestion', 
  onTabChange, 
  onQuickPromptSelect, 
  messagesCount = 0, 
  onNewSearch, 
  totalDocuments = 4, 
  totalVectors = 2840,
  // Multi-session props
  sessions = [],
  currentSessionId = null,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  // Auto-hide props
  autoHide = true,
  onToggleAutoHide,
  // Separate theme props: 'green' | 'amber'
  activeTheme = 'green',
  onToggleTheme
}) => {
  const isAdmin = role === 'admin';
  const closeTimerRef = useRef(null);
  const isChatActive = messagesCount > 0;
  const isAmber = activeTheme === 'amber';

  const openSidebar = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen?.(true);
  };

  const closeSidebar = (delay = 180) => {
    if (!autoHide) return; // Never auto-close if Auto-Hide is OFF (Pinned)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen?.(false);
      onClose?.();
    }, delay);
  };

  // Proximity detector: when cursor approaches within 24px of left edge below header, open sidebar if autoHide is ON
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (autoHide && e.clientX <= 24 && e.clientY >= 64 && !isOpen) {
        openSidebar();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen, autoHide]);

  // 2 Clean Tabs for Admin
  const adminTabs = [
    {
      id: 'ingestion',
      name: 'Tab 1: Data Ingestion & Workbench',
      subtitle: 'Upload Documents & Token Embeddings',
      icon: UploadCloud,
      badge: 'Ingest & Embed'
    },
    {
      id: 'repository',
      name: 'Tab 2: Vector Index & Clusters',
      subtitle: '2D HNSW Topology & Document Store',
      icon: Layers,
      badge: 'Index & Clusters'
    }
  ];

  // Distinct sidebar styling
  const getSidebarStyle = () => {
    if (isAdmin) return 'liquid-glass-admin text-slate-900';
    return isAmber ? 'liquid-glass-dark-amber text-stone-100' : 'liquid-glass-green text-emerald-950';
  };

  // Dynamic floating pill indicator styling
  const getPillStyle = () => {
    if (isAdmin) {
      return 'bg-slate-900/90 text-cyan-300 border-blue-400/40 shadow-blue-500/20';
    }
    return isAmber
      ? 'bg-[#14110e]/95 text-amber-400 border-amber-500/40 shadow-amber-950/50'
      : 'bg-white/95 text-emerald-700 border-emerald-300/80 shadow-emerald-700/15';
  };

  // Specular top shimmer
  const getShimmerStyle = () => {
    if (isAdmin) return 'bg-gradient-to-b from-blue-400/20 via-blue-100/5 to-transparent';
    return isAmber
      ? 'bg-gradient-to-b from-amber-500/15 via-orange-950/10 to-transparent'
      : 'bg-gradient-to-b from-emerald-400/20 via-teal-100/15 to-transparent';
  };

  return (
    <>
      {/* 1. Left-Edge Hover Detection Zone (Sensory Strip) - Starts below header */}
      <div
        onMouseEnter={() => {
          if (autoHide) openSidebar();
        }}
        className="fixed left-0 top-16 bottom-0 w-6 z-30 cursor-pointer pointer-events-auto"
        title={autoHide ? "Hover to open sidebar" : "Sidebar pinned"}
      />

      {/* 2. Floating Edge Pill Indicator - Positioned below header */}
      <div
        onMouseEnter={() => {
          if (autoHide) openSidebar();
        }}
        onClick={() => setIsOpen?.(prev => !prev)}
        className={`fixed left-2.5 top-28 z-30 p-2.5 rounded-2xl shadow-xl transition-all duration-500 cursor-pointer backdrop-blur-xl border ${
          isOpen 
            ? 'opacity-0 pointer-events-none -translate-x-8' 
            : 'opacity-90 hover:opacity-100 translate-x-0 hover:scale-110'
        } ${getPillStyle()}`}
        title="Open Navigation Menu"
      >
        <PanelLeft className="w-4 h-4 animate-pulse" />
      </div>

      {/* 3. Liquid Glass Sidebar Drawer - Positioned strictly below header */}
      <aside
        onMouseEnter={openSidebar}
        onMouseLeave={() => {
          if (autoHide) closeSidebar(180);
        }}
        className={`fixed top-16 bottom-2.5 left-2.5 z-40 w-80 max-h-[calc(100vh-4.75rem)] rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between select-none overflow-hidden ${
          isOpen 
            ? 'translate-x-0 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.25)]' 
            : '-translate-x-[120%] opacity-0 pointer-events-none'
        } ${getSidebarStyle()}`}
      >
        {/* Dynamic Specular Liquid Glass Top Shimmer */}
        <div className={`absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl transition-all duration-500 ${getShimmerStyle()}`} />

        {/* Dynamic Sidebar Header */}
        <div className={`p-4 border-b flex items-center justify-between relative z-10 transition-colors duration-500 ${
          isAdmin 
            ? 'border-blue-200/80 bg-white/70 text-slate-900' 
            : isAmber 
              ? 'border-amber-500/20 bg-[#14110e]/90 text-white' 
              : 'border-emerald-200/80 bg-white/70 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-md transition-all duration-500 ${
                isAdmin
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20'
                  : isAmber
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-stone-950 shadow-amber-500/30 font-extrabold'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/25'
              }`}
            >
              {isAdmin ? (
                <Cpu className="w-5 h-5" />
              ) : isChatActive ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <HardHat className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className={`text-xs font-bold tracking-tight ${isAmber && !isAdmin ? 'text-white' : 'text-slate-900'}`}>
                {isAdmin ? 'Admin Terminal' : 'Geo-Mine Officer'}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono font-bold transition-colors duration-500 ${
                  isAdmin ? 'text-blue-600' : isAmber ? 'text-amber-400' : 'text-emerald-700'
                }`}>
                  {isAdmin ? 'Ingestion & Vector Core' : 'Strata AI Intelligence'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setIsOpen?.(false);
                onClose?.();
              }}
              title="Close Sidebar"
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isAmber && !isAdmin
                  ? 'bg-[#1e1914] hover:bg-[#2a221b] text-stone-300 hover:text-white border-amber-500/30' 
                  : 'bg-white/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 p-3.5 space-y-3 relative z-10 overflow-y-auto custom-scrollbar">

          {/* ADMIN VIEW: 2 Navigation Tabs + Quick Presets + System Metrics */}
          {isAdmin && (
            <div className="space-y-3">
              {/* 1. Main Navigation Tabs (2 Tabs) */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-wider px-1 text-slate-500">
                  Control Modules
                </div>

                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange?.(tab.id);
                        if (autoHide) closeSidebar(80);
                      }}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 transform active:scale-95 group border cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold border-blue-400/50 shadow-md shadow-blue-500/25'
                          : 'bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 border-blue-100/80 shadow-sm'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">
                            {tab.name}
                          </span>
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {tab.subtitle}
                        </p>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* 2. Quick Vectorizing Presets */}
              <div className="p-3 rounded-2xl bg-white/95 border border-blue-200/90 shadow-sm space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    Quick Embed Presets
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                    Workbench
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    "Barakar sandstone UCS & RQD (42.8 MPa)",
                    "DGMS Regulation 111 statutory pillar specs",
                    "Raniganj BH-42 aquifer inrush risk",
                    "Mahanadi Basin CBM methane purity"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onTabChange?.('ingestion');
                        onQuickPromptSelect?.(prompt);
                        if (autoHide) closeSidebar(60);
                      }}
                      className="w-full text-left p-2 rounded-xl text-[11px] font-semibold bg-blue-50/60 hover:bg-blue-100/80 text-blue-950 border border-blue-200/70 transition-all flex items-center justify-between group active:scale-95 cursor-pointer"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. System & Vector Metrics Card */}
              <div className="p-3 rounded-2xl bg-white/95 border border-blue-200/90 shadow-sm space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    HNSW Vector Store
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Online
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200">
                    <span className="text-slate-500 block text-[9px]">Ingested Files</span>
                    <strong className="text-blue-900 font-bold text-xs">{totalDocuments} Docs</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200">
                    <span className="text-slate-500 block text-[9px]">Dense Vectors</span>
                    <strong className="text-blue-900 font-bold text-xs">{totalVectors.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] flex items-center justify-between text-slate-600 font-mono">
                  <span>Dimension / Metric:</span>
                  <strong className="text-blue-700">768-D Cosine</strong>
                </div>
              </div>
            </div>
          )}

          {/* OFFICER VIEW: Multi-Session Tabs & Quick Prompts */}
          {!isAdmin && (
            <div className="space-y-3">
              
              {/* 1. New Session / Search Button */}
              <button
                type="button"
                onClick={() => {
                  if (onNewSession) {
                    onNewSession();
                  } else if (onNewSearch) {
                    onNewSearch();
                  }
                  if (autoHide) closeSidebar(100);
                }}
                className={`w-full p-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  isAmber
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 border-amber-300 shadow-amber-950/60 hover:brightness-110'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-emerald-700/20'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Start New Search / Session</span>
              </button>

              {/* 2. Box A: Saved Multi-Session Tabs (Deep Black Shade 1: #120f0c) */}
              <div className={`p-3 rounded-2xl border shadow-sm space-y-2.5 animate-fade-in ${
                isAmber ? 'bg-[#120f0c] border-amber-500/25' : 'bg-white/95 border-emerald-200/90'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    isAmber ? 'text-amber-400' : 'text-emerald-950'
                  }`}>
                    <Clock className={`w-3.5 h-3.5 ${isAmber ? 'text-amber-500' : 'text-emerald-600'}`} />
                    Chat Sessions
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isAmber 
                      ? 'bg-[#241c14] text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}>
                    {sessions.length} Saved
                  </span>
                </div>

                {sessions.length === 0 ? (
                  <div className={`text-center py-3 px-2 rounded-xl text-[11px] border border-dashed ${
                    isAmber ? 'border-amber-500/20 text-stone-400 bg-[#181410]' : 'border-emerald-200 text-slate-500 bg-emerald-50/40'
                  }`}>
                    No past sessions yet. Start a search to save dialogue.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                    {sessions.map((sess) => {
                      const isActive = currentSessionId === sess.id;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            onSelectSession?.(sess.id);
                            if (autoHide) closeSidebar(100);
                          }}
                          className={`group w-full p-2 rounded-xl text-left text-xs font-semibold border transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer active:scale-98 ${
                            isActive
                              ? isAmber
                                ? 'bg-[#2b2218] border-amber-400 text-amber-200 shadow-sm'
                                : 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-sm'
                              : isAmber
                                ? 'bg-[#1c1813] hover:bg-[#251e17] text-stone-300 hover:text-white border-stone-800/90'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isActive
                                ? isAmber ? 'bg-amber-400 animate-pulse' : 'bg-emerald-600 animate-pulse'
                                : isAmber ? 'bg-stone-700' : 'bg-neutral-300'
                            }`} />
                            <div className="flex-1 truncate">
                              <div className="truncate text-[11px] font-bold">
                                {sess.title || 'Geological Search'}
                              </div>
                              <div className="text-[9px] font-mono opacity-60 flex items-center gap-1.5">
                                <span>{sess.timestamp || 'Recent'}</span>
                                <span>•</span>
                                <span>{(sess.messages || []).length} msgs</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Session Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession?.(sess.id, e);
                            }}
                            title="Delete this session"
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Box B: Quick Query Prompts (Mid Black Shade 2: #16130f) */}
              <div className={`p-3 rounded-2xl border shadow-sm space-y-2.5 animate-fade-in ${
                isAmber ? 'bg-[#16130f] border-amber-500/25' : 'bg-white/95 border-emerald-200/90'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    isAmber ? 'text-amber-400' : 'text-emerald-950'
                  }`}>
                    <Sparkles className={`w-3.5 h-3.5 ${isAmber ? 'text-amber-500' : 'text-emerald-600'}`} />
                    Quick Query Prompts
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isAmber ? 'bg-[#281f16] text-amber-300 border border-amber-500/30' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    Click to Run
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    "Barakar sandstone UCS & RQD",
                    "DGMS Regulation 111 pillar specs",
                    "Raniganj BH-42 aquifer inrush risk",
                    "Mahanadi Basin CBM methane purity"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onQuickPromptSelect?.(prompt);
                        if (autoHide) closeSidebar(60);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center justify-between group active:scale-95 cursor-pointer ${
                        isAmber
                          ? 'bg-[#201a14] hover:bg-[#2c231a] text-amber-100 hover:text-white border-stone-800/90 hover:border-amber-500/40'
                          : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border-emerald-200/80'
                      }`}
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className={`w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1 ${
                        isAmber ? 'text-amber-400' : 'text-emerald-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Box C: Knowledge Base Grounding Status Card (Elevated Black Shade 3: #1a1612) */}
              <div className={`p-3 rounded-2xl border shadow-sm space-y-2 animate-fade-in ${
                isAmber ? 'bg-[#1a1612] border-amber-500/25' : 'bg-white/95 border-emerald-200/90'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    isAmber ? 'text-amber-400' : 'text-emerald-950'
                  }`}>
                    <BookOpen className={`w-3.5 h-3.5 ${isAmber ? 'text-amber-500' : 'text-emerald-600'}`} />
                    Knowledge Corpus
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Verified
                  </span>
                </div>
                <div className="text-[10px] space-y-1">
                  <div className={`p-1.5 rounded-lg flex items-center justify-between ${
                    isAmber ? 'bg-[#241e17] text-amber-200' : 'bg-emerald-50/80 text-emerald-950'
                  }`}>
                    <span>Indexed Geological Sources</span>
                    <strong className="font-bold">
                      {totalDocuments} Documents
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Liquid Glass Footer with Clickable Theme-Adaptive Auto Hide Toggle */}
        <div className={`p-3.5 border-t relative z-10 transition-colors duration-500 ${
          isAdmin 
            ? 'border-blue-200/80 bg-white/80' 
            : isAmber 
              ? 'border-amber-500/20 bg-[#120f0c]/95' 
              : 'border-emerald-200/80 bg-white/80'
        }`}>
          <button
            type="button"
            onClick={onToggleAutoHide}
            className={`w-full p-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 flex items-center justify-between shadow-sm active:scale-95 group cursor-pointer ${
              isAdmin
                ? autoHide
                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-blue-400 text-white shadow-md'
                : autoHide
                  ? isAmber
                    ? 'bg-[#1e1813] hover:bg-[#282018] border-amber-500/30 text-amber-200 shadow-amber-950/30'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
                  : isAmber
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 border-amber-300 shadow-md font-extrabold'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400 text-white shadow-md'
            }`}
            title={`Click to switch Auto-Hide ${autoHide ? 'OFF (Pin Sidebar)' : 'ON (Auto-Hide on Hover)'}`}
          >
            <div className="flex items-center gap-2">
              {autoHide ? (
                <Eye className={`w-4 h-4 animate-pulse ${isAdmin ? 'text-blue-600' : isAmber ? 'text-amber-400' : 'text-emerald-600'}`} />
              ) : (
                <Pin className={`w-4 h-4 ${isAdmin ? 'text-white' : isAmber ? 'text-stone-950' : 'text-white'}`} />
              )}
              <span className="text-xs font-bold">
                Auto Hide: <span className="uppercase">{autoHide ? 'ON' : 'OFF'}</span>
              </span>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
              autoHide
                ? isAdmin 
                  ? 'bg-blue-200/90 text-blue-950 border border-blue-300'
                  : isAmber
                    ? 'bg-[#2b2118] text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-200/90 text-emerald-950 border border-emerald-300'
                : isAdmin || !isAmber
                  ? 'bg-white/25 text-white border border-white/30'
                  : 'bg-stone-950/20 text-stone-950 font-black'
            }`}>
              {autoHide ? 'Hover Mode' : 'Pinned'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
