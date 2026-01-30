// ==================== PROJECT ENUMS ====================

export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'Đang lập kế hoạch',
  [ProjectStatus.ACTIVE]: 'Đang hoạt động',
  [ProjectStatus.COMPLETED]: 'Hoàn thành',
  [ProjectStatus.CANCELLED]: 'Đã hủy',
};

export const PhaseStatus = {
  PLANNING: 'PLANNING',
  PLANTING: 'PLANTING',
  GROWING: 'GROWING',
  MATURE: 'MATURE',
  HARVESTING: 'HARVESTING',
  COMPLETED: 'COMPLETED',
} as const;

export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

export const PhaseStatusLabels: Record<PhaseStatus, string> = {
  [PhaseStatus.PLANNING]: 'Lập kế hoạch',
  [PhaseStatus.PLANTING]: 'Đang trồng',
  [PhaseStatus.GROWING]: 'Đang phát triển',
  [PhaseStatus.MATURE]: 'Trưởng thành',
  [PhaseStatus.HARVESTING]: 'Đang thu hoạch',
  [PhaseStatus.COMPLETED]: 'Hoàn thành',
};

// ==================== PROJECT INTERFACES ====================

export interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  description?: string;
  location?: string;
  totalAreaHa: number;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  projectStatus: ProjectStatus;
  isPublic: boolean;
  managerId?: string;
  managerName?: string;
  totalCO2Kg: number;
  targetCO2Kg: number;
  totalTrees: number;
  aliveTrees: number;
  deadTrees: number;
  phases: ProjectPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhase {
  id: number;
  projectId: number;
  phaseName: string;
  phaseOrder: number;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  targetCo2Kg: number;
  actualCo2Kg: number;
  budget: number;
  actualCost: number;
  phaseStatus: PhaseStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateRequest {
  projectName: string;
  description?: string;
  location?: string;
  totalAreaHa: number;
  startDate: string;
  expectedEndDate?: string;
  projectStatus?: ProjectStatus;
  isPublic?: boolean;
  code?: string;
  totalBudget?: number;
  targetCO2Kg?: number;
  phases?: PhaseCreateRequest[];
}

export interface ProjectUpdateRequest {
  projectName?: string;
  description?: string;
  location?: string;
  totalAreaHa?: number;
  expectedEndDate?: string;
  projectStatus?: ProjectStatus;
  isPublic?: boolean;
  totalBudget?: number;
  targetCO2Kg?: number;
}

export interface PhaseCreateRequest {
  phaseName: string;
  phaseOrder: number;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  targetCo2Kg: number;
  budget?: number;
  phaseStatus?: PhaseStatus;
  notes?: string;
}

export interface PhaseUpdateRequest {
  phaseName?: string;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  targetCo2Kg?: number;
  budget?: number;
  phaseStatus?: PhaseStatus;
  notes?: string;
}

// ==================== PROJECT SUMMARY ====================

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  totalAreaHa: number;
  totalCO2Kg: number;
  totalTrees: number;
}
