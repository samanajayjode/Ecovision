/**
 * EcoVision - Waste, Plastics & Vegetable Recycling Intelligence Platform
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageScanner } from './components/ImageScanner';
import { DatabaseView } from './components/DatabaseView';
import { ImpactDashboard } from './components/ImpactDashboard';
import { PlasticsGuide } from './components/PlasticsGuide';
import { TrainMode } from './components/TrainMode';
import { AnalysisResult, RecycledLogEntry } from './types';
import { Leaf, Sprout, Heart, ShieldCheck, Camera } from 'lucide-react';
import { resolveMunicipalBin } from './data/municipalBins';

const LOCAL_STORAGE_KEY = 'ecovision_logged_items_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'database' | 'tracker' | 'guide' | 'train'>('scanner');
  const [logs, setLogs] = useState<RecycledLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load local logs:', e);
    }
    // Initial sample record to demonstrate value
    return [
      {
        id: 'init-1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        itemName: 'Carrot Tops & Organic Vegetable Scraps',
        category: 'vegetable',
        co2SavedKg: 0.228,
        weightGrams: 120,
        reusable: true,
        actionTaken: 'Composted for garden soil',
      },
      {
        id: 'init-2',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        itemName: 'PET Plastic Beverage Bottle (#1)',
        category: 'plastic',
        co2SavedKg: 0.065,
        weightGrams: 30,
        reusable: true,
        actionTaken: 'Recycled in Blue Bin',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to persist logs:', e);
    }
  }, [logs]);

  const handleLogNewItem = (
    result: AnalysisResult,
    actionTaken: string = 'Properly Diverted',
    imageUrl?: string
  ) => {
    const bin =
      result.bin_classification ||
      resolveMunicipalBin(result.category, result.detected_name, result.bin_type);

    const newEntry: RecycledLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      itemName: result.detected_name,
      category: result.category,
      co2SavedKg: result.metrics?.co2_saved_kg ?? 0.05,
      weightGrams: result.metrics?.estimated_weight_grams ?? 50,
      reusable: result.is_reusable ?? false,
      actionTaken: actionTaken || (bin ? `Sorted to ${bin.color_name} Bin` : 'Properly Diverted'),
      imageUrl: imageUrl || result.image_preview_url,
      binColor: bin?.bin_color,
      binColorName: bin?.color_name,
      binEmoji: bin?.color_emoji,
      resinCode: result.resin_code,
      specificMaterial: result.material_spec?.specific_name,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear your logged impact history?')) {
      setLogs([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const totalCo2Saved = logs.reduce((sum, item) => sum + item.co2SavedKg, 0);
  const itemsDiverted = logs.length;

  const handleLogoClick = () => {
    setActiveTab('scanner');
    // Notify ImageScanner to reset to clean "Use Camera / Browse Files" view and scroll to it
    window.dispatchEvent(new CustomEvent('ecovision:reset-to-scanner'));
  };

  return (
    <div className="min-h-screen bg-[#F4F7F2] text-[#2D3A2D] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalCo2Saved={totalCo2Saved}
        itemsDiverted={itemsDiverted}
        onLogoClick={handleLogoClick}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'scanner' && (
          <ImageScanner onLogNewItem={handleLogNewItem} />
        )}

        {activeTab === 'database' && <DatabaseView />}

        {activeTab === 'tracker' && (
          <ImpactDashboard
            logs={logs}
            onClearLogs={handleClearLogs}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'guide' && <PlasticsGuide />}

        {activeTab === 'train' && (
          <TrainMode onApplyModelToScanner={() => setActiveTab('scanner')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#DDE3D9] mt-12 py-8 text-[#5C6B5C] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={handleLogoClick}
            title="Scan item with Camera or Browse Files"
          >
            <div className="w-6 h-6 rounded-full bg-[#4F7942] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1A241A] font-['Space_Grotesk'] tracking-tight group-hover:text-[#4F7942] transition-colors">
              ECO<span className="text-[#4F7942]">VISION</span> Intelligence
            </span>
            <span className="text-[#DDE3D9]">&middot;</span>
            <span className="text-[#5C6B5C]">
              Python ML Analytics + Material Intelligence
            </span>
          </div>

          <div className="flex items-center gap-6 text-[#7A8A7A]">
            <span>Geometric Balance Edition</span>
            <span>EPA WARM Model Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
