export const PartnerRole = {
  INVESTOR: 'INVESTOR',
  TECHNICAL_PARTNER: 'TECHNICAL_PARTNER',
  LAND_OWNER: 'LAND_OWNER',
  VERIFIER: 'VERIFIER',
  SPONSOR: 'SPONSOR',
  CONSULTANT: 'CONSULTANT',
  GOVERNMENT: 'GOVERNMENT',
  NGO: 'NGO',
  OTHER: 'OTHER',
} as const;

export type PartnerRole = (typeof PartnerRole)[keyof typeof PartnerRole];

export const PartnerRoleLabels: Record<PartnerRole, string> = {
  [PartnerRole.INVESTOR]: 'Nhà đầu tư',
  [PartnerRole.TECHNICAL_PARTNER]: 'Đối tác kỹ thuật',
  [PartnerRole.LAND_OWNER]: 'Chủ đất',
  [PartnerRole.VERIFIER]: 'Đơn vị xác minh',
  [PartnerRole.SPONSOR]: 'Nhà tài trợ',
  [PartnerRole.CONSULTANT]: 'Tư vấn',
  [PartnerRole.GOVERNMENT]: 'Cơ quan chính phủ',
  [PartnerRole.NGO]: 'Tổ chức phi chính phủ',
  [PartnerRole.OTHER]: 'Khác',
};

export interface Partner {
  id: number;
  partnerName: string;
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPartner {
  id: number;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  partnerId: number;
  partnerName?: string;
  partnerImgUrl?: string;
  role: PartnerRole;
  notes?: string;
  createdAt: string;
}

export interface PartnerRequest {
  partnerName: string;
  imgUrl?: string;
}

export interface ProjectPartnerRequest {
  projectId: number;
  partnerId: number;
  role: PartnerRole;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pageInfo?: PageInfo;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
