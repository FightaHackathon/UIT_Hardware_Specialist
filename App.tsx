import React, { useState, useEffect, useRef } from 'react';
import { initializeMistral, sendMessageToMistral } from './services/mistralService';
import { ConnectionStatus, PCBuild, ComponentPart, DeviceType, Language } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ShieldCheck, Database, Zap, Cpu, Monitor, HardDrive, MemoryStick, Box, Check, RotateCcw, PlayCircle, BarChart3, AlertCircle, Laptop, PcCase, Battery, Globe, Search } from 'lucide-react';
import { APP_TITLE, APP_SUBTITLE, COMPONENT_DB, UI_TEXT } from './constants';

// Helper for Comparison View
const ActivityRow = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0 mt-0.5">{label}</span>
    <span className={`text-xs text-right ${highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{value}</span>
  </div>
);

const isGamingCapable = (laptop: ComponentPart) => {
  const specs = (laptop.specs || "").toLowerCase();
  const name = laptop.name.toLowerCase();
  return specs.includes('rtx') || specs.includes('gtx') || specs.includes('radeon rx') || name.includes('gaming');
};

// Helper Icons for the Dashboard
const CheckCircleIcon = () => (
  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border-2 border-green-500/50">
    <Check size={24} strokeWidth={4} />
  </div>
);

const WarningIcon = () => (
  <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center border-2 border-yellow-500/50">
    <AlertCircle size={24} strokeWidth={3} />
  </div>
);

const ErrorIcon = () => (
  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border-2 border-red-500/50">
    <AlertCircle size={24} strokeWidth={3} />
  </div>
);


const App: React.FC = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>('Desktop');
  const [language, setLanguage] = useState<Language>('en');
  const [build, setBuild] = useState<PCBuild>({
    type: 'Desktop',
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    pcCase: null,
    laptop: null
  });

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [laptopSearch, setLaptopSearch] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // Helper to parse price string to number
  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const [maxPrice, setMaxPrice] = useState<number>(3000000); // Default 30 Lakhs
  const [compareList, setCompareList] = useState<ComponentPart[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // New Navigation State
  const [activeTab, setActiveTab] = useState<'desktop' | 'laptop' | 'budget' | 'compare'>('desktop');

  // New Filter States
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [programQuery, setProgramQuery] = useState<string>("");
  const [wantGaming, setWantGaming] = useState<boolean>(false);

  // Derive unique majors from laptop data
  const uniqueMajors = React.useMemo(() => {
    const laptops = COMPONENT_DB['Laptop'] || [];
    const majors = new Set<string>();
    laptops.forEach(l => {
      if (l.major) {
        l.major.split(',').forEach(m => majors.add(m.trim()));
      }
    });
    return Array.from(majors).sort();
  }, []);

  const handleAddToCompare = (laptop: ComponentPart) => {
    if (compareList.find(l => l.id === laptop.id)) {
      setCompareList(prev => prev.filter(l => l.id !== laptop.id));
    } else {
      if (compareList.length >= 2) {
        alert("You can only compare 2 laptops at a time.");
        return;
      }
      setCompareList(prev => [...prev, laptop]);
    }
  };


  // Initial connection
  useEffect(() => {
    const connect = () => {
      setStatus(ConnectionStatus.CONNECTING);
      const connected = initializeMistral();
      if (connected) {
        setStatus(ConnectionStatus.CONNECTED);
      } else {
        setStatus(ConnectionStatus.ERROR);
      }
    };
    connect();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'my' : 'en');
  };

  const handleDeviceToggle = (type: DeviceType) => {
    setDeviceType(type);
    setBuild(prev => ({ ...prev, type }));
    setAnalysis(null);
    setScore(0);
  };

  const handleSelect = (category: keyof PCBuild, partId: string, dbKey: string) => {
    const part = COMPONENT_DB[dbKey]?.find(p => p.id === partId) || null;

    setBuild(prev => ({ ...prev, [category]: part }));
    // Reset analysis when build changes
    setAnalysis(null);
    setScore(0);
  };

  const handleReset = () => {
    setBuild({
      type: deviceType,
      cpu: null,
      gpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      psu: null,
      pcCase: null,
      laptop: null
    });
    setAnalysis(null);
    setScore(0);
  };

  const handleAnalyze = async () => {
    if (status !== ConnectionStatus.CONNECTED) return;

    let prompt = "";

    if (deviceType === 'Desktop') {
      if (!build.cpu || !build.motherboard || !build.ram) {
        alert("Please select at least a CPU, Motherboard, and RAM.");
        return;
      }
      const buildSummary = Object.entries(build)
        .filter(([key]) => key !== 'laptop' && key !== 'type')
        .map(([key, part]) => {
          const component = part as ComponentPart | null;
          return `${key.toUpperCase()}: ${component ? component.name + " (" + component.specs + ")" : "Not Selected"}`;
        })
        .join('\n');
      prompt = `Analyze this Desktop PC Build for a UIT Student:\n\n${buildSummary}\n\nCheck for physical compatibility and performance for: Visual Studio, Android Studio, Docker, Unity. Provide the Suitability Score first.`;
    } else {
      if (!build.laptop) {
        alert("Please select a Laptop model.");
        return;
      }
      prompt = `Analyze this Laptop for a UIT Student:\n\nMODEL: ${build.laptop.name}\nSPECS: ${build.laptop.specs}\nBATTERY: ${build.laptop.battery || 'Unknown'}\n\nCheck for performance, battery life suitability, and portability for: Visual Studio, Android Studio, Docker, Unity. Provide the Suitability Score first.`;
    }

    let systemInstructionOverride;

    if (language === 'my') {
      prompt += "\n\nIMPORTANT: YOU MUST PROVIDE THE ENTIRE RESPONSE IN BURMESE (MYANMAR) LANGUAGE. Do not use English except for technical specifications (like CPU names, GB, etc). Explain the suitability score and issues in Burmese.";

      systemInstructionOverride = `
ROLE:
You are the "UIT Hardware Specialist," an expert system for the University of Information Technology in Myanmar.
Your goal is to validate PC builds and Laptop choices for Students who need to run demanding software.
You MUST reply in Burmese (Myanmar) language.

RESPONSE FORMAT (Markdown):
Start with a strict metadata line: "SCORE: [0-100]" (Overall suitability).

Then provide:
**✅ COMPATIBLE** (or ❌ INCOMPATIBLE / ⚠️ ISSUES)
**Summary**: [1-2 sentences in Burmese]

**Workload Suitability**:
*   💻 **Coding & Compiling**: [Rating/Comment in Burmese]
*   📱 **Mobile Emulation**: [Rating/Comment in Burmese]
*   🎨 **Graphics & AI**: [Rating/Comment in Burmese]

**Expert Verdict**: Detailed advice in Burmese.
`;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const responseText = await sendMessageToMistral(prompt, systemInstructionOverride);

      const scoreMatch = responseText.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch) {
        setScore(parseInt(scoreMatch[1], 10));
      }

      setAnalysis(responseText);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      setAnalysis("Error analyzing build. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isDesktopEmpty = deviceType === 'Desktop' && !Object.values(build).some(part => part !== null && typeof part === 'object');
  const isLaptopEmpty = deviceType === 'Laptop' && !build.laptop;

  // Render battery indicator logic
  const getBatteryColor = (batteryText: string | undefined) => {
    if (!batteryText) return 'text-slate-500';
    if (batteryText.includes('Excellent')) return 'text-green-400';
    if (batteryText.includes('Good')) return 'text-cyan-400';
    if (batteryText.includes('Poor')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const SelectionCard = ({
    label,
    icon: Icon,
    field,
    dbKey
  }: {
    label: string,
    icon: any,
    field: keyof PCBuild,
    dbKey: string
  }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-3 text-cyan-400">
        <Icon size={18} />
        <span className="font-semibold text-sm uppercase tracking-wider">{label}</span>
      </div>
      <select
        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-900"
        value={build[field]?.id || ""}
        onChange={(e) => handleSelect(field, e.target.value, dbKey)}
      >
        <option value="">{UI_TEXT.select_prefix[language]}...</option>
        {COMPONENT_DB[dbKey]?.map((part) => (
          <option key={part.id} value={part.id}>
            {part.name}
          </option>
        ))}
      </select>
      {build[field] && (
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          {build[field]?.specs}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 p-4 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-950 border border-cyan-800 rounded flex items-center justify-center text-cyan-400">
              <ShieldCheck />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">{APP_TITLE}</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest hidden sm:block">{UI_TEXT.header_subtitle[language]}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Globe size={12} /> {language === 'en' ? 'MM / မြန်မာ' : 'EN / English'}
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1"><Database size={12} /> DB: ACTIVE</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${status === ConnectionStatus.CONNECTED
              ? 'bg-green-900/30 border-green-800 text-green-400'
              : 'bg-red-900/30 border-red-800 text-red-400'
              }`}>
              {status === ConnectionStatus.CONNECTED ? UI_TEXT.status_online[language] : UI_TEXT.status_offline[language]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full">

        {/* Left: Configurator */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 border-r border-slate-800 scrollbar-thin">

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => { setActiveTab('desktop'); setDeviceType('Desktop'); }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-md text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'desktop' ? 'bg-cyan-950 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <PcCase size={16} /> Desktop
            </button>
            <button
              onClick={() => { setActiveTab('laptop'); setDeviceType('Laptop'); }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-md text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'laptop' ? 'bg-cyan-950 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Laptop size={16} /> Laptop
            </button>
            <button
              onClick={() => { setActiveTab('budget'); setDeviceType('Laptop'); }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-md text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'budget' ? 'bg-emerald-950 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Search size={16} /> Budget & Major
            </button>
            <button
              onClick={() => { setActiveTab('compare'); setDeviceType('Laptop'); }}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-md text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'compare' ? 'bg-purple-950 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <BarChart3 size={16} /> Compare
              {compareList.length > 0 && <span className="ml-1 bg-purple-500 text-white text-[10px] px-1.5 rounded-full">{compareList.length}</span>}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {activeTab === 'desktop' && <><Cpu className="text-cyan-500" /> Desktop Builder</>}
              {activeTab === 'laptop' && <><Laptop className="text-cyan-500" /> Laptop Search</>}
              {activeTab === 'budget' && <><Search className="text-emerald-500" /> Smart Filter</>}
              {activeTab === 'compare' && <><BarChart3 className="text-purple-500" /> Comparison Tool</>}
            </h2>
            <button
              onClick={handleReset}
              disabled={deviceType === 'Desktop' ? isDesktopEmpty : isLaptopEmpty}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <RotateCcw size={14} /> {UI_TEXT.btn_reset[language]}
            </button>
          </div>

          {/* CONTENT: DESKTOP BUILDER */}
          {activeTab === 'desktop' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <SelectionCard label="Processor (CPU)" icon={Cpu} field="cpu" dbKey="CPU" />
              <SelectionCard label="Motherboard" icon={Box} field="motherboard" dbKey="Motherboard" />
              <SelectionCard label="Graphics (GPU)" icon={Monitor} field="gpu" dbKey="GPU" />
              <SelectionCard label="Memory (RAM)" icon={MemoryStick} field="ram" dbKey="RAM" />
              <SelectionCard label="Storage" icon={HardDrive} field="storage" dbKey="Storage" />
              <SelectionCard label="Power Supply" icon={Zap} field="psu" dbKey="PSU" />
              <SelectionCard label="Case" icon={Box} field="pcCase" dbKey="Case" />
            </div>
          )}

          {/* CONTENT: LAPTOP SEARCH (Standard) */}
          {activeTab === 'laptop' && (
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2 mb-3 text-cyan-400">
                  <Laptop size={18} />
                  <span className="font-semibold text-sm uppercase tracking-wider">Select Laptop Model</span>
                </div>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, specs, or brand..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-9 text-sm text-slate-200 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-900 mb-2"
                    value={laptopSearch}
                    onChange={(e) => setLaptopSearch(e.target.value)}
                  />
                </div>
                <div className="h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  {COMPONENT_DB['Laptop']
                    ?.filter(l =>
                      l.name.toLowerCase().includes(laptopSearch.toLowerCase()) ||
                      l.specs.toLowerCase().includes(laptopSearch.toLowerCase())
                    )
                    .map((part) => (
                      <div
                        key={part.id}
                        onClick={() => handleSelect('laptop', part.id, 'Laptop')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${build.laptop?.id === part.id ? 'bg-cyan-900/40 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-bold text-sm ${build.laptop?.id === part.id ? 'text-cyan-300' : 'text-slate-200'}`}>{part.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{part.specs}</div>
                            {part.price && <div className="text-xs text-emerald-400 font-mono mt-1">{part.price.toLocaleString()} MMK</div>}
                          </div>
                          {build.laptop?.id === part.id && <Check size={16} className="text-cyan-400" />}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: BUDGET & MAJOR FILTER */}
          {activeTab === 'budget' && (
            <div className="space-y-6 mb-8">
              {/* Filter Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Max Budget</span>
                    <span className="text-emerald-400">{maxPrice.toLocaleString()} MMK</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="5000000"
                    step="100000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                    <span>5 Lakhs</span>
                    <span>50 Lakhs</span>
                  </div>
                </div>

                {/* Major Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider block">Your Major</label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Any Major</option>
                    {uniqueMajors.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Programs Input */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider block">Required Programs</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. AutoCAD, Adobe Premiere..."
                    value={programQuery}
                    onChange={(e) => setProgramQuery(e.target.value)}
                  />
                </div>

                {/* Gaming Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="gaming"
                    checked={wantGaming}
                    onChange={(e) => setWantGaming(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-900"
                  />
                  <label htmlFor="gaming" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                    I also want to play games (Requires dedicated GPU)
                  </label>
                </div>
              </div>

              {/* Filtered Results */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recommended Options</h3>
                <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
                  {COMPONENT_DB['Laptop']
                    ?.filter(l => {
                      // 1. Price Check
                      if ((l.price || 0) > maxPrice) return false;
                      // 2. Major Check
                      if (selectedMajor && (!l.major || !l.major.includes(selectedMajor))) return false;
                      // 3. Program Check
                      if (programQuery && (!l.programList || !l.programList.toLowerCase().includes(programQuery.toLowerCase()))) return false;
                      // 4. Gaming Check (Simple Heuristic: Must have RTX/GTX/RX or "Gaming" in name)
                      if (wantGaming) {
                        const specs = (l.specs || "").toLowerCase();
                        const name = l.name.toLowerCase();
                        const isGaming = specs.includes('rtx') || specs.includes('gtx') || specs.includes('radeon rx') || name.includes('gaming');
                        if (!isGaming) return false;
                      }
                      return true;
                    })
                    .map(part => (
                      <div key={part.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{part.name}</h4>
                          <span className="bg-slate-950 text-emerald-400 font-mono text-xs px-2 py-1 rounded border border-slate-800">
                            {(part.price || 0).toLocaleString()} MMK
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mb-3 space-y-1">
                          <p>{part.specs}</p>
                          {part.major && <p className="text-slate-500 italic"><span className="text-slate-600 not-italic font-bold">Best for:</span> {part.major}</p>}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => { handleSelect('laptop', part.id, 'Laptop'); setActiveTab('laptop'); }} // Switch to laptop tab to see selection
                            className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${build.laptop?.id === part.id ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                          >
                            {build.laptop?.id === part.id ? 'Selected' : 'Select This Laptop'}
                          </button>
                          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-2 rounded-md border border-slate-800 hover:border-purple-500/50 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-900"
                              checked={!!compareList.find(c => c.id === part.id)}
                              onChange={() => handleAddToCompare(part)}
                            />
                            <span className="text-xs font-bold text-slate-400">Compare</span>
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTENT: COMPARISON TOOL */}
          {activeTab === 'compare' && (
            <div className="h-full flex flex-col">
              {compareList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
                  <BarChart3 size={48} />
                  <p>Select laptops from the <b>Budget</b> or <b>Laptop</b> tabs to compare.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto">
                  {compareList.map((laptop, idx) => (
                    <div key={laptop.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
                      <button
                        onClick={() => handleAddToCompare(laptop)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <span className="sr-only">Remove</span>
                        <div className="bg-slate-950 rounded-full p-1"><RotateCcw size={12} className="rotate-45" /></div>
                      </button>

                      <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Option {idx + 1}</div>
                      <h3 className="text-lg font-bold text-white mb-4 line-clamp-1" title={laptop.name}>{laptop.name}</h3>

                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Price</div>
                          <div className="text-xl font-mono text-emerald-400">{(laptop.price || 0).toLocaleString()} MMK</div>
                        </div>

                        <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 space-y-2">
                          <ActivityRow label="Specs" value={laptop.specs || "N/A"} />
                          <ActivityRow label="Major" value={laptop.major || "General Use"} highlight />
                          <ActivityRow label="Programs" value={laptop.programList || "Standard Office Suite"} />
                          <div className="pt-2 border-t border-slate-800 mt-2">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Gaming Verdict</div>
                            <div className="text-xs text-slate-300">
                              {isGamingCapable(laptop) ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1"><Check size={12} /> Capable</span>
                              ) : (
                                <span className="text-slate-500">Basic / Casual Only</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (deviceType === 'Desktop' ? isDesktopEmpty : isLaptopEmpty)}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 text-lg mt-6"
            style={{ display: activeTab === 'compare' || activeTab === 'budget' ? 'none' : 'flex' }}
          >
            {isAnalyzing ? (
              <>{UI_TEXT.btn_analyzing[language]}</>
            ) : (
              <><PlayCircle /> {UI_TEXT.btn_analyze[language]}</>
            )}
          </button>
        </div>

        {/* Right: Analysis Dashboard */}
        <div ref={resultRef} className="flex-1 bg-slate-950/50 p-4 md:p-6 overflow-y-auto border-t md:border-t-0 border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <BarChart3 className="text-purple-500" /> Specialist Analysis
          </h2>

          {!analysis && !isAnalyzing && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
              {deviceType === 'Desktop' ? <PcCase size={48} className="mb-4 opacity-50" /> : <Laptop size={48} className="mb-4 opacity-50" />}
              <p className="text-center">{UI_TEXT.empty_state[language]}</p>
              <p className="text-xs mt-2 opacity-50 text-center">{UI_TEXT.checking_msg[language]}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-800 rounded w-1/3"></div>
              <div className="h-32 bg-slate-800 rounded w-full"></div>
              <div className="h-8 bg-slate-800 rounded w-1/2"></div>
              <div className="h-24 bg-slate-800 rounded w-full"></div>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Score Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">{UI_TEXT.score_label[language]}</div>
                  <div className="text-4xl md:text-5xl font-black text-white">{score}<span className="text-xl text-slate-500">/100</span></div>
                </div>

                {/* Visual Circle / Progress */}
                <div className="relative z-10">
                  {score >= 80 ? <CheckCircleIcon /> : score >= 50 ? <WarningIcon /> : <ErrorIcon />}
                </div>

                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                  <div
                    className={`h-full transition-all duration-1000 ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>

              {/* Text Report */}
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-1 relative">
                <ChatMessage message={{ id: 'report', role: 'model', text: analysis, timestamp: new Date() }} />

                {/* Translation Button */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={async () => {
                      if (!analysis || isAnalyzing) return;
                      setIsAnalyzing(true);
                      try {
                        const prompt = `Translate the following technical analysis into Burmese (Myanmar) language. \n\nIMPORTANT:\n1. Keep all Markdown formatting (**bold**, *lists*, etc).\n2. Keep the "SCORE: [number]" exactly as is.\n3. Translate everything else to Burmese.\n\nORIGINAL TEXT:\n${analysis}`;
                        const translated = await sendMessageToMistral(prompt);
                        setAnalysis(translated);
                      } catch (e) {
                        alert("Translation failed. Please try again.");
                      } finally {
                        setIsAnalyzing(false);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg border border-slate-700 transition-colors shadow-sm"
                    title="Translate to Burmese"
                  >
                    <Globe size={14} /> {UI_TEXT.btn_translate[language]}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default App;