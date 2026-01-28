import React, { useState, useEffect, useRef } from 'react';
import { initializeMistral, sendMessageToMistral } from './services/mistralService';
import { ConnectionStatus, PCBuild, ComponentPart, DeviceType, Language } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ShieldCheck, Database, Zap, Cpu, Monitor, HardDrive, MemoryStick, Box, Check, RotateCcw, PlayCircle, BarChart3, AlertCircle, Laptop, PcCase, Battery, Globe } from 'lucide-react';
import { APP_TITLE, APP_SUBTITLE, COMPONENT_DB, UI_TEXT } from './constants';

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
  const resultRef = useRef<HTMLDivElement>(null);

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

    if (language === 'my') {
      prompt += "\n\nPlease provide the response in Burmese (Myanmar) language.";
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const responseText = await sendMessageToMistral(prompt);
      
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
                <span className="flex items-center gap-1"><Database size={12}/> DB: ACTIVE</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
              status === ConnectionStatus.CONNECTED 
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
          
          {/* Device Type Toggle */}
          <div className="bg-slate-900 p-1 rounded-lg flex mb-6 border border-slate-800">
            <button 
              onClick={() => handleDeviceToggle('Desktop')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${deviceType === 'Desktop' ? 'bg-cyan-950 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <PcCase size={16} /> {UI_TEXT.tab_desktop[language]}
            </button>
            <button 
              onClick={() => handleDeviceToggle('Laptop')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${deviceType === 'Laptop' ? 'bg-cyan-950 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Laptop size={16} /> {UI_TEXT.tab_laptop[language]}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {deviceType === 'Desktop' ? <Cpu className="text-cyan-500" /> : <Laptop className="text-cyan-500" />}
              {deviceType === 'Desktop' ? UI_TEXT.section_desktop[language] : UI_TEXT.section_laptop[language]}
            </h2>
            <button 
              onClick={handleReset}
              disabled={deviceType === 'Desktop' ? isDesktopEmpty : isLaptopEmpty}
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <RotateCcw size={14} /> {UI_TEXT.btn_reset[language]}
            </button>
          </div>

          {deviceType === 'Desktop' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <SelectionCard label="Processor (CPU)" icon={Cpu} field="cpu" dbKey="CPU" />
              <SelectionCard label="Motherboard" icon={Box} field="motherboard" dbKey="Motherboard" />
              <SelectionCard label="Graphics (GPU)" icon={Monitor} field="gpu" dbKey="GPU" />
              <SelectionCard label="Memory (RAM)" icon={MemoryStick} field="ram" dbKey="RAM" />
              <SelectionCard label="Storage" icon={HardDrive} field="storage" dbKey="Storage" />
              <SelectionCard label="Power Supply" icon={Zap} field="psu" dbKey="PSU" />
              <SelectionCard label="Case" icon={Box} field="pcCase" dbKey="Case" />
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-4 mb-8">
               <SelectionCard label="Select Laptop Model" icon={Laptop} field="laptop" dbKey="Laptop" />
               
               {/* Laptop Battery Indicator */}
               {build.laptop && (
                 <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                   <div className={`p-3 rounded-full bg-slate-950 border border-slate-800 ${getBatteryColor(build.laptop.battery)}`}>
                     <Battery size={24} />
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                       {UI_TEXT.battery_est[language]}
                     </div>
                     <div className={`text-lg font-bold ${getBatteryColor(build.laptop.battery)}`}>
                       {build.laptop.battery || "N/A"}
                     </div>
                     <div className="text-[10px] text-slate-600 mt-1">
                       Based on typical light-load campus usage (Code/Docs)
                     </div>
                   </div>
                 </div>
               )}
             </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (deviceType === 'Desktop' ? isDesktopEmpty : isLaptopEmpty)}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 text-lg"
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
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-1">
                 <ChatMessage message={{ id: 'report', role: 'model', text: analysis, timestamp: new Date() }} />
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
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

export default App;