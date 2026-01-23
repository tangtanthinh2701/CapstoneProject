// ==================== TREE SPECIES INTERFACES ====================

export interface TreeSpecies {
  id: number;
  speciesCode: string;
  name: string;
  scientificName?: string;
  baseCarbonRate: number;
  maturityYears?: number;
  optimalTemperature?: string;
  optimalRainfall?: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeSpeciesCreateRequest {
  speciesCode: string;
  name: string;
  scientificName?: string;
  baseCarbonRate: number;
  maturityYears?: number;
  optimalTemperature?: string;
  optimalRainfall?: string;
  description?: string;
  imageUrl?: string;
}

export interface TreeSpeciesUpdateRequest {
  name?: string;
  scientificName?: string;
  baseCarbonRate?: number;
  maturityYears?: number;
  optimalTemperature?: string;
  optimalRainfall?: string;
  description?: string;
  imageUrl?: string;
}

// ==================== TREE BATCH ENUMS ====================

export const SourceType = {
  NURSERY: 'NURSERY',
  WILD: 'WILD',
  TRANSPLANT: 'TRANSPLANT',
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const SourceTypeLabels: Record<SourceType, string> = {
  [SourceType.NURSERY]: 'Vuon uom',
  [SourceType.WILD]: 'Tu nhien',
  [SourceType.TRANSPLANT]: 'Cay dich chuyen',
};

// ==================== TREE BATCH INTERFACES ====================

export interface TreeBatch {
  id: number;
  batchCode: string;
  farmId: number;
  farmName?: string;
  phaseId: number;
  phaseName?: string;
  speciesId: number;
  speciesName?: string;
  quantity: number;
  aliveQuantity: number;
  deadQuantity: number;
  plantingAreaM2: number;
  plantingDate: string;
  sourceType: SourceType;
  supplierName?: string;
  unitCost?: number;
  totalCost?: number;
  totalCo2Kg: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeBatchCreateRequest {
  batchCode: string;
  farmId: number;
  phaseId: number;
  speciesId: number;
  quantity: number;
  plantingAreaM2: number;
  plantingDate: string;
  sourceType: SourceType;
  supplierName?: string;
  unitCost?: number;
  notes?: string;
}

export interface TreeBatchUpdateRequest {
  quantity?: number;
  plantingAreaM2?: number;
  supplierName?: string;
  unitCost?: number;
  notes?: string;
}

// ==================== TREE GROWTH RECORD ENUMS ====================

export const HealthStatus = {
  HEALTHY: 'HEALTHY',
  STRESSED: 'STRESSED',
  DISEASED: 'DISEASED',
  DEAD: 'DEAD',
} as const;

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];

export const HealthStatusLabels: Record<HealthStatus, string> = {
  [HealthStatus.HEALTHY]: 'Khỏe mạnh',
  [HealthStatus.STRESSED]: 'Stress',
  [HealthStatus.DISEASED]: 'Bệnh',
  [HealthStatus.DEAD]: 'Chết',
};

export const GrowthRate = {
  SLOW: 'SLOW',
  NORMAL: 'NORMAL',
  FAST: 'FAST',
} as const;

export type GrowthRate = (typeof GrowthRate)[keyof typeof GrowthRate];

export const GrowthRateLabels: Record<GrowthRate, string> = {
  [GrowthRate.SLOW]: 'Chậm',
  [GrowthRate.NORMAL]: 'Bình thường',
  [GrowthRate.FAST]: 'Nhanh',
};

// ==================== TREE GROWTH RECORD INTERFACES ====================

export interface TreeGrowthRecord {
  id: number;
  batchId: number;
  batchCode?: string;
  recordedDate: string;
  averageHeight: number;
  averageDiameter: number;
  survivalRate: number;
  healthStatus: HealthStatus;
  growthRate: GrowthRate;
  co2AbsorbedKg: number;
  environmentFactor: number;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface TreeGrowthRecordCreateRequest {
  batchId: number;
  recordedDate: string;
  averageHeight: number;
  averageDiameter: number;
  survivalRate: number;
  healthStatus: HealthStatus;
  growthRate: GrowthRate;
  notes?: string;
}

export interface TreeGrowthRecordUpdateRequest {
  averageHeight?: number;
  averageDiameter?: number;
  survivalRate?: number;
  healthStatus?: HealthStatus;
  growthRate?: GrowthRate;
  notes?: string;
}

// ==================== CO2 SUMMARY ====================

export interface BatchCO2Summary {
  batchId: number;
  batchCode: string;
  speciesName: string;
  totalCO2Kg: number;
  totalCO2Tons: number;
  latestRecordDate: string;
  recordCount: number;
}

export interface FarmCO2Summary {
  farmId: number;
  farmName: string;
  totalBatches: number;
  totalTrees: number;
  totalCO2Kg: number;
  totalCO2Tons: number;
}
