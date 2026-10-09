import React from 'react';
import { Scan, Activity, Camera, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'database' | 'tracker' | 'guide' | 'train';
  onSelectTab: (tab: 'scanner' | 'database' | 'tracker' | 'guide' | 'train') => void;
  totalCo2Saved: number;
  itemsDiverted: number;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  totalCo2Saved,
  itemsDiverted,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DDE3D9] text-[#1A241A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onLogoClick || (() => onSelectTab('scanner'))}
            title="Open Camera & File Scanner"
          >
            <div className="w-10 h-10 bg-[#4F7942] rounded-full flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A241A] font-['Space_Grotesk']">
                  ECO<span className="text-[#4F7942]">VISION</span>
                </span>
              </div>
              <p className="text-[11px] text-[#5C6B5C] hidden md:block tracking-wide">
                AI-Powered Waste Material Intelligence
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#5C6B5C]">
            <button
              id="nav-tab-scanner"
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'scanner'
                  ? 'text-[#4F7942] border-b-2 border-[#4F7942] pb-1'
                  : 'hover:text-[#4F7942] pb-1 border-b-2 border-transparent'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>

            <button
              id="nav-tab-guide"
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'text-[#4F7942] border-b-2 border-[#4F7942] pb-1'
                  : 'hover:text-[#4F7942] pb-1 border-b-2 border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Items</span>
            </button>

            <button
              id="nav-tab-tracker"
              onClick={() => onSelectTab('tracker')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'tracker'
                  ? 'text-[#4F7942] border-b-2 border-[#4F7942] pb-1'
                  : 'hover:text-[#4F7942] pb-1 border-b-2 border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>History</span>
              {itemsDiverted > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#4F7942] text-white text-[9px] font-bold flex items-center justify-center">
                  {itemsDiverted}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
