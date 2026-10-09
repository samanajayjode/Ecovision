import React, { useState, useMemo } from 'react';
import {
  Activity,
  Recycle,
  Trash2,
  Calendar,
  Sparkles,
  Sprout,
  Search,
  Filter,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { RecycledLogEntry } from '../types';

interface ImpactDashboardProps {
  logs: RecycledLogEntry[];
  onClearLogs: () => void;
  onNavigateToScanner: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  logs,
  onClearLogs,
  onNavigateToScanner,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const totalCo2Saved = logs.reduce((sum, item) => sum + item.co2SavedKg, 0);
  const totalItems = logs.length;
  const totalWeightGrams = logs.reduce((sum, item) => sum + item.weightGrams, 0);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) {
        return false;
      }
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = log.itemName.toLowerCase().includes(query);
        const matchesAction = (log.actionTaken || '').toLowerCase().includes(query);
        const matchesMaterial = (log.specificMaterial || '').toLowerCase().includes(query);
        return matchesName || matchesAction || matchesMaterial;
      }
      return true;
    });
  }, [logs, categoryFilter, searchFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#4F7942] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        {/* Geometric Balance circles background */}
        <div className="hidden sm:flex absolute -right-6 -bottom-6 w-48 h-48 border-4 border-white/20 rounded-full items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white/30 rounded-full rotate-45 flex items-center justify-center">
            <div className="w-16 h-16 border border-white/40 rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/20">
              <Activity className="w-3.5 h-3.5" />
              <span>Personal Environmental Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              Your Eco Impact &amp; Carbon Savings
            </h2>
            <p className="text-white/85 text-sm mt-2 leading-relaxed">
              Track cumulative carbon emissions averted, energy conserved, and materials diverted automatically whenever you analyze an item.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-xs border border-white/20 p-5 rounded-2xl text-center min-w-[170px]">
            <span className="text-[10px] text-white/80 uppercase font-bold tracking-widest block">Total CO₂e Saved</span>
            <div className="text-3xl font-bold text-white mt-1">
              {totalCo2Saved.toFixed(3)} <span className="text-xs font-semibold text-white/80">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#DDE3D9] shadow-xs">
          <div className="w-9 h-9 rounded-full bg-[#E8EDE6] text-[#4F7942] flex items-center justify-center mb-3">
            <Recycle className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-[#7A8A7A] uppercase font-bold tracking-wider block">Items Diverted</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#1A241A] mt-1 font-['Space_Grotesk']">{totalItems}</div>
          <span className="text-[11px] text-[#5C6B5C] mt-0.5 block">Total logged scans</span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#DDE3D9] shadow-xs">
          <div className="w-9 h-9 rounded-full bg-[#E8EDE6] text-[#4F7942] flex items-center justify-center mb-3">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-[#7A8A7A] uppercase font-bold tracking-wider block">Total Material Diverted</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#1A241A] mt-1 font-['Space_Grotesk']">
            {totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(2)} kg` : `${totalWeightGrams} g`}
          </div>
          <span className="text-[11px] text-[#5C6B5C] mt-0.5 block">Cumulative mass processed</span>
        </div>
      </div>

      {/* Item Activity Log */}
      <div className="bg-white rounded-3xl border border-[#DDE3D9] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-[#4F7942] pl-3">
          <div>
            <h3 className="text-base font-bold text-[#1A241A] flex items-center gap-2">
              <span>Activity History</span>
              <span className="text-xs font-bold text-[#4F7942] bg-[#E8EDE6] px-2.5 py-0.5 rounded-full border border-[#DDE3D9]">
                {logs.length} Scans Stored
              </span>
            </h3>
            <p className="text-xs text-[#5C6B5C] mt-0.5">
              All scanned items you have diverted or processed
            </p>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs text-[#5C6B5C] hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors font-medium border border-[#DDE3D9] hover:border-rose-300 px-3 py-1.5 rounded-full bg-[#FBFCFA]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        {logs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#7A8A7A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search scanned items..."
                className="w-full bg-[#F4F7F2] border border-[#DDE3D9] rounded-full pl-8.5 pr-3 py-1.5 text-xs text-[#1A241A] placeholder:text-[#7A8A7A] focus:outline-none focus:border-[#4F7942]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'plastic', label: 'Plastics' },
                { id: 'vegetable', label: 'Organics' },
                { id: 'paper', label: 'Paper' },
                { id: 'glass', label: 'Glass' },
                { id: 'metal', label: 'Metals' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === tab.id
                      ? 'bg-[#1A241A] text-white shadow-2xs'
                      : 'bg-[#F4F7F2] text-[#5C6B5C] border border-[#DDE3D9] hover:border-[#1A241A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of Scanned Items */}
        {logs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#DDE3D9] rounded-2xl bg-[#FBFCFA]">
            <Sprout className="w-10 h-10 text-[#7A8A7A] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-[#1A241A]">
              No items logged yet
            </p>
            <p className="text-xs text-[#5C6B5C] mt-1 max-w-sm mx-auto mb-5 leading-relaxed">
              Every item or vegetable photo you analyze with the Vision Scanner is automatically stored in your Activity History with environmental impact calculations.
            </p>
            <button
              onClick={onNavigateToScanner}
              className="px-6 py-2.5 bg-[#4F7942] hover:bg-[#3e6034] text-white text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all shadow-xs"
            >
              Analyze Your First Item
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#5C6B5C]">
            No items matched your search filter &quot;{searchFilter}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-[#DDE3D9]">
            {filteredLogs.map((log) => {
              const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs group hover:bg-[#F4F7F2]/50 rounded-xl px-2.5 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail Image or Icon */}
                    {log.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#DDE3D9] overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={log.imageUrl}
                          alt={log.itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#E8EDE6] text-[#4F7942] border border-[#DDE3D9] flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                        {log.binEmoji || (log.category === 'vegetable' ? '🥬' : log.category === 'plastic' ? '♳' : '♻️')}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <strong className="font-bold text-[#1A241A] text-sm truncate">
                          {log.itemName}
                        </strong>

                        {/* Resin or Bin Badge */}
                        {log.binColorName && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                              log.binColor === 'green'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                : log.binColor === 'blue'
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : log.binColor === 'red'
                                ? 'bg-rose-50 text-rose-900 border-rose-200'
                                : 'bg-stone-100 text-stone-900 border-stone-300'
                            }`}
                          >
                            <span>{log.binEmoji || '📦'}</span>
                            <span>{log.binColorName} Bin</span>
                          </span>
                        )}

                        {log.resinCode && log.resinCode > 0 && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#1A241A] text-white">
                            RIC #{log.resinCode}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#5C6B5C] flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-[#7A8A7A]">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>&middot;</span>
                        <span className="text-[#1A241A] font-medium">
                          {log.actionTaken}
                        </span>
                        {log.specificMaterial && (
                          <>
                            <span>&middot;</span>
                            <span className="text-[#4F7942] font-medium">{log.specificMaterial}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pl-15 sm:pl-0 pt-1 sm:pt-0">
                    <span className="font-bold text-[#4F7942] block text-sm">
                      +{log.co2SavedKg.toFixed(3)} kg CO₂e
                    </span>
                    <span className="text-[11px] text-[#7A8A7A]">
                      {log.weightGrams}g mass diverted
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
