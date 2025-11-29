import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';
import { DailyData, TrafficType, PredictionResult } from '../types';
import { TrendingUp, Info, FileBarChart, Lightbulb, Globe, ExternalLink, Zap, Bot } from 'lucide-react';

interface ChartSectionProps {
  trafficType: TrafficType;
  predictionResult: PredictionResult | null;
  selectedDate: string;
  referenceData: DailyData[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ trafficType, predictionResult, selectedDate, referenceData }) => {
  // Determine Data Key and Colors
  const isPax = trafficType === TrafficType.PASSENGER;
  // Standard colors
  const colorPax = '#3b82f6';   // Blue
  const colorFlight = '#f97316'; // Orange
  // Dynamic color based on scenario
  const isSimulation = predictionResult?.appliedScenario && predictionResult.appliedScenario !== 'Normal Operations' && predictionResult.appliedScenario !== 'Normal';
  const colorPredict = isSimulation ? '#059669' : '#4f46e5'; // Emerald for Auto Agent, Indigo for normal

  // Extract Original Value from Context if available
  const originalValue = useMemo(() => {
    if (predictionResult && predictionResult.context && predictionResult.context.date === selectedDate) {
        return isPax ? predictionResult.context.passengers : predictionResult.context.flights;
    }
    const match = referenceData.find(d => d.date === selectedDate);
    return match ? (isPax ? match.passengers : match.flights) : null;
  }, [predictionResult, isPax, selectedDate, referenceData]);

  // Calculate difference
  const difference = useMemo(() => {
    if (originalValue === null || !predictionResult) return 0;
    return predictionResult.predictedValue - originalValue;
  }, [originalValue, predictionResult]);

  // Prepare Data: Add Prediction as a SEPARATE key for side-by-side comparison
  const chartData = useMemo(() => {
    // Deep copy to allow modification
    let combinedData: any[] = referenceData.map(d => ({ ...d }));
    
    if (predictionResult && predictionResult.predictedValue) {
      const idx = combinedData.findIndex(d => d.date === selectedDate);
      
      if (idx >= 0) {
        // Inject specific prediction key based on type
        if (trafficType === TrafficType.PASSENGER) {
            combinedData[idx].paxPrediction = predictionResult.predictedValue;
        } else {
            combinedData[idx].flightPrediction = predictionResult.predictedValue;
        }
        combinedData[idx].isPredictionDate = true;
      } else {
        // Handle out of range dates
        const newDataPoint: any = {
          date: selectedDate,
          dayName: new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long' }),
          description: 'Prediksi AI',
          isPredictionDate: true
        };
        // Zero out reference data so only prediction bar shows
        newDataPoint.passengers = 0; 
        newDataPoint.flights = 0;
        
        if (trafficType === TrafficType.PASSENGER) {
            newDataPoint.paxPrediction = predictionResult.predictedValue;
        } else {
            newDataPoint.flightPrediction = predictionResult.predictedValue;
        }
        combinedData.push(newDataPoint);
        combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    }
    return combinedData;
  }, [predictionResult, selectedDate, trafficType, referenceData]);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatYAxisPax = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString();
  };

  const formatYAxisFlight = (value: number) => {
    return value.toLocaleString('id-ID');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs z-50">
          <p className="font-bold text-slate-700 mb-2">{new Date(label).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          {payload.map((entry: any, index: number) => (
             <div key={index} className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-500 capitalize">
                    {entry.name === 'paxPrediction' ? (isSimulation ? 'Agent Auto (Pax)' : 'Forecast (Pax)') : 
                     entry.name === 'flightPrediction' ? (isSimulation ? 'Agent Auto (Flt)' : 'Forecast (Flt)') : 
                     entry.name}
                </span>: 
                <span className="font-bold ml-auto">{entry.value.toLocaleString('id-ID')}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Chart Area */}
      {/* 
         FIX: Set fixed height for Mobile (250px) and Desktop (420px). 
         Removed flex-1 to prevent it from squishing content below.
      */}
      <div className="h-[250px] md:h-[420px] p-4 relative flex flex-col flex-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 flex-none">
            <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  Grafik Batang Komparasi
                </h3>
            </div>
            {predictionResult && (
              <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${isSimulation ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {isSimulation ? (
                         <>
                            <Bot className="w-3 h-3" /> Auto: {predictionResult.appliedScenario}
                         </>
                    ) : (
                        predictionResult.sources && predictionResult.sources.length > 0 ? (
                            <>
                                <Globe className="w-3 h-3" /> Grounded
                            </>
                        ) : (
                            'Normal Mode'
                        )
                    )}
                 </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis} 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickMargin={8}
                />
                <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    stroke={colorPax} 
                    fontSize={10}
                    width={30}
                    tickFormatter={formatYAxisPax}
                />
                <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    stroke={colorFlight} 
                    fontSize={10}
                    width={30}
                    tickFormatter={formatYAxisFlight}
                />
                
                <Tooltip content={<CustomTooltip />} />

                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  iconType="square"
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(value) => {
                      if (value === 'passengers') return 'Pax (Target)';
                      if (value === 'flights') return 'Flt (Target)';
                      if (value === 'paxPrediction') return 'Agent (Pax)';
                      if (value === 'flightPrediction') return 'Agent (Flt)';
                      return value;
                  }}
                />
                
                <ReferenceLine x="2025-12-25" stroke="#ef4444" strokeDasharray="3 3" yAxisId="left" label={{ value: "Natal", position: 'insideTop', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine x="2026-01-01" stroke="#ef4444" strokeDasharray="3 3" yAxisId="left" label={{ value: "Thn Baru", position: 'insideTop', fill: '#ef4444', fontSize: 10 }} />
                
                {/* Reference Bars (Unstacked - Grouped) */}
                <Bar 
                    yAxisId="left"
                    dataKey="passengers" 
                    name="passengers"
                    fill={colorPax}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                />
                
                <Bar 
                    yAxisId="right"
                    dataKey="flights" 
                    name="flights"
                    fill={colorFlight}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                />

                {/* Prediction Bar - Passengers */}
                <Bar 
                    yAxisId="left"
                    dataKey="paxPrediction" 
                    name="paxPrediction"
                    fill={colorPredict}
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                />

                {/* Prediction Bar - Flights */}
                <Bar 
                    yAxisId="right"
                    dataKey="flightPrediction" 
                    name="flightPrediction"
                    fill={colorPredict}
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Analysis Section (Responsive Grid) */}
      {/* 
         FIX: h-auto on ALL devices. No scrolling inside small boxes. 
         Let the page scroll naturally. 
      */}
      <div className="border-t border-slate-200 bg-slate-50/50 p-4 h-auto flex flex-col justify-center flex-none">
        {predictionResult ? (
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto">
              
              {/* Col 1: Comparison Stats (20%) */}
              <div className="col-span-1 md:col-span-3 flex flex-row md:flex-col gap-3 h-auto justify-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between flex-1 md:flex-none md:h-24">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <FileBarChart className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">Target</span>
                      </div>
                      <div className="text-xl font-bold text-slate-700">
                          {originalValue ? originalValue.toLocaleString('id-ID') : 'N/A'}
                      </div>
                  </div>

                  <div className={`p-3 rounded-lg border shadow-sm flex flex-col justify-between flex-1 md:flex-none md:h-24 ${isSimulation ? 'bg-emerald-50 border-emerald-100' : (isPax ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100')}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isSimulation ? 'text-emerald-600' : (isPax ? 'text-indigo-600' : 'text-orange-600')}`}>
                          {isSimulation ? <Bot className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          <span className="text-[10px] font-bold uppercase">{isSimulation ? 'Agent Auto' : 'Forecast'}</span>
                      </div>
                      <div className={`text-xl font-bold ${isSimulation ? 'text-emerald-700' : (isPax ? 'text-indigo-700' : 'text-orange-700')}`}>
                          {predictionResult.predictedValue.toLocaleString('id-ID')}
                      </div>
                      {originalValue !== null && (
                         <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString('id-ID')}
                         </div>
                      )}
                  </div>
              </div>

              {/* Col 2: Reasoning (40%) */}
              <div className="col-span-1 md:col-span-4 h-auto">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
                    <div className="flex gap-2 items-center mb-3 pb-1 border-b border-slate-50">
                        <Info className="w-4 h-4 text-slate-400" />
                        <h5 className="text-xs font-bold text-slate-700">Reasoning & Impact</h5>
                    </div>
                    {/* AUTO DETECTED EVENT ALERT */}
                    {predictionResult.detectedEvent && predictionResult.appliedScenario !== 'Normal Operations' && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3 flex gap-2 items-start">
                             <Zap className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-none" />
                             <div>
                                 <div className="text-[10px] font-bold text-amber-700 uppercase">Agent Detected</div>
                                 <div className="text-xs text-amber-900 leading-tight mt-0.5">{predictionResult.detectedEvent}</div>
                             </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {predictionResult.reasoning}
                    </p>

                    {/* AGENTIC SOURCES UI */}
                    {predictionResult.sources && predictionResult.sources.length > 0 && (
                        <div className="mt-auto border-t border-slate-100 pt-3">
                             <div className="text-[9px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Agent Sources
                             </div>
                             <ul className="space-y-1.5">
                                {predictionResult.sources.slice(0, 3).map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 group cursor-pointer">
                                        <ExternalLink className="w-3 h-3 text-indigo-400 mt-0.5 flex-none" />
                                        <a href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 group-hover:underline group-hover:text-indigo-700 block w-full leading-tight" title={s.title}>
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}
                </div>
              </div>

              {/* Col 3: Macro Analysis (40%) */}
              <div className="col-span-1 md:col-span-5 h-auto">
                 <div className={`bg-gradient-to-br p-4 rounded-lg border shadow-sm h-full ${isSimulation ? 'from-white to-emerald-50 border-emerald-100' : 'from-white to-slate-50 border-slate-200'}`}>
                    <div className="flex gap-2 items-center mb-3 pb-1 border-b border-white/50">
                        <Lightbulb className={`w-4 h-4 ${isSimulation ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <h5 className="text-xs font-bold text-slate-800">
                           {isSimulation ? 'Rekomendasi Mitigasi Otonom' : 'Analisis Makro & Rekomendasi'}
                        </h5>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                        {predictionResult.comprehensiveAnalysis}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center">
                        <div>
                             <span className="text-[9px] text-slate-400 uppercase tracking-wider">Confidence Level</span>
                             <div className="text-[10px] font-bold text-slate-700">{predictionResult.confidence}</div>
                        </div>
                        {isSimulation && <Bot className="w-4 h-4 text-emerald-200" />}
                    </div>
                 </div>
              </div>

           </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[100px]">
             <div className="p-3 bg-white rounded-full mb-2 shadow-sm">
                <TrendingUp className="w-5 h-5 text-indigo-200" />
             </div>
             <p className="text-sm font-medium">Area analisis akan muncul di sini.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartSection;