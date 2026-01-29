export interface DashboardSummary {
    // Project stats
    totalProjects: number;
    activeProjects: number;

    // Farm stats
    totalFarms: number;
    activeFarms: number;
    totalFarmArea?: number;

    // Tree stats
    totalTrees: number;
    aliveTrees: number;

    // Carbon stats
    totalCarbonCredits: number;
    totalCo2AbsorbedTons: number;
    totalCO2Kg?: number;
    targetCo2: number;
    targetCO2Kg?: number;
    co2CompletionPercentage: number;
    co2AchievementRate?: number;

    // Credit stats
    totalCreditsIssued: number;
    totalCreditsSold: number;
    totalCreditsAvailable: number;
    totalCreditsRetired: number;
    creditsSold?: number;
    creditsAvailable?: number;

    // Contract stats
    totalContracts: number;
    activeContracts: number;
    pendingContracts?: number;
    expiringSoonContracts?: number;
    totalContractValue?: number;

    // Revenue
    totalRevenue: number;
    monthlyRevenue?: number;

    // Recent activities
    recentActivities: RecentActivity[];

    // Embedded chart data (optional)
    monthlyCo2Data?: MonthlyData[];
    monthlyRevenueData?: MonthlyRevenueData[];
    topProjectsByCo2?: TopProject[];
}

export interface RecentActivity {
    id: number;
    activityType?: 'CONTRACT' | 'CREDIT' | 'PAYMENT';
    type?: string;
    title: string;
    description: string;
    timestamp: string;
    referenceId?: number;
    referenceCode?: string;
    userName?: string;
}

export interface ProjectDashboard {
    projectId: number;
    projectName: string;
    totalTrees: number;
    co2Absorbed: number;
    completionPercentage: number;
    status: string;
}

export interface UserDashboard {
    userId: string;
    userName: string;
    totalContracts: number;
    totalTreesOwned: number;
    totalCo2Offset: number;
    recentTransactions: any[];
}

export interface MonthlyData {
    month: number;
    monthName: string;
    year: number;
    value: number;
}

export interface MonthlyRevenueData {
    month: number;
    monthName: string;
    year: number;
    value: number;
    revenue: number;
    count: number;
}

// Aliases for dashboardService
export type CO2MonthlyData = MonthlyData;
export type RevenueMonthlyData = MonthlyRevenueData;

export interface TopProject {
    projectId: number;
    projectCode: string;
    projectName: string;
    id: number;
    name: string;
    co2Absorbed: number;
    totalCo2Absorbed: number;
    completionPercentage: number;
}

export interface CO2Report {
    totalCO2Kg: number;
    totalCO2Tons: number;
    trendPercentage: number;
    monthlyBreakdown: Array<{
        month: string | number;
        monthName?: string;
        co2Kg?: number;
        totalCO2Kg?: number;
    }>;
    projectBreakdown: Array<{
        projectId: number;
        projectName: string;
        co2Kg: number;
        creditsIssued: number;
        percentage: number;
    }>;
}

export interface CreditReport {
    totalIssued: number;
    totalSold: number;
    totalRetired: number;
    totalAvailable: number;
    averagePrice: number;
    monthlyBreakdown: Array<{
        month: string;
        issued: number;
        sold: number;
        retired: number;
        averagePrice: number;
    }>;
}

export interface RevenueReport {
    totalRevenue: number;
    trendPercentage: number;
    revenueBySource: Array<{
        source: string;
        amount: number;
        percentage: number;
    }>;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
        creditsSold: number;
    }>;
}
