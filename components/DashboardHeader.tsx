import React from 'react';

interface DashboardHeaderProps {
  stats: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ stats }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-4">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Penumpang</p>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800">{stats.totalPassengers2025P}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">+{stats.passengerGrowth}</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-4">
          <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Pesawat</p>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800">{stats.totalFlights2025P}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">+{stats.flightGrowth}</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center gap-3 border-r border-slate-100 last:border-0 pr-4">
          <div className="h-8 w-1 bg-slate-300 rounded-full"></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recovery (Pax)</p>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800">{stats.passengerRecovery}</span>
                <span className="text-[10px] text-slate-400">vs 2019</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-red-400 rounded-full"></div>
          <div>
             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Puncak Arus</p>
             <div className="flex gap-2 text-xs font-semibold">
                <span className="text-red-600">Dep: {stats.peakDeparture}</span>
                <span className="text-amber-600">Arr: {stats.peakReturn}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;