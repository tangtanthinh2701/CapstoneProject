// ==================== PROJECT ENUMS ====================

export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'Đang lâp kế hoạch',
  [ProjectStatus.ACTIVE]: 'Đang hoạt động',
  [ProjectStatus.ON_HOLD]: 'Tạm dừng',
  [ProjectStatus.COMPLETED]: 'Hoàn thành',
  [ProjectStatus.CANCELLED]: 'Đã hủy',
};

export const PhaseStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
} as const;

export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

export const PhaseStatusLabels: Record<PhaseStatus, string> = {
  [PhaseStatus.NOT_STARTED]: 'Chưa bắt đầu',
  [PhaseStatus.IN_PROGRESS]: 'Đang tiến hành',
  [PhaseStatus.COMPLETED]: 'Hoàn thành',
  [PhaseStatus.DELAYED]: 'Chậm tiến độ',
  [PhaseStatus.CANCELLED]: 'Đã hủy',
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
}

export interface PhaseCreateRequest {
  phaseName: string;
  phaseOrder: number;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  targetCo2Kg: number;
  phaseStatus?: PhaseStatus;
  notes?: string;
}

export interface PhaseUpdateRequest {
  phaseName?: string;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  targetCo2Kg?: number;
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
