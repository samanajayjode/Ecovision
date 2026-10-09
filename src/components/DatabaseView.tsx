import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sprout,
  Recycle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChefHat,
  Droplets,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';
import { DatabaseItem } from '../types';

export const DatabaseView: React.FC = () => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<DatabaseItem | null>(null);

  useEffect(() => {
    fetch('/api/database')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load database');
        return res.json();
      })
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching database:', err);
        setError('Could not fetch database records. Ensure the Python backend is running.');
        setLoading(false);
      });
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructions.some((ins) =>
        ins.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (item.category === 'plastic' && searchQuery.includes(String(item.resin_code)));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'vegetable', label: 'Vegetables & Organics' },
    { id: 'plastic', label: 'Plastics (#1 - #7)' },
    { id: 'glass', label: 'Glass' },
    { id: 'metal', label: 'Metals' },
    { id: 'paper', label: 'Paper & Cardboard' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner with Vegetable Recycling Emphasis */}
      <div className="bg-[#4F7942] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
        {/* Geometric Balance Circle Accent */}
        <div className="hidden sm:flex absolute -right-6 -bottom-6 w-48 h-48 border-4 border-white/20 rounded-full items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white/30 rounded-full rotate-45 flex items-center justify-center">
            <div className="w-16 h-16 border border-white/40 rounded-full"></div>
          </div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/20">
            <Sprout className="w-3.5 h-3.5" />
            <span>Curated Waste &amp; Vegetable Scrap Knowledgebase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            Recycling &amp; Vegetable Database
          </h2>
          <p className="text-white/85 text-sm mt-2 leading-relaxed max-w-2xl">
            Explore recyclability, resin codes, decomposition timelines, and carbon mitigation metrics. Learn how kitchen vegetable scraps like carrot greens, onion skins, and potato peels can be transformed into culinary broth, regrown on windowsills, or composted to stop methane emissions.
          </p>
        </div>
      </div>

      {/* Vegetable Highlight Section */}
      <div className="bg-white border border-[#DDE3D9] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4F7F2] rounded-bl-[60px] border-l border-b border-[#DDE3D9] pointer-events-none hidden sm:block"></div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8EDE6] text-[#4F7942] flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A241A] tracking-tight">
                Vegetable Waste &amp; Kitchen Scrap Spotlight
              </h3>
              <p className="text-xs text-[#5C6B5C]">
                Why landfilling vegetables produces dangerous methane and how upcycling heals soil
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('vegetable');
              setSearchQuery('');
            }}
            className="text-xs font-bold uppercase tracking-wider text-[#4F7942] bg-[#E8EDE6] hover:bg-[#DDE3D9] px-4 py-2 rounded-full border border-[#DDE3D9] cursor-pointer transition-all"
          >
            Filter Vegetables Only
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-[#2D3A2D]">
          <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#DDE3D9]">
            <strong className="font-bold text-[#1A241A] block mb-1">
              1. Freezer Scrap Broth
            </strong>
            <p className="text-[#5C6B5C] leading-relaxed text-[11px]">
              Store carrot trimmings, onion skins, celery tops, and mushroom stems in a freezer bag. Simmer with water for 45 mins to produce golden culinary stock.
            </p>
          </div>
          <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#DDE3D9]">
            <strong className="font-bold text-[#1A241A] block mb-1">
              2. Regrowing from Stems
            </strong>
            <p className="text-[#5C6B5C] leading-relaxed text-[11px]">
              Carrot tops, scallions, leeks, and celery bases sprout roots in just 1/2 inch of water on a sunny sill. Enjoy free perpetual kitchen greens!
            </p>
          </div>
          <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#DDE3D9]">
            <strong className="font-bold text-[#1A241A] block mb-1">
              3. Methane Prevention
            </strong>
            <p className="text-[#5C6B5C] leading-relaxed text-[11px]">
              Organics rotting anaerobically in landfills create methane (CH₄), 28x more potent than CO₂. Composting keeps it aerobic, locking nutrients back into organic soil.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#DDE3D9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7A8A7A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vegetable, plastic resin (#1-#7), bottle, metal, glass..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-full border border-[#DDE3D9] focus:outline-none focus:ring-2 focus:ring-[#4F7942] text-[#1A241A] bg-[#FBFCFA]"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A241A] text-white shadow-xs'
                  : 'bg-[#E8EDE6] hover:bg-[#DDE3D9] text-[#2D3A2D]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Database Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#5C6B5C] bg-white rounded-3xl border border-[#DDE3D9]">
          <Recycle className="w-8 h-8 animate-spin mx-auto mb-2 text-[#4F7942]" />
          <p className="text-xs">Querying Python material database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-800 rounded-3xl border border-rose-200 text-xs">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-[#5C6B5C] bg-white rounded-3xl border border-[#DDE3D9]">
          <p className="text-sm">No materials or vegetables match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isVeg = item.category === 'vegetable';
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#DDE3D9] p-6 hover:border-[#4F7942] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#DDE3D9] ${
                        isVeg
                          ? 'bg-[#E8EDE6] text-[#4F7942]'
                          : item.category === 'plastic'
                          ? 'bg-[#1A241A] text-white'
                          : 'bg-[#F4F7F2] text-[#2D3A2D]'
                      }`}
                    >
                      {item.category}
                      {item.is_plastic && item.resin_code > 0 ? ` #${item.resin_code}` : ''}
                    </span>
                    <span className="text-[11px] text-[#5C6B5C] flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {item.decomposition_years >= 1
                        ? `${item.decomposition_years} yrs`
                        : `${Math.round(item.decomposition_years * 52)} wks`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1A241A] mb-1 tracking-tight">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[#5C6B5C] mb-3">
                    Bin: <strong className="text-[#1A241A] font-bold">{item.bin_type}</strong>
                  </p>

                  <div className="space-y-1.5 text-xs text-[#2D3A2D] mb-4">
                    <div className="flex items-center justify-between text-[11px] bg-[#F4F7F2] p-2.5 rounded-2xl border border-[#DDE3D9]">
                      <span className="text-[#5C6B5C]">Benchmark CO₂ saved:</span>
                      <strong className="text-[#4F7942] font-bold">{item.benchmark_100g_co2_saved} kg / 100g</strong>
                    </div>
                  </div>

                  {/* Upcycling highlight */}
                  {item.upcycling_ideas && item.upcycling_ideas.length > 0 && (
                    <div className="bg-[#FBFCFA] p-3.5 rounded-2xl border border-[#DDE3D9] mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F7942] flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3" />
                        Featured Upcycling Idea
                      </span>
                      <p className="text-xs font-bold text-[#1A241A]">
                        {item.upcycling_ideas[0].title}
                      </p>
                      <p className="text-[11px] text-[#5C6B5C] mt-0.5 line-clamp-2">
                        {item.upcycling_ideas[0].summary}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveItem(item)}
                  className="w-full mt-2 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-[#1A241A] bg-[#E8EDE6] hover:bg-[#DDE3D9] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>View Full Protocol</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-[#1A241A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4 shadow-xl border border-[#DDE3D9]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#E8EDE6] text-[#4F7942] border border-[#DDE3D9]">
                  {activeItem.category}
                </span>
                <h3 className="text-2xl font-bold text-[#1A241A] mt-2 font-['Space_Grotesk']">
                  {activeItem.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-[#F4F7F2] hover:bg-[#DDE3D9] text-[#1A241A] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-4 rounded-2xl bg-[#F4F7F2] border border-[#DDE3D9] text-xs">
              <div>
                <span className="text-[10px] text-[#5C6B5C] uppercase font-bold tracking-wider block">Decomposition</span>
                <strong className="text-[#1A241A] font-bold">
                  {activeItem.decomposition_years >= 1
                    ? `${activeItem.decomposition_years} Years`
                    : `${Math.round(activeItem.decomposition_years * 52)} Weeks`}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#5C6B5C] uppercase font-bold tracking-wider block">Recyclability</span>
                <strong className="text-[#4F7942] font-bold">{activeItem.recyclability}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#5C6B5C] uppercase font-bold tracking-wider block">Destination</span>
                <strong className="text-[#1A241A] font-bold">{activeItem.bin_type}</strong>
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5C] mb-2">
                Step-by-Step Preparation Protocol
              </h4>
              <ul className="space-y-2 text-xs text-[#2D3A2D]">
                {activeItem.instructions.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#DDE3D9]">
                    <CheckCircle2 className="w-4 h-4 text-[#4F7942] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contamination warnings */}
            {activeItem.contamination_alerts && activeItem.contamination_alerts.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                <strong className="font-bold block mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Contamination Hazards
                </strong>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  {activeItem.contamination_alerts.map((alert, aIdx) => (
                    <li key={aIdx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcycling ideas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B5C] mb-2">
                Creative Upcycling &amp; Reuse Ideas
              </h4>
              <div className="space-y-2">
                {activeItem.upcycling_ideas.map((idea, iIdx) => (
                  <div key={iIdx} className="p-3.5 rounded-2xl border border-[#DDE3D9] bg-[#FBFCFA]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A241A] mb-1">
                      <span>{idea.title}</span>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-[#DDE3D9] text-[#5C6B5C]">
                        {idea.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6B5C]">{idea.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveItem(null)}
              className="w-full py-3 bg-[#1A241A] hover:bg-[#2D3A2D] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
