
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';
import { DailyData, TrafficType, PredictionResult } from '../types';
import { TrendingUp, Info, FileBarChart, Lightbulb } from 'lucide-react';

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
  const colorPredict = '#4f46e5'; // Indigo

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
                    {entry.name === 'paxPrediction' ? 'Forecast (Pax)' : 
                     entry.name === 'flightPrediction' ? 'Forecast (Flt)' : 
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
      <div className="flex-1 p-4 min-h-0 flex flex-col relative">
          <div className="flex justify-between items-center mb-2">
            <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  Grafik Batang Komparasi (Forecast vs Target)
                </h3>
            </div>
            {predictionResult && (
              <div className="flex items-center gap-2">
                 <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    <span className="w-2 h-2 bg-indigo-600 rounded-sm"></span> Forecast AI
                 </span>
                 <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Aktif
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
                    fontSize={11} 
                    tickMargin={8}
                />
                <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    stroke={colorPax} 
                    fontSize={11}
                    width={35}
                    tickFormatter={formatYAxisPax}
                />
                <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    stroke={colorFlight} 
                    fontSize={11}
                    width={35}
                    tickFormatter={formatYAxisFlight}
                />
                
                <Tooltip content={<CustomTooltip />} />

                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  iconType="square"
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => {
                      if (value === 'passengers') return 'Penumpang (Target)';
                      if (value === 'flights') return 'Pesawat (Target)';
                      if (value === 'paxPrediction') return 'Forecast (Pax)';
                      if (value === 'flightPrediction') return 'Forecast (Flt)';
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

      {/* Analysis Section (Compact 3-Col Grid) */}
      <div className="border-t border-slate-200 bg-slate-50/50 p-4 h-[190px] flex flex-col justify-center">
        {predictionResult ? (
           <div className="grid grid-cols-12 gap-4 h-full">
              
              {/* Col 1: Comparison Stats (25%) */}
              <div className="col-span-12 md:col-span-3 flex flex-col gap-3 h-full justify-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between flex-1">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <FileBarChart className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">Target</span>
                      </div>
                      <div className="text-xl font-bold text-slate-700">
                          {originalValue ? originalValue.toLocaleString('id-ID') : 'N/A'}
                      </div>
                  </div>

                  <div className={`p-3 rounded-lg border shadow-sm flex flex-col justify-between flex-1 ${isPax ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isPax ? 'text-indigo-600' : 'text-orange-600'}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">Forecast AI</span>
                      </div>
                      <div className={`text-xl font-bold ${isPax ? 'text-indigo-700' : 'text-orange-700'}`}>
                          {predictionResult.predictedValue.toLocaleString('id-ID')}
                      </div>
                      {originalValue !== null && (
                         <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString('id-ID')}
                            <span className="opacity-70">vs Target</span>
                         </div>
                      )}
                  </div>
              </div>

              {/* Col 2: Reasoning (35%) */}
              <div className="col-span-12 md:col-span-4 h-full">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm h-full overflow-y-auto">
                    <div className="flex gap-2 items-center mb-2 sticky top-0 bg-white pb-1">
                        <Info className="w-4 h-4 text-slate-400" />
                        <h5 className="text-xs font-bold text-slate-700">Reasoning (Alasan)</h5>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {predictionResult.reasoning}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 border-t pt-1">
                        Confidence: <span className="font-medium text-slate-600">{predictionResult.confidence}</span>
                    </div>
                </div>
              </div>

              {/* Col 3: Macro Analysis (40%) */}
              <div className="col-span-12 md:col-span-5 h-full">
                 <div className="bg-gradient-to-br from-white to-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm h-full overflow-y-auto">
                    <div className="flex gap-2 items-center mb-2 sticky top-0 bg-white/50 backdrop-blur-sm pb-1">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <h5 className="text-xs font-bold text-slate-800">Analisis Makro & Rekomendasi</h5>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                        {predictionResult.comprehensiveAnalysis}
                    </p>
                 </div>
              </div>

           </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <div className="p-3 bg-white rounded-full mb-2 shadow-sm">
                <TrendingUp className="w-5 h-5 text-indigo-200" />
             </div>
             <p className="text-sm font-medium">Area analisis akan muncul di sini setelah prediksi dijalankan.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartSection;
