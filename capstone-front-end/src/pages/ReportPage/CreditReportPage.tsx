import React, { useState, useEffect } from 'react';
import ChartCard from '../../components/Dashboard/ChartCard';
import { reportService } from '../../services/reportService';
import type { CreditReport } from '../../models/dashboard.model';
import { formatNumber, formatCurrency } from '../../utils/formatters';

const CreditReportPage: React.FC = () => {
  const [report, setReport] = useState<CreditReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [selectedYear]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getCreditReport(selectedYear);
      setReport(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await reportService.exportReportExcel('CREDITS', selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Credit_Report_${selectedYear}.xlsx`;
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
            <h1 className='text-3xl font-bold text-gray-900'>BÃ¡o cÃ¡o TÃ­n chá»‰</h1>
            <p className='text-gray-500 mt-1'>
              Thá»‘ng kÃª phÃ¡t hÃ nh, bÃ¡n vÃ  sá»­ dá»¥ng tÃ­n chá»‰
            </p>
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
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center'>
                <p className='text-2xl font-bold text-blue-600'>
                  {formatNumber(report.totalIssued)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>PhÃ¡t hÃ nh</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {formatNumber(report.totalSold)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>ÄÃ£ bÃ¡n</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center'>
                <p className='text-2xl font-bold text-orange-600'>
                  {formatNumber(report.totalRetired)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>ÄÃ£ sá»­ dá»¥ng</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {formatNumber(report.totalAvailable)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>Kháº£ dá»¥ng</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center'>
                <p className='text-2xl font-bold text-gray-600'>
                  {formatCurrency(report.averagePrice)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>GiÃ¡ TB</p>
              </div>
            </div>

            {/* Credit Flow Chart */}
            <ChartCard
              title='LÆ°u chuyá»ƒn tÃ­n chá»‰ theo thÃ¡ng'
              subtitle={`NÄƒm ${selectedYear}`}
              className='mb-6'
            >
              <div className='h-80 p-4'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-2 px-3 text-sm font-medium text-gray-500'>
                          ThÃ¡ng
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          PhÃ¡t hÃ nh
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          ÄÃ£ bÃ¡n
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          ÄÃ£ sá»­ dá»¥ng
                        </th>
                        <th className='text-right py-2 px-3 text-sm font-medium text-gray-500'>
                          GiÃ¡ TB
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyBreakdown.map((data, index) => (
                        <tr key={index} className='border-b border-gray-100 hover:bg-gray-50'>
                          <td className='py-2 px-3 text-sm font-medium text-gray-900'>
                            {data.month}
                          </td>
                          <td className='py-2 px-3 text-sm text-blue-600 text-right'>
                            +{formatNumber(data.issued)}
                          </td>
                          <td className='py-2 px-3 text-sm text-purple-600 text-right'>
                            {formatNumber(data.sold)}
                          </td>
                          <td className='py-2 px-3 text-sm text-orange-600 text-right'>
                            {formatNumber(data.retired)}
                          </td>
                          <td className='py-2 px-3 text-sm text-gray-600 text-right'>
                            {formatCurrency(data.averagePrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ChartCard>

            {/* Credit Distribution */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>PhÃ¢n bá»• tÃ­n chá»‰</h2>
              <div className='grid grid-cols-3 gap-6'>
                {/* Issued */}
                <div className='text-center'>
                  <div className='relative w-32 h-32 mx-auto mb-4'>
                    <svg className='w-32 h-32 transform -rotate-90'>
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#e5e7eb'
                        strokeWidth='12'
                        fill='none'
                      />
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#3b82f6'
                        strokeWidth='12'
                        fill='none'
                        strokeDasharray={`${(report.totalSold / report.totalIssued) * 352} 352`}
                      />
                    </svg>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <span className='text-lg font-bold text-gray-900'>
                        {((report.totalSold / report.totalIssued) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-500'>Tá»· lá»‡ Ä‘Ã£ bÃ¡n</p>
                </div>

                {/* Sold vs Available */}
                <div className='text-center'>
                  <div className='relative w-32 h-32 mx-auto mb-4'>
                    <svg className='w-32 h-32 transform -rotate-90'>
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#e5e7eb'
                        strokeWidth='12'
                        fill='none'
                      />
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#22c55e'
                        strokeWidth='12'
                        fill='none'
                        strokeDasharray={`${(report.totalAvailable / report.totalIssued) * 352} 352`}
                      />
                    </svg>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <span className='text-lg font-bold text-gray-900'>
                        {((report.totalAvailable / report.totalIssued) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-500'>Tá»· lá»‡ kháº£ dá»¥ng</p>
                </div>

                {/* Retired */}
                <div className='text-center'>
                  <div className='relative w-32 h-32 mx-auto mb-4'>
                    <svg className='w-32 h-32 transform -rotate-90'>
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#e5e7eb'
                        strokeWidth='12'
                        fill='none'
                      />
                      <circle
                        cx='64'
                        cy='64'
                        r='56'
                        stroke='#f97316'
                        strokeWidth='12'
                        fill='none'
                        strokeDasharray={`${(report.totalRetired / report.totalIssued) * 352} 352`}
                      />
                    </svg>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <span className='text-lg font-bold text-gray-900'>
                        {((report.totalRetired / report.totalIssued) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-500'>Tá»· lá»‡ Ä‘Ã£ sá»­ dá»¥ng</p>
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

export default CreditReportPage;
