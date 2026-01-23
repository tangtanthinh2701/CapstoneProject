import React, { useState, useEffect } from 'react';
import SummaryCard from '../../components/Dashboard/SummaryCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import { reportService } from '../../services/reportService';
import type {
  DashboardSummary,
  RecentActivity as RecentActivityType,
} from '../../models/dashboard.model';
import { formatCO2 } from '../../utils/formatters';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activities, _setActivities] = useState<RecentActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const summaryRes = await reportService.getDashboardSummary();
      setSummary(summaryRes.data);
      // Activities would come from a different endpoint
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='bg-white rounded-xl p-6 animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='h-8 bg-gray-200 rounded w-3/4'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-500 mt-1'>
            Tá»•ng quan há»‡ thá»‘ng quáº£n lÃ½ tÃ­n chá»‰ Carbon
          </p>
        </div>

        {/* Summary Cards - Row 1: Projects & Contracts */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          <SummaryCard
            title='Tá»•ng dá»± Ã¡n'
            value={summary?.totalProjects || 0}
            icon={<span className='text-2xl'>ðŸ“</span>}
          />
          <SummaryCard
            title='Dá»± Ã¡n Ä‘ang hoáº¡t Ä‘á»™ng'
            value={summary?.activeProjects || 0}
            icon={<span className='text-2xl'>âœ…</span>}
          />
          <SummaryCard
            title='Tá»•ng há»£p Ä‘á»“ng'
            value={summary?.totalContracts || 0}
            icon={<span className='text-2xl'>ðŸ“„</span>}
          />
          <SummaryCard
            title='Há»£p Ä‘á»“ng chá» duyá»‡t'
            value={summary?.pendingContracts || 0}
            icon={<span className='text-2xl'>â³</span>}
          />
        </div>

        {/* Summary Cards - Row 2: Carbon & Credits */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          <SummaryCard
            title='COâ‚‚ háº¥p thá»¥'
            value={summary?.totalCO2Kg || 0}
            type='co2'
            icon={<span className='text-2xl'>ðŸŒ¿</span>}
          />
          <SummaryCard
            title='TÃ­n chá»‰ phÃ¡t hÃ nh'
            value={summary?.totalCreditsIssued || 0}
            icon={<span className='text-2xl'>ðŸŽ«</span>}
          />
          <SummaryCard
            title='TÃ­n chá»‰ Ä‘Ã£ bÃ¡n'
            value={summary?.creditsSold || 0}
            icon={<span className='text-2xl'>ðŸ’³</span>}
          />
          <SummaryCard
            title='TÃ­n chá»‰ kháº£ dá»¥ng'
            value={summary?.creditsAvailable || 0}
            icon={<span className='text-2xl'>ðŸ“Š</span>}
          />
        </div>

        {/* Summary Cards - Row 3: Financial */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          <SummaryCard
            title='Tá»•ng doanh thu'
            value={summary?.totalRevenue || 0}
            type='currency'
            icon={<span className='text-2xl'>ðŸ’°</span>}
          />
          <SummaryCard
            title='Doanh thu thÃ¡ng'
            value={summary?.monthlyRevenue || 0}
            type='currency'
            icon={<span className='text-2xl'>ðŸ“ˆ</span>}
          />
          <SummaryCard
            title='Tá»•ng cÃ¢y trá»“ng'
            value={summary?.totalTrees || 0}
            icon={<span className='text-2xl'>ðŸŒ²</span>}
          />
          <SummaryCard
            title='Tá»•ng diá»‡n tÃ­ch'
            value={summary?.totalFarmArea || 0}
            subtitle='mÂ²'
            icon={<span className='text-2xl'>ðŸ—ºï¸</span>}
          />
        </div>

        {/* Charts & Activities */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* CO2 Chart */}
          <ChartCard
            title='COâ‚‚ háº¥p thá»¥ theo thÃ¡ng'
            subtitle='NÄƒm 2026'
            className='lg:col-span-2'
          >
            <div className='h-64 flex items-center justify-center text-gray-400'>
              {/* Chart placeholder - integrate with chart library */}
              <p>Biá»ƒu Ä‘á»“ COâ‚‚ sáº½ hiá»ƒn thá»‹ á»Ÿ Ä‘Ã¢y</p>
            </div>
          </ChartCard>

          {/* Recent Activities */}
          <RecentActivity
            activities={activities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>

        {/* Achievement Progress */}
        {summary && (
          <div className='mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Tiáº¿n Ä‘á»™ má»¥c tiÃªu COâ‚‚
            </h2>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-gray-500'>
                    {formatCO2(summary.totalCO2Kg)} / {formatCO2(summary.targetCO2Kg)}
                  </span>
                  <span className='font-medium text-green-600'>
                    {summary.co2AchievementRate.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-4'>
                  <div
                    className='bg-green-500 h-4 rounded-full transition-all'
                    style={{
                      width: `${Math.min(summary.co2AchievementRate, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
