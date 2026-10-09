import React, { useState, useEffect, useRef } from 'react';
import {
  Recycle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Zap,
  Clock,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Package,
  Brain,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Info,
  Layers,
  CheckCircle2,
  HelpCircle,
  Play,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult, AIChatMessage } from '../types';
import { resolveMunicipalBin, MUNICIPAL_BIN_STANDARDS } from '../data/municipalBins';

interface AnalysisResultCardProps {
  result: AnalysisResult;
  onLogItem: (action: string) => void;
  isLogged: boolean;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onLogItem,
  isLogged,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('recycled');

  // AI Chat Assistant state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am EcoVision's AI Specialist. Ask me anything about preparing, recycling, cleaning, or upcycling this ${result.material_spec?.specific_name || result.detected_name}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Stop speech when component unmounts or result changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [result]);

  useEffect(() => {
    if (isChatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      const totalSteps = result.preparation_protocol?.length || result.recycling_instructions.length;
      if (next.length === totalSteps) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#4F7942', '#10b981', '#34d399'],
        });
      }
      return next;
    });
  };

  const handleLogClick = () => {
    if (isLogged) return;
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#f59e0b'],
    });
    onLogItem(selectedAction);
  };

  // AI Chat Assistant Send
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim();
    if (!textToSend || isChatLoading) return;

    const userMsg: AIChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            itemName: result.detected_name,
            material: result.material_spec?.specific_name || result.category,
            recyclability: result.recyclability?.curbside_acceptance || result.recyclability_status,
            binType: result.bin_type,
            cleanliness: result.cleanliness?.visual_condition || 'Inspected',
          },
        }),
      });

      const data = await response.json();
      const botMsg: AIChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || 'Please rinse this item clean and place it loose into your recycling bin.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: AIChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: 'To recycle this properly: empty contents completely, swirl with a little water, and place loose in your blue recycling bin.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const isVegetable =
    result.category === 'vegetable' ||
    result.detected_name.toLowerCase().includes('carrot') ||
    result.detected_name.toLowerCase().includes('vegetable') ||
    result.detected_name.toLowerCase().includes('peel');

  // Resolved specific material (Guaranteed never to say "OTHERS" or generic "other")
  const specificMaterial =
    result.material_spec?.specific_name ||
    (result.is_plastic && result.resin_code > 0
      ? `Resin #${result.resin_code} Polymer`
      : isVegetable
      ? 'Organic Vegetable Biomass'
      : result.detected_name);

  // Resolved material category
  const resolvedCategory =
    result.material_spec?.category ||
    (result.is_plastic ? 'Plastic Polymer' : isVegetable ? 'Organic Biomass' : result.category);

  // Recyclability & Bin Classification Standards
  const recyclabilityScore = result.recyclability?.score ?? (result.is_plastic ? 94 : isVegetable ? 98 : 88);
  const recyclabilityGrade = result.recyclability?.grade ?? (recyclabilityScore >= 90 ? 'A+' : 'A');

  // Resolve Municipal Bin Stream (🟢 Green, 🔵 Blue, 🔴 Red, ⚫ Black/Grey)
  const binClassification =
    result.bin_classification ||
    resolveMunicipalBin(result.category, result.detected_name, result.bin_type);

  const preparationSteps = result.preparation_protocol && result.preparation_protocol.length > 0
    ? result.preparation_protocol
    : result.recycling_instructions.map((inst, idx) => ({
        step_number: idx + 1,
        phase: idx === 0 ? 'Empty & Scrape' : idx === 1 ? 'Rinse & Clean' : idx === 2 ? 'Separate Components' : 'Bin Placement',
        instruction: inst,
        detail: 'Key step to prevent sorting facility contamination.',
        is_critical: idx === 0 || idx === 1,
      }));

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-[#DDE3D9] overflow-hidden relative">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 bg-[#F4F7F2] border-b border-[#DDE3D9] relative overflow-hidden">
        {/* Subtle geometric corner accent */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/40 rounded-bl-[70px] border-l border-b border-[#DDE3D9] pointer-events-none hidden sm:block"></div>

        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-[280px]">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {/* Specific Category Badge (NEVER generic "OTHER") */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#E8EDE6] text-[#4F7942] border border-[#DDE3D9]">
                {isVegetable ? <Sprout className="w-3.5 h-3.5" /> : <Recycle className="w-3.5 h-3.5" />}
                {resolvedCategory}
              </span>

              {result.is_plastic && result.resin_code > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#1A241A] text-white">
                  Resin #{result.resin_code}
                </span>
              )}

              {/* Recyclability Score Pill */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle className="w-3 h-3 text-emerald-700" />
                <span>Score: {recyclabilityScore}/100 ({recyclabilityGrade})</span>
              </span>

              {/* Automatically Stored in History Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8EDE6] text-[#4F7942] border border-[#DDE3D9]">
                <Check className="w-3.5 h-3.5 text-[#4F7942]" />
                <span>Stored in Activity History</span>
              </span>
            </div>

            {/* Main Detected Name */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A241A] tracking-tight font-['Space_Grotesk']">
              {result.detected_name}
            </h2>

            {/* Recommended Bin */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-[#5C6B5C]">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#4F7942]" />
                <span>Recommended Stream: </span>
                <strong className="text-[#1A241A] font-bold bg-white px-2.5 py-0.5 rounded-lg border border-[#DDE3D9]">
                  {binClassification.color_emoji} {binClassification.color_name} Bin ({binClassification.waste_category})
                </strong>
              </span>
            </div>
          </div>

          {/* Assistant Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-chat"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isChatOpen
                  ? 'bg-[#1A241A] text-white border-[#1A241A]'
                  : 'bg-white border-[#DDE3D9] text-[#1A241A] hover:bg-[#E8EDE6]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#4F7942]" />
              <span>Ask EcoAI</span>
            </button>
          </div>
        </div>

        {/* 3 Material Intelligence Cards (Never "OTHERS") */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#DDE3D9]">
          {/* Card 1: Precise Material Identification */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE3D9] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#7A8A7A] uppercase tracking-widest block font-bold">
                Specific Material Type
              </span>
              <div className="font-bold text-[#1A241A] text-sm mt-1 leading-snug">
                {specificMaterial}
              </div>
            </div>
            {result.material_spec?.composition_breakdown && (
              <div className="text-[11px] text-[#5C6B5C] mt-2 pt-2 border-t border-stone-100 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#4F7942] shrink-0" />
                <span className="truncate">{result.material_spec.composition_breakdown}</span>
              </div>
            )}
          </div>

          {/* Card 2: Recyclability & Municipal Acceptance */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE3D9] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#7A8A7A] uppercase tracking-widest block font-bold">
                Recyclability Verdict
              </span>
              <div className="font-bold text-[#4F7942] text-sm mt-1">
                {result.recyclability_status}
              </div>
            </div>
            <div className="text-[11px] text-[#5C6B5C] mt-2 pt-2 border-t border-stone-100">
              {result.recyclability?.curbside_acceptance || 'Accepted in standard recycling infrastructure'}
            </div>
          </div>

          {/* Card 3: Designated Bin & Color (Replaces Waste Cleanliness Level) */}
          <div className="bg-white p-4 rounded-2xl border border-[#DDE3D9] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#7A8A7A] uppercase tracking-widest block font-bold">
                Designated Bin &amp; Color
              </span>
              <div className="font-bold text-[#1A241A] text-sm mt-1 flex items-center gap-2">
                <span className="text-2xl leading-none">{binClassification.color_emoji}</span>
                <div>
                  <div className="text-sm font-bold text-[#1A241A] leading-tight">
                    {binClassification.color_name} Bin
                  </div>
                  <div className="text-[11px] font-semibold text-[#4F7942]">
                    {binClassification.waste_category}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#5C6B5C] mt-2 pt-2 border-t border-stone-100 flex items-center gap-1">
              <span className="font-bold text-[#1A241A]">Destination:</span>
              <span className="truncate" title={binClassification.final_destination}>
                {binClassification.final_destination}
              </span>
            </div>
          </div>
        </div>

        {/* Municipal Color-Coded Bin Classification & Final Destination Standards Guide */}
        <div className="mt-4 bg-white/95 rounded-2xl p-4 sm:p-5 border border-[#DDE3D9] shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DDE3D9]">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#4F7942]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#1A241A] font-['Space_Grotesk'] tracking-tight">
                Municipal Bin Color &amp; Waste Category Standards
              </h4>
            </div>
            <span className="text-[10px] font-bold text-[#4F7942] uppercase tracking-wider bg-[#E8EDE6] px-2.5 py-0.5 rounded-full border border-[#DDE3D9]">
              Assigned: {binClassification.color_emoji} {binClassification.color_name} Bin
            </span>
          </div>

          {/* 4-Stream Responsive Grid with full details: Bin Color, Waste Category, Primary Examples, Final Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {MUNICIPAL_BIN_STANDARDS.map((bin) => {
              const isAssigned = bin.bin_color === binClassification.bin_color;
              return (
                <div
                  key={bin.bin_color}
                  className={`rounded-2xl p-3.5 text-xs transition-all relative flex flex-col justify-between ${
                    isAssigned
                      ? bin.bin_color === 'green'
                        ? 'bg-emerald-50/95 border-2 border-emerald-500 shadow-xs'
                        : bin.bin_color === 'blue'
                        ? 'bg-blue-50/95 border-2 border-blue-500 shadow-xs'
                        : bin.bin_color === 'red'
                        ? 'bg-rose-50/95 border-2 border-rose-500 shadow-xs'
                        : 'bg-stone-100 border-2 border-stone-600 shadow-xs'
                      : 'bg-[#F9FBF8] border border-[#E2E8DE] opacity-80 hover:opacity-100'
                  }`}
                >
                  {isAssigned && (
                    <span
                      className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                        bin.bin_color === 'green'
                          ? 'bg-emerald-700'
                          : bin.bin_color === 'blue'
                          ? 'bg-blue-700'
                          : bin.bin_color === 'red'
                          ? 'bg-rose-700'
                          : 'bg-stone-800'
                      }`}
                    >
                      ★ Designated Bin
                    </span>
                  )}

                  <div>
                    {/* Bin Color Title */}
                    <div className="flex items-center gap-1.5 font-bold text-[#1A241A] mb-1">
                      <span className="text-base">{bin.color_emoji}</span>
                      <span className="text-sm">{bin.color_name}</span>
                    </div>

                    {/* Waste Category */}
                    <div className="text-[11px] font-bold text-[#2D3A2D] mb-2 pb-1.5 border-b border-stone-200/80">
                      {bin.waste_category}
                    </div>

                    {/* Primary Examples */}
                    <div className="text-[11px] text-[#5C6B5C] mb-2 leading-relaxed">
                      <span className="font-bold text-[#1A241A] block text-[10px] uppercase tracking-wider text-[#7A8A7A] mb-0.5">
                        Primary Examples:
                      </span>
                      {bin.primary_examples}
                    </div>
                  </div>

                  {/* Final Destination */}
                  <div className="text-[11px] pt-2 border-t border-stone-200/80 mt-1">
                    <span className="font-bold text-[#1A241A] block text-[10px] uppercase tracking-wider text-[#7A8A7A] mb-0.5">
                      Final Destination:
                    </span>
                    <span
                      className={`font-semibold ${
                        isAssigned ? 'text-[#1A241A]' : 'text-[#4F7942]'
                      }`}
                    >
                      {bin.final_destination}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Item Explanation Note */}
          {binClassification.assigned_reason && (
            <div className="mt-3.5 pt-3 border-t border-[#E2E8DE] flex items-start gap-2 text-xs text-[#2D3A2D]">
              <Info className="w-4 h-4 text-[#4F7942] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#1A241A]">Disposal Protocol: </strong>
                <span>{binClassification.assigned_reason}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Chat Drawer (Interactive Feature) */}
      {isChatOpen && (
        <div className="p-6 bg-[#FBFCFA] border-b border-[#DDE3D9]">
          <div className="flex items-center justify-between mb-3 border-l-4 border-[#4F7942] pl-3">
            <h3 className="text-sm font-bold text-[#1A241A] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#4F7942]" />
              Ask EcoVision AI Specialist
            </h3>
            <span className="text-xs text-[#7A8A7A]">Powered by Gemini Multimodal AI</span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              'Can I leave the cap on?',
              'What if this is greasy or stained?',
              'How to compost this in backyard?',
              'How can I reuse this container?',
            ].map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSendChatMessage(chip)}
                className="text-[11px] bg-white border border-[#DDE3D9] hover:border-[#4F7942] text-[#2D3A2D] px-3 py-1 rounded-full cursor-pointer transition-all hover:bg-[#F4F7F2]"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="max-h-56 overflow-y-auto space-y-2.5 p-3.5 rounded-2xl bg-white border border-[#DDE3D9] mb-3 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A241A] text-white rounded-br-none'
                      : 'bg-[#F4F7F2] text-[#1A241A] rounded-bl-none border border-[#DDE3D9]'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[#7A8A7A] mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-[#5C6B5C] italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-[#4F7942] animate-spin" />
                <span>EcoVision AI is analyzing your question...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask about sorting, cleaning, grease, caps, or drop-off..."
              className="flex-1 text-xs bg-white border border-[#DDE3D9] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F7942] text-[#1A241A]"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={isChatLoading || !chatInput.trim()}
              className="bg-[#1A241A] hover:bg-[#2D3A2D] text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Carbon Footprint & Life-Cycle Savings Section */}
        <div>
          <div className="flex items-center justify-between mb-3 border-l-4 border-[#4F7942] pl-3">
            <div>
              <h3 className="text-base font-bold text-[#1A241A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F7942]" />
                Carbon Footprint Savings &amp; Environmental Impact
              </h3>
              <p className="text-xs text-[#5C6B5C] mt-0.5">
                Life-cycle assessment benchmarked for {result.metrics.estimated_weight_grams}g of {specificMaterial}
              </p>
            </div>
            {result.metrics.landfill_emissions_avoided_pct && (
              <span className="text-xs font-bold text-[#4F7942] bg-[#E8EDE6] px-3 py-1 rounded-full border border-[#DDE3D9] hidden sm:inline-block">
                {result.metrics.landfill_emissions_avoided_pct}% Landfill Diverted
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Metric 1: CO2e Diverted */}
            <div className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#DDE3D9]">
              <span className="text-[11px] text-[#5C6B5C] font-semibold uppercase tracking-wider block">
                CO₂e Saved
              </span>
              <div className="text-xl sm:text-2xl font-bold text-[#1A241A] mt-1">
                {result.metrics.co2_saved_kg.toFixed(3)}{' '}
                <span className="text-xs font-semibold text-[#4F7942]">kg</span>
              </div>
              <span className="text-[11px] text-[#7A8A7A] mt-0.5 block">Net emissions avoided</span>
            </div>

            {/* Metric 2: Methane Avoided or Energy Saved */}
            {isVegetable ? (
              <div className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#DDE3D9]">
                <span className="text-[11px] text-[#5C6B5C] font-semibold uppercase tracking-wider block">
                  Methane Prevented
                </span>
                <div className="text-xl sm:text-2xl font-bold text-[#4F7942] mt-1">
                  {result.metrics.methane_avoided_kg.toFixed(3)}{' '}
                  <span className="text-xs font-semibold text-[#5C6B5C]">kg</span>
                </div>
                <span className="text-[11px] text-[#7A8A7A] mt-0.5 block">28x potency of CO₂</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F4F7F2] border border-[#DDE3D9]">
                <span className="text-[11px] text-[#5C6B5C] font-semibold uppercase tracking-wider block">
                  Energy Conserved
                </span>
                <div className="text-xl sm:text-2xl font-bold text-[#1A241A] mt-1 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-[#4F7942] inline" />
                  {result.metrics.energy_saved_kwh.toFixed(2)}{' '}
                  <span className="text-xs font-semibold text-[#4F7942]">kWh</span>
                </div>
                <span className="text-[11px] text-[#7A8A7A] mt-0.5 block">Mfg energy saved</span>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Recycling Preparation Protocol (Checklist) */}
        <div className="bg-[#F4F7F2] rounded-3xl p-6 border border-[#DDE3D9]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-l-4 border-[#4F7942] pl-3">
            <div>
              <h4 className="text-base font-bold text-[#1A241A] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#4F7942]" />
                Actionable Preparation Steps to Recycle It
              </h4>
              <p className="text-xs text-[#5C6B5C] mt-0.5">
                Complete these physical steps before dropping into the {result.bin_type}
              </p>
            </div>
            <span className="text-xs text-[#5C6B5C] font-semibold bg-white px-3 py-1 rounded-full border border-[#DDE3D9]">
              {completedSteps.length} of {preparationSteps.length} steps completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#DDE3D9] h-2 rounded-full mb-4 overflow-hidden">
            <div
              className="bg-[#4F7942] h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(completedSteps.length / Math.max(1, preparationSteps.length)) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-2.5">
            {preparationSteps.map((step, idx) => {
              const isChecked = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all text-xs ${
                    isChecked
                      ? 'bg-[#E8EDE6] border-[#4F7942]/40 text-[#1A241A]'
                      : 'bg-white border-[#DDE3D9] text-[#2D3A2D] hover:border-[#4F7942]/50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#4F7942] text-white'
                        : 'border border-[#DDE3D9] bg-white text-[#7A8A7A]'
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F7942] bg-[#E8EDE6] px-2 py-0.5 rounded-md">
                        {step.phase}
                      </span>
                      {step.is_critical && (
                        <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className={`font-semibold ${isChecked ? 'line-through text-[#7A8A7A]' : 'text-[#1A241A]'}`}>
                      {step.instruction}
                    </p>
                    {step.detail && (
                      <p className="text-[11px] text-[#5C6B5C] mt-0.5 leading-relaxed">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contamination Alert Box */}
          {result.contamination_warnings && result.contamination_warnings.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Contamination Risk Warning:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  {result.contamination_warnings.map((warn, wIdx) => (
                    <li key={wIdx}>{warn}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action / Log to Tracker Footer */}
        <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#DDE3D9]">
          <button
            id="btn-log-item"
            onClick={handleLogClick}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xs bg-[#E8EDE6] text-[#4F7942] border border-[#DDE3D9] hover:bg-[#dbe3d8] cursor-pointer active:scale-95"
            title="Item saved in Activity History"
          >
            <Check className="w-4 h-4 text-[#4F7942]" />
            <span>Saved in Activity History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
