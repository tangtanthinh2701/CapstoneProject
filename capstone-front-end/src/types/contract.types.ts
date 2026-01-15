export type ContractStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED';
export type ContractCategory = 'ENTERPRISE_PROJECT' | 'INDIVIDUAL_TREE';
export type ContractType = 'OWNERSHIP' | 'SERVICE';
export type RenewalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ContractFilter {
  search?: string;
  status?: ContractStatus;
  category?: ContractCategory;
  month?: number;
  year?: number;
  projectId?: number;
}

export interface ContractSortOptions {
  field: 'createdAt' | 'startDate' | 'endDate' | 'totalAmount';
  order: 'asc' | 'desc';
}
