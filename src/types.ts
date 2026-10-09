export interface CarbonMetrics {
  estimated_weight_grams: number;
  co2_saved_kg: number;
  methane_avoided_kg: number;
  energy_saved_kwh: number;
  water_saved_liters: number;
  car_miles_equivalent: number;
  tree_absorption_days: number;
  decomposition_years: number;
  smartphone_charges_equivalent?: number;
  landfill_emissions_avoided_pct?: number;
}

export interface UpcyclingIdea {
  title: string;
  difficulty: string;
  summary: string;
  materials_needed?: string[];
  estimated_time?: string;
}

export type BinColor = 'green' | 'blue' | 'red' | 'black';

export interface MunicipalBinClassification {
  bin_color: BinColor;
  color_emoji: '🟢' | '🔵' | '🔴' | '⚫';
  color_name: string; // 'Green' | 'Blue' | 'Red' | 'Black / Grey'
  waste_category: string; // 'Organic / Wet Waste' | 'Recyclable / Dry Waste' | 'Hazardous / Sanitary' | 'Special Care E-Waste / General'
  primary_examples: string; // 'Food leftovers, vegetable peels, garden clippings', etc.
  final_destination: string; // 'Composting & Bio-gas plants', etc.
  assigned_reason?: string;
}

export interface CleanlinessAssessment {
  level: 'Pristine / Clean' | 'Lightly Soiled' | 'Moderately Soiled' | 'Heavily Contaminated';
  score: number; // 0 - 100%
  visual_condition: string;
  cleaning_action_required: string;
  is_compost_safe_soiled?: boolean;
}

export interface RecyclabilityDetails {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  curbside_acceptance: string;
  visual_inspection_notes: string;
  sorting_bin: string;
  special_handling_notes?: string;
  recycled_market_demand?: string;
}

export interface MaterialSpecification {
  specific_name: string; // e.g. Polyethylene Terephthalate (PET #1), Corrugated Kraft Paperboard, Carrot Tops Biomass
  category: string; // Plastic Polymer, Organic Biomass, Metal Alloy, Silica Glass, Cellulose Paper, Multi-Layer Composite
  composition_breakdown: string;
  visual_identification_markers: string[];
  resin_code: number;
  is_composite: boolean;
}

export interface PreparationStep {
  step_number: number;
  phase: string;
  instruction: string;
  detail: string;
  is_critical?: boolean;
}

export interface PoorQualityImageReport {
  is_poor_quality: boolean;
  issue_type?: 'blurry' | 'too_dark' | 'out_of_focus' | 'no_item_detected' | 'extreme_close_up' | 'overexposed';
  reason?: string;
  tips: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UpcyclingBlueprint {
  title: string;
  difficulty: string;
  estimated_time: string;
  tools_required: string[];
  safety_warnings: string[];
  steps: { step: number; title: string; instruction: string }[];
  pro_tip: string;
}

export interface AnalysisResult {
  status: string;
  detected_name: string;
  category: 'plastic' | 'vegetable' | 'glass' | 'metal' | 'paper' | 'composite' | 'other';
  is_plastic: boolean;
  resin_code: number;
  is_reusable: boolean;
  reusability_rating: string;
  recyclability_status: string;
  bin_type: string;
  recycling_instructions: string[];
  contamination_warnings: string[];
  upcycling_ideas: UpcyclingIdea[];
  metrics: CarbonMetrics;
  decomposition_display: string;
  confidence_score: number;
  analyzed_at: string;
  backend_engine: string;
  image_preview_url?: string;
  active_model_checkpoint?: string;
  model_accuracy?: string;
  generalization_gap?: string;
  regularization_status?: string;
  // Enhanced detailed attributes
  material_spec?: MaterialSpecification;
  bin_classification?: MunicipalBinClassification;
  cleanliness?: CleanlinessAssessment;
  recyclability?: RecyclabilityDetails;
  preparation_protocol?: PreparationStep[];
  is_poor_quality?: boolean;
  poor_quality_report?: PoorQualityImageReport;
}

export interface DatabaseItem {
  id: string;
  name: string;
  category: string;
  resin_code: number;
  is_plastic: boolean;
  is_reusable: boolean;
  reusability_rating: string;
  recyclability: string;
  decomposition_years: number;
  co2_factor_per_kg: number;
  energy_factor_kwh_per_kg: number;
  water_factor_liters_per_kg: number;
  bin_type: string;
  instructions: string[];
  contamination_alerts: string[];
  upcycling_ideas: UpcyclingIdea[];
  benchmark_100g_co2_saved: number;
  benchmark_100g_energy_kwh: number;
  benchmark_100g_water_liters: number;
}

export interface RecycledLogEntry {
  id: string;
  timestamp: string;
  itemName: string;
  category: string;
  co2SavedKg: number;
  weightGrams: number;
  reusable: boolean;
  actionTaken: string;
  imageUrl?: string;
  binColor?: BinColor;
  binColorName?: string;
  binEmoji?: string;
  resinCode?: number;
  specificMaterial?: string;
}

export interface TrainingHyperparameters {
  epochs: number;
  learningRate: number;
  weightDecay: number; // L2 Regularization
  dropoutRate: number; // Dropout (0.0 - 0.6)
  labelSmoothing: number; // 0.0 - 0.2
  dataAugmentation: boolean;
  augmentationIntensity: 'low' | 'medium' | 'high';
  earlyStopping: boolean;
  earlyStoppingPatience: number;
  temperatureScaling: number;
  backbone: 'EfficientNet-B2' | 'ResNet-50' | 'MobileNetV3';
}

export interface EpochMetric {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
  learningRate: number;
  isOverfitting: boolean;
}

export interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  count: number;
  percentage: number;
}

export interface ClassPerformanceMetric {
  className: string;
  precision: number;
  recall: number;
  f1Score: number;
  sampleCount: number;
  overfittingRisk: 'High' | 'Moderate' | 'Low' | 'Cured';
}

export interface ModelTrainingResult {
  status: string;
  modelState: 'overfitted_baseline' | 'well_regularized' | 'aggressive_regularized';
  trainAccuracy: number;
  valAccuracy: number;
  generalizationGap: number;
  bestEpoch: number;
  earlyStopped: boolean;
  history: EpochMetric[];
  confusionMatrix: ConfusionMatrixCell[];
  classMetrics: ClassPerformanceMetric[];
  hyperparameters: TrainingHyperparameters;
  timestamp: string;
  checkpointId: string;
  overfittingDiagnosis: {
    isOverfitting: boolean;
    gapSeverity: 'Critical' | 'Moderate' | 'Healthy / Regularized';
    explanation: string;
    recommendation: string;
  };
}
