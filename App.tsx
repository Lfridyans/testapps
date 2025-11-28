import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardHeader from './components/DashboardHeader';
import ChartSection from './components/ChartSection';
import ExecutiveReport from './components/ExecutiveReport'; // New Component
import DatePicker from './components/DatePicker';
import { TrafficType, PredictionResult, AirportCode, Page } from './types'; // Page type
import { getPrediction, getExecutiveAnalysis, generateExecutiveAudio } from './services/geminiService';
import { getAirportData, getAirportStats } from './data/nataruData';
import { EXECUTIVE_DATA } from './data/executiveData';
import { Loader2, Search, Plane, Users, Building2, ChevronDown, LayoutDashboard, LineChart, Sparkles, RefreshCw, FileText, Volume2, StopCircle } from 'lucide-react';

// --- Audio Helper Functions (From Google GenAI Guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('PREDICTOR'); // Navigation State

  // Predictor State
  const [selectedDate, setSelectedDate] = useState<string>('2025-12-20');
  const [trafficType, setTrafficType] = useState<TrafficType>(TrafficType.PASSENGER);
  const [selectedAirport, setSelectedAirport] = useState<AirportCode>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Executive State
  const [execReport, setExecReport] = useState<string | null>(null);
  const [execLoading, setExecLoading] = useState<boolean>(false);

  // Audio State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('GEMINI_API_KEY') || '';
    }
    return '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // Dynamic Data Handling for Predictor
  const currentData = useMemo(() => getAirportData(selectedAirport), [selectedAirport]);
  const currentStats = useMemo(() => getAirportStats(selectedAirport), [selectedAirport]);
  const dataDates = useMemo(() => currentData.map(d => d.date), [currentData]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  const handleTypeChange = (newType: TrafficType) => {
    setTrafficType(newType);
    setResult(null);
  };

  const handleAirportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAirport(e.target.value as AirportCode);
    setResult(null); 
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setResult(null);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if API key is needed
    if (!apiKey && typeof window !== 'undefined' && !localStorage.getItem('GEMINI_API_KEY')) {
      setShowApiKeyInput(true);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getPrediction({
        date: selectedDate,
        type: trafficType,
        airportCode: selectedAirport
      });
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('API Key not found')) {
        setShowApiKeyInput(true);
      } else {
        alert("Failed to get prediction: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      setShowApiKeyInput(false);
      // Retry prediction if user was trying to predict
      if (selectedDate) {
        handlePredict(new Event('submit') as any);
      }
    }
  };

  // Helper to init/resume audio context
  const getAudioContext = async () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playAudio = async (textToSpeak: string) => {
    try {
        const ctx = await getAudioContext();
        
        setIsAudioLoading(true);
        const base64Audio = await generateExecutiveAudio(textToSpeak);
        if (!base64Audio) throw new Error("No audio returned");

        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => setIsPlaying(false);
        source.start();
        
        sourceNodeRef.current = source;
        setIsPlaying(true);
    } catch (e) {
        console.error("Audio Playback Error:", e);
        alert("Gagal memutar audio.");
    } finally {
        setIsAudioLoading(false);
    }
  };

  const handleGenExecReport = async () => {
    // Check if API key is needed
    if (!apiKey && typeof window !== 'undefined' && !localStorage.getItem('GEMINI_API_KEY')) {
      setShowApiKeyInput(true);
      return;
    }

    // 1. Capture user interaction immediately to unlock AudioContext
    try {
        await getAudioContext();
    } catch (e) {
        console.warn("Could not resume audio context on click");
    }

    setExecLoading(true);
    handleStopAudio();
    
    try {
        const text = await getExecutiveAnalysis(EXECUTIVE_DATA);
        setExecReport(text);
        
        // 2. Automatically play audio after generation
        if (text) {
            await playAudio(text);
        }
    } catch (e: any) {
        console.error(e);
        if (e.message && e.message.includes('API Key not found')) {
          setShowApiKeyInput(true);
        } else {
          alert("Gagal generate report: " + (e.message || "Unknown error"));
        }
    } finally {
        setExecLoading(false);
    }
  };

  const handlePlayAudioClick = async () => {
    if (execReport) {
        await playAudio(execReport);
    }
  };

  const handleStopAudio = () => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        setIsPlaying(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-full w-full">
        
        {/* SIDEBAR (Navigation & Control Panel) */}
        <aside className="w-80 flex-none bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            
            {/* Main Navigation Menu */}
            <div className="p-4 border-b border-slate-100 flex-none">
               <nav className="space-y-1">
                  <button 
                    onClick={() => setActivePage('PREDICTOR')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activePage === 'PREDICTOR' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                     <LineChart className="w-4 h-4" />
                     Analisis Prediksi
                  </button>
                  <button 
                    onClick={() => setActivePage('EXECUTIVE')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activePage === 'EXECUTIVE' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                     <LayoutDashboard className="w-4 h-4" />
                     Executive Report
                  </button>
               </nav>
            </div>

            {/* Render Controls ONLY if on Predictor Page */}
            {activePage === 'PREDICTOR' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <div className="p-6">
                        <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Search className="w-3 h-3" />
                        Parameter Prediksi
                        </h2>
                        
                        <form onSubmit={handlePredict} className="space-y-5">
                        {/* Airport */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Bandara</label>
                            <div className="relative">
                            <select
                                value={selectedAirport}
                                onChange={handleAirportChange}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 pr-8 rounded-lg text-sm leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            >
                                <option value="ALL">Seluruh Bandara</option>
                                <option value="CGK">Soekarno-Hatta (CGK)</option>
                                <option value="DPS">I Gusti Ngurah Rai (DPS)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <Building2 className="w-3.5 h-3.5 mr-1" />
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                            </div>
                        </div>
                        
                        {/* Traffic Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Trafik</label>
                            <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleTypeChange(TrafficType.PASSENGER)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                trafficType === TrafficType.PASSENGER 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                                }`}
                            >
                                <Users className="w-5 h-5 mb-1" />
                                <span className="font-medium text-xs">Penumpang</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange(TrafficType.FLIGHT)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                trafficType === TrafficType.FLIGHT 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                                }`}
                            >
                                <Plane className="w-5 h-5 mb-1" />
                                <span className="font-medium text-xs">Pesawat</span>
                            </button>
                            </div>
                        </div>

                        {/* Date Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                            <DatePicker 
                            value={selectedDate}
                            onChange={handleDateChange}
                            minDate="2025-12-01"
                            maxDate="2026-01-31"
                            highlightedDates={dataDates}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                        >
                            {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Proses...
                            </>
                            ) : (
                            'Jalankan Prediksi'
                            )}
                        </button>
                        </form>
                    </div>

                    <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Penting</h4>
                        <ul className="space-y-2 text-xs text-slate-600 font-medium">
                            <li className="flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Puncak Dep: {currentStats.peakDeparture}
                            </li>
                            <li className="flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Puncak Arr: {currentStats.peakReturn}
                            </li>
                            <li className="flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Target Growth: +{currentStats.passengerGrowth}
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Render AI Analysis ONLY if on Executive Page */}
            {activePage === 'EXECUTIVE' && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h4 className="font-bold text-slate-700 text-xs flex items-center gap-2 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            AI Analyst Summary
                        </h4>
                        <p className="text-[10px] text-slate-500">
                           Analisis naratif otomatis (Mode: Executive HTML)
                        </p>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                         {!execReport ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
                                    Belum ada laporan. Klik tombol di bawah untuk generate.
                                </p>
                                <button 
                                    onClick={handleGenExecReport}
                                    disabled={execLoading}
                                    className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {execLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    Generate Report
                                </button>
                            </div>
                        ) : (
                             <div className="space-y-4">
                                <div 
                                    className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs leading-relaxed text-slate-700 font-medium [&>h3]:font-bold [&>h3]:text-sm [&>h3]:text-indigo-800 [&>h3]:mb-1 [&>h3]:mt-3 [&>h3:first-child]:mt-0 [&>p]:mb-2 [&>ul]:mb-2 [&>li]:mb-1 [&>ul]:list-disc [&>ul]:pl-4"
                                    dangerouslySetInnerHTML={{ __html: execReport }}
                                >
                                </div>
                                <div className="flex justify-center gap-2">
                                     <button 
                                        onClick={handleGenExecReport}
                                        disabled={execLoading || isAudioLoading}
                                        className="text-slate-500 text-xs font-bold hover:text-indigo-600 border border-slate-200 bg-white px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1 transition-all"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Regenerate
                                    </button>

                                    {isPlaying ? (
                                        <button 
                                            onClick={handleStopAudio}
                                            className="text-white text-xs font-bold bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1 transition-all"
                                        >
                                            <StopCircle className="w-3 h-3" /> Stop
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handlePlayAudioClick}
                                            disabled={isAudioLoading}
                                            className="text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
                                        >
                                            {isAudioLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                                            Replay Audio
                                        </button>
                                    )}
                                </div>
                                {isAudioLoading && (
                                     <div className="text-center text-[10px] text-indigo-600 font-medium animate-pulse">
                                        Generating Audio...
                                     </div>
                                )}
                             </div>
                        )}
                    </div>
                </div>
            )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
           
           {/* CONDITIONAL RENDERING BASED ON ACTIVE PAGE */}
           
           {activePage === 'PREDICTOR' && (
             <>
                {/* Predictor View */}
                <DashboardHeader stats={currentStats} />
                <div className="flex-1 min-h-0 p-4">
                    <div className="h-full rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <ChartSection 
                            trafficType={trafficType}
                            predictionResult={result}
                            selectedDate={selectedDate}
                            referenceData={currentData}
                        />
                    </div>
                </div>
             </>
           )}

           {activePage === 'EXECUTIVE' && (
             <ExecutiveReport />
           )}

        </main>

      </div>

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">API Key Required</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please enter your Gemini API Key to use AI features. Your key will be stored locally in your browser.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleApiKeySubmit}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Save & Continue
              </button>
              <button
                onClick={() => {
                  setShowApiKeyInput(false);
                  if (typeof window !== 'undefined' && localStorage.getItem('GEMINI_API_KEY')) {
                    setApiKey(localStorage.getItem('GEMINI_API_KEY') || '');
                  }
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Get your API key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;