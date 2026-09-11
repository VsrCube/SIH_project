import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Database, 
  UploadCloud, 
  Layers, 
  FileText, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Search, 
  LogOut, 
  Zap,
  Activity,
  FileCode,
  PanelLeft,
  FolderOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Sliders,
  Check
} from 'lucide-react';
import { useAuthRole } from '../context/RoleThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { AppSidebar } from '../components/layout/AppSidebar';

export const AdminDashboard = () => {
  const { user, logout } = useAuthRole();
  const { 
    filteredDocuments, 
    totalVectors, 
    totalDocuments, 
    uploadProgress, 
    activeFilter, 
    setActiveFilter, 
    searchQuery, 
    setSearchQuery,
    uploadAndVectorizeDocument,
    deleteDocument,
    reindexDocument
  } = useDocuments();

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ingestion'); // 'ingestion' | 'repository'
  const [rawText, setRawText] = useState('Barakar sandstone exhibits 42.8 MPa unconfined compressive strength with 78% RQD across Sector 4 Jharia Coalfield.');
  const [vectorizedOutput, setVectorizerOutput] = useState(null);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [autoHide, setAutoHide] = useState(true);
  const [reindexingDocId, setReindexingDocId] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadAndVectorizeDocument(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateCustomVector = () => {
    if (!rawText.trim()) return;
    setIsVectorizing(true);
    setVectorizerOutput(null);

    setTimeout(() => {
      // 768-D simulated normalized dense vector embeddings sample
      const syntheticVector = Array.from({ length: 12 }, () => (Math.random() * 2 - 1).toFixed(4));
      const words = rawText.trim().split(/\s+/);
      
      setVectorizerOutput({
        status: '768-D Dense Embeddings Ready',
        tokenCount: Math.round(words.length * 1.35),
        sampleVector: syntheticVector,
        model: 'bge-large-geology-v1.5',
        inferenceMs: 38 + Math.floor(Math.random() * 12),
        cosineSimilarity: (0.935 + Math.random() * 0.05).toFixed(4),
        dimensions: 768
      });
      setIsVectorizing(false);
    }, 600);
  };

  const handleReindex = (docId) => {
    setReindexingDocId(docId);
    reindexDocument(docId);
    setTimeout(() => {
      setReindexingDocId(null);
    }, 800);
  };

  const tabLabels = {
    ingestion: 'Tab 1: Data Ingestion & Workbench',
    repository: 'Tab 2: Vector Index & Clusters'
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col overflow-x-hidden">
      
      {/* Top Header - Vibrant Gradient Blue */}
      <header className="sticky top-0 z-30 w-full h-16 shrink-0 border-b backdrop-blur-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white border-blue-500/30 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* Left: Sidebar Toggle + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title="Open Navigation Sidebar"
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all shadow-sm flex items-center gap-2 backdrop-blur-sm cursor-pointer active:scale-95"
            >
              <PanelLeft className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Tabs</span>
            </button>

            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-900 font-bold shadow-md bg-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">
                  Geo-Mine <span className="text-cyan-200">Admin</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 border border-white/30 text-white backdrop-blur-sm shadow-sm hidden md:inline">
                  {tabLabels[activeTab]}
                </span>
              </div>
            </div>
          </div>

          {/* User Info & Actions with Red Hover Transition */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-cyan-100 font-mono">{user?.email || 'admin@geomine.gov.in'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="relative overflow-hidden group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/30 bg-white/15 text-white/90 hover:text-white hover:bg-red-600 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/40 text-xs font-semibold shadow-sm transition-all duration-700 ease-in-out hover:scale-105 active:scale-95 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 transition-all duration-700 group-hover:-translate-x-0.5 text-current group-hover:text-white" />
              <span className="transition-colors duration-700 text-current group-hover:text-white">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Sub-Header Container: Flex Layout with Smooth Margin Shift */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        <AppSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          role="admin"
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onQuickPromptSelect={(prompt) => {
            setRawText(prompt);
            setActiveTab('ingestion');
          }}
          totalDocuments={totalDocuments}
          totalVectors={totalVectors}
          autoHide={autoHide}
          onToggleAutoHide={() => setAutoHide(prev => !prev)}
        />

        {/* Main Content Area - Smooth non-overlapping margin layout */}
        <main className={`flex-1 min-w-0 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'md:ml-[336px]' : 'ml-0'
        }`}>

          {/* Quick Tab Header Bar on Top of Main Area */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-blue-200/80 shadow-sm">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('ingestion')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'ingestion'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Tab 1: Data Ingestion & Workbench</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('repository')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'repository'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Tab 2: Vector Index & Clusters</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs font-mono pr-3">
              <span className="text-slate-500">Active HNSW Store:</span>
              <strong className="text-blue-700 font-bold">{totalVectors.toLocaleString()} Vectors</strong>
            </div>
          </div>

          {/* ============================================================
             TAB 1: DATA INGESTION & TEXT VECTORIZER WORKBENCH
             ============================================================ */}
          {activeTab === 'ingestion' && (
            <div className="space-y-8 animate-fade-in w-full">
              
              {/* Section 1A: Document Ingestion Pipeline */}
              <div className="p-6 sm:p-8 rounded-3xl glass-panel-admin-blue border border-blue-200 shadow-xl space-y-5 bg-white/95">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                      Geological Document Ingestion & RAG Indexing Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingest geological core assays, borehole logs, and statutory DGMS regulations into dense 768-D vectors.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 w-fit">
                    Max 25 MB / File
                  </span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all duration-300 text-center relative overflow-hidden shadow-sm ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-100/50 scale-[1.01]' 
                      : 'border-blue-300/80 bg-white/95 hover:border-blue-400 hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    type="file"
                    id="admin-file-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        uploadAndVectorizeDocument(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-md">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Drag & Drop Geological PDF, CSV, or Borehole Logs
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Automated 768-D dense vectorization with recursive token chunking.
                      </p>
                    </div>

                    <label
                      htmlFor="admin-file-upload"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-95"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Browse Files from Disk
                    </label>
                  </div>

                  {/* Upload Progress Simulation */}
                  {uploadProgress && (
                    <div className="mt-6 p-4 rounded-2xl bg-blue-50/95 border border-blue-300 text-left space-y-2 animate-fade-in max-w-md mx-auto">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                        <span>{uploadProgress.fileName}</span>
                        <span>{uploadProgress.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                          style={{ width: `${uploadProgress.percent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-blue-700 font-mono">
                        {uploadProgress.stage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Formats Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { title: "Borehole Assays", ext: "PDF / CSV" },
                    { title: "Strata Core Logs", ext: "PDF / TXT" },
                    { title: "DGMS Statutory", ext: "PDF Manuals" },
                    { title: "CBM Well Desorption", ext: "CSV / JSON" }
                  ].map((fmt, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                      <div className="text-xs font-bold text-slate-800">{fmt.title}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{fmt.ext}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 1B: Real-Time Text Vectorizer & Tokenizer Workbench */}
              <div className="p-6 sm:p-8 rounded-3xl glass-panel-admin-blue border border-blue-200 shadow-xl space-y-6 bg-white/95">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-blue-600" />
                      Real-Time Text Vectorizer & Tokenizer Workbench
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Input raw geological field excerpts to observe token decomposition and dense 768-dimensional normalized embedding generation.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 w-fit">
                    bge-large-geology-v1.5
                  </span>
                </div>

                {/* Presets Row */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">Quick Test Excerpts:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Barakar Sandstone Core", text: "Barakar sandstone exhibits 42.8 MPa unconfined compressive strength with 78% RQD across Sector 4 Jharia Coalfield." },
                      { name: "DGMS CMR Regulation 111", text: "DGMS CMR 2017 Regulation 111 dictates minimum 2.4m coal pillar widths and mandatory hydraulic props in bord and pillar workings." },
                      { name: "Raniganj Hydrology Inrush", text: "Borehole BH-42 intercepted artesian aquifer strata at 145m depth with 4.2 bar hydraulic pressure requiring grouting." },
                      { name: "Mahanadi Basin CBM", text: "Mahanadi Basin exploration core tests confirmed 98.2% pure methane desorption with 14.5 m3/ton reservoir gas content." }
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRawText(preset.text)}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste strata notes, borehole cores, or DGMS clauses..."
                    className="w-full p-4 rounded-2xl bg-white border border-blue-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {rawText.length} characters • ~{Math.round(rawText.split(/\s+/).filter(Boolean).length * 1.35)} tokens
                    </span>

                    <button
                      onClick={handleGenerateCustomVector}
                      disabled={isVectorizing || !rawText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                    >
                      {isVectorizing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Computing 768-D Dense Embeddings...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Tokenize & Compute Embeddings
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {vectorizedOutput && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3 border border-blue-900 shadow-lg animate-fade-in font-mono text-xs">
                    <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-2.5">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {vectorizedOutput.status}
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span>Latency: <strong className="text-white">{vectorizedOutput.inferenceMs} ms</strong></span>
                        <span>Tokens: <strong className="text-white">{vectorizedOutput.tokenCount}</strong></span>
                        <span>Cosine Match: <strong className="text-emerald-300">{vectorizedOutput.cosineSimilarity}</strong></span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Normalized Vector Representation (First 12 of 768 dimensions):
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-800/60 overflow-x-auto text-cyan-300 text-[11px] font-mono leading-relaxed">
                      [{vectorizedOutput.sampleVector.map((v, i) => (
                        <span key={i} className={Number(v) > 0 ? 'text-cyan-300' : 'text-indigo-300'}>
                          {v}{i < vectorizedOutput.sampleVector.length - 1 ? ', ' : ''}
                        </span>
                      ))}, ... +756 dimensions]
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================
             TAB 2: VECTOR INDEX & 2D CLUSTER VISUALIZER
             ============================================================ */}
          {activeTab === 'repository' && (
            <div className="space-y-8 animate-fade-in w-full">
              
              {/* Section 2A: 2D HNSW Vector Topology Visualizer */}
              <div className="p-6 sm:p-8 rounded-3xl glass-panel-admin-blue border border-blue-200 shadow-xl space-y-6 bg-white/95">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      2D HNSW Vector Topology & Dimensionality Projection
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      t-SNE / UMAP projection of 768-D dense embeddings grouped by stratigraphy clusters.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 w-fit">
                    Cosine Metric
                  </span>
                </div>

                {/* 2D Interactive Cluster Canvas Simulation */}
                <div className="h-80 w-full rounded-2xl bg-slate-900 p-6 relative overflow-hidden border border-blue-950 shadow-inner flex items-center justify-center">
                  <div className="absolute inset-0 pattern-grid-blue opacity-20 pointer-events-none" />
                  <div className="absolute w-64 h-64 rounded-full border border-blue-500/20 animate-ping pointer-events-none" style={{ animationDuration: '4s' }} />
                  <div className="absolute w-96 h-96 rounded-full border border-cyan-500/20 pointer-events-none" />

                  <div className="absolute top-16 left-12 sm:left-20 p-2.5 rounded-xl bg-blue-600/30 border border-blue-400 text-white text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Barakar Formation Cluster (742 v)</span>
                  </div>

                  <div className="absolute bottom-16 left-12 sm:left-36 p-2.5 rounded-xl bg-cyan-600/30 border border-cyan-400 text-white text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Raniganj BH-42 Hydrology (631 v)</span>
                  </div>

                  <div className="absolute top-20 right-10 sm:right-24 p-2.5 rounded-xl bg-emerald-600/30 border border-emerald-400 text-white text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>DGMS CMR 2017 Regulatory (520 v)</span>
                  </div>

                  <div className="absolute bottom-12 right-12 sm:right-32 p-2.5 rounded-xl bg-amber-600/30 border border-amber-400 text-white text-[11px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Mahanadi Basin CBM (480 v)</span>
                  </div>

                  <div className="text-center text-slate-400 text-xs z-10 pointer-events-none font-mono">
                    <span className="text-blue-400 font-bold">HNSW Store Active</span> • {totalVectors.toLocaleString()} vectors loaded
                  </div>
                </div>
              </div>

              {/* Section 2B: Searchable Vectorized Documents Repository */}
              <div className="space-y-4 animate-fade-in w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel-admin-blue border border-blue-200 bg-white/95">
                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {['ALL', 'Stratigraphy', 'DGMS Regulations', 'Hydrogeology', 'CBM'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          activeFilter === filter
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white hover:bg-blue-50 text-slate-700 border border-blue-100'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-blue-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                {doc.category}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {doc.uploadedAt} • {doc.size}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReindex(doc.id)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Re-vectorize"
                          >
                            <RefreshCw className={`w-4 h-4 ${reindexingDocId === doc.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {doc.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 font-mono text-slate-500">
                        <span>Vectors: <strong className="text-blue-700">{doc.vectorsCount}</strong> ({doc.dimensions}-D)</span>
                        <span>Cluster: <strong className="text-slate-800">{doc.cluster}</strong></span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
