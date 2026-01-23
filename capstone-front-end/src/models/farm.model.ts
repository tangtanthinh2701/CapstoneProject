// ==================== FARM ENUMS ====================

export const FarmStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type FarmStatus = (typeof FarmStatus)[keyof typeof FarmStatus];

export const FarmStatusLabels: Record<FarmStatus, string> = {
  [FarmStatus.ACTIVE]: 'Đang hoạt động',
  [FarmStatus.INACTIVE]: 'Không hoạt động',
  [FarmStatus.MAINTENANCE]: 'Bảo trì',
};

// ==================== FARM INTERFACES ====================

export interface Farm {
  id: number;
  farmCode: string;
  farmName: string;
  location?: string;
  coordinates?: string;
  totalAreaM2: number;
  usableAreaM2: number;
  usedAreaM2: number;
  availableAreaM2: number;
  soilType?: string;
  waterSource?: string;
  farmStatus: FarmStatus;
  projectId?: number;
  projectName?: string;
  totalTrees: number;
  totalBatches: number;
  createdAt: string;
  updatedAt: string;
}

export interface FarmCreateRequest {
  farmCode: string;
  farmName: string;
  location?: string;
  coordinates?: string;
  totalAreaM2: number;
  usableAreaM2: number;
  soilType?: string;
  waterSource?: string;
  farmStatus?: FarmStatus;
}

export interface FarmUpdateRequest {
  farmName?: string;
  location?: string;
  coordinates?: string;
  totalAreaM2?: number;
  usableAreaM2?: number;
  soilType?: string;
  waterSource?: string;
  farmStatus?: FarmStatus;
}

// ==================== FARM AREA INFO ====================

export interface FarmAreaInfo {
  farmId: number;
  farmName: string;
  totalAreaM2: number;
  usableAreaM2: number;
  usedAreaM2: number;
  availableAreaM2: number;
  usagePercentage: number;
}

export interface FarmSummary {
  totalFarms: number;
  activeFarms: number;
  totalAreaM2: number;
  usedAreaM2: number;
  totalTrees: number;
}
