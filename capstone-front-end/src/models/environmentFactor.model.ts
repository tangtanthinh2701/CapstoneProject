// ==================== ENVIRONMENT FACTOR INTERFACES ====================

export interface EnvironmentFactor {
  id: number;
  factorCode: string;
  factorName: string;
  description?: string;
  category: FactorCategory;
  baseValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  impactType: ImpactType;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentFactorRequest {
  factorCode: string;
  factorName: string;
  description?: string;
  category: FactorCategory;
  baseValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  impactType: ImpactType;
  isActive?: boolean;
  notes?: string;
}

// ==================== ENVIRONMENT FACTOR ENUMS ====================

export const FactorCategory = {
  CLIMATE: 'CLIMATE',
  SOIL: 'SOIL',
  WATER: 'WATER',
  LOCATION: 'LOCATION',
  SEASON: 'SEASON',
  SPECIES: 'SPECIES',
  OTHER: 'OTHER',
} as const;

export type FactorCategory = (typeof FactorCategory)[keyof typeof FactorCategory];

export const FactorCategoryLabels: Record<FactorCategory, string> = {
  [FactorCategory.CLIMATE]: 'Khí hậu',
  [FactorCategory.SOIL]: 'Đất',
  [FactorCategory.WATER]: 'Nước',
  [FactorCategory.LOCATION]: 'Vị trí',
  [FactorCategory.SEASON]: 'Mua',
  [FactorCategory.SPECIES]: 'Loại cây',
  [FactorCategory.OTHER]: 'Khác',
};

export const ImpactType = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
  NEUTRAL: 'NEUTRAL',
} as const;

export type ImpactType = (typeof ImpactType)[keyof typeof ImpactType];

export const ImpactTypeLabels: Record<ImpactType, string> = {
  [ImpactType.POSITIVE]: 'Tích cực',
  [ImpactType.NEGATIVE]: 'Tiêu cực',
  [ImpactType.NEUTRAL]: 'Trung lập',
};

// ==================== CO2 CALCULATION ====================

export interface CO2CalculationInput {
  batchId: number;
  treeSpeciesId: number;
  quantityAlive: number;
  avgHeightCm: number;
  avgTrunkDiameterCm: number;
  avgCanopyDiameterCm: number;
  environmentFactors: EnvironmentFactorInput[];
}

export interface EnvironmentFactorInput {
  factorId: number;
  value: number;
}

export interface CO2CalculationResult {
  batchId: number;
  baseCO2Kg: number;
  adjustedCO2Kg: number;
  totalEnvironmentFactor: number;
  factorBreakdown: FactorBreakdown[];
  calculationDate: string;
}

export interface FactorBreakdown {
  factorId: number;
  factorName: string;
  inputValue: number;
  multiplier: number;
  impact: string;
}

// ==================== FACTOR PRESETS ====================

export interface FactorPreset {
  id: number;
  presetName: string;
  description?: string;
  farmId?: number;
  farmName?: string;
  factors: FactorPresetItem[];
  isDefault: boolean;
  createdAt: string;
}

export interface FactorPresetItem {
  factorId: number;
  factorName: string;
  value: number;
}

export interface FactorPresetRequest {
  presetName: string;
  description?: string;
  farmId?: number;
  factors: FactorPresetItemRequest[];
  isDefault?: boolean;
}

export interface FactorPresetItemRequest {
  factorId: number;
  value: number;
}
