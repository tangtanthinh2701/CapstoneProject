import React, { useState, useEffect } from 'react';
import ChartCard from '../../components/Dashboard/ChartCard';
import { reportService } from '../../services/reportService';
import type { RevenueReport } from '../../models/dashboard.model';
import { formatNumber, formatCurrency, formatPercentage } from '../../utils/formatters';

const RevenueReportPage: React.FC = () => {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [selectedYear]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getRevenueReport(selectedYear);
      setReport(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await reportService.exportReportExcel('REVENUE', selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Revenue_Report_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>BÃ¡o cÃ¡o Doanh thu</h1>
            <p className='text-gray-500 mt-1'>Thá»‘ng kÃª doanh thu theo thá»i gian vÃ  nguá»“n</p>
          </div>
          <div className='flex items-center gap-4'>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              Xuáº¥t Excel
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center'>
                <p className='text-3xl font-bold text-green-600'>
                  {formatCurrency(report.totalRevenue)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Tá»•ng doanh thu</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center'>
                <p
                  className={`text-3xl font-bold ${report.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {report.trendPercentage >= 0 ? '+' : ''}
                  {formatPercentage(report.trendPercentage)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>So vá»›i nÄƒm trÆ°á»›c</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center'>
                <p className='text-3xl font-bold text-blue-600'>{report.revenueBySource.length}</p>
                <p className='text-sm text-gray-500 mt-1'>Nguá»“n doanh thu</p>
              </div>
            </div>

            {/* Monthly Chart */}
            <ChartCard
              title='Doanh thu theo thÃ¡ng'
              subtitle={`NÄƒm ${selectedYear}`}
              className='mb-6'
            >
              <div className='h-80'>
                <div className='grid grid-cols-12 gap-2 h-full items-end p-4'>
                  {report.monthlyRevenue.map((data, index) => {
                    const maxRevenue = Math.max(...report.monthlyRevenue.map((d) => d.revenue));
                    const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className='flex flex-col items-center'>
                        <div
                          className='w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600'
                          style={{
                            height: `${height}%`,
                            minHeight: data.revenue > 0 ? '4px' : '0',
                          }}
                          title={`${data.month}: ${formatCurrency(data.revenue)}`}
                        ></div>
                        <span className='text-xs text-gray-500 mt-2'>
                          {data.month.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>

            {/* Revenue by Source */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Source Table */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Doanh thu theo nguá»“n</h2>
                <div className='space-y-4'>
                  {report.revenueBySource.map((source, index) => (
                    <div key={index}>
                      <div className='flex justify-between text-sm mb-1'>
                        <span className='font-medium text-gray-700'>{source.source}</span>
                        <span className='text-gray-600'>{formatCurrency(source.amount)}</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full'
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <p className='text-xs text-gray-400 mt-1'>
                        {formatPercentage(source.percentage)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Details Table */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Chi tiáº¿t theo thÃ¡ng</h2>
                <div className='overflow-x-auto max-h-80'>
                  <table className='w-full'>
                    <thead className='sticky top-0 bg-white'>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-2 px-3 text-sm font-medium text-gray-500'>
                          ThÃ¡ng
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          Doanh thu
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          TÃ­n chá»‰ bÃ¡n
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyRevenue.map((data, index) => (
                        <tr key={index} className='border-b border-gray-100 hover:bg-gray-50'>
                          <td className='py-2 px-3 text-sm text-gray-900'>{data.month}</td>
                          <td className='py-2 px-3 text-sm text-gray-600 text-right'>
                            {formatCurrency(data.revenue)}
                          </td>
                          <td className='py-2 px-3 text-sm text-gray-600 text-right'>
                            {formatNumber(data.creditsSold)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='text-center py-12'>
            <p className='text-gray-500'>KhÃ´ng cÃ³ dá»¯ liá»‡u cho nÄƒm nÃ y</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReportPage;
