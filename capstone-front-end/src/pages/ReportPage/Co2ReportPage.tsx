import React, { useState, useEffect } from 'react';
import ChartCard from '../../components/Dashboard/ChartCard';
import { reportService } from '../../services/reportService';
import type { CO2Report } from '../../models/dashboard.model';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const Co2ReportPage: React.FC = () => {
  const [report, setReport] = useState<CO2Report | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [selectedYear]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getCO2Report(selectedYear);
      setReport(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await reportService.exportReportExcel('CO2', selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CO2_Report_${selectedYear}.xlsx`;
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
            <h1 className='text-3xl font-bold text-gray-900'>BÃ¡o cÃ¡o COâ‚‚</h1>
            <p className='text-gray-500 mt-1'>
              Thá»‘ng kÃª lÆ°á»£ng COâ‚‚ háº¥p thá»¥ theo thá»i gian
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
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center'>
                <p className='text-3xl font-bold text-green-600'>
                  {formatNumber(report.totalCO2Kg)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Tá»•ng COâ‚‚ (kg)</p>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center'>
                <p className='text-3xl font-bold text-blue-600'>{report.totalCO2Tons.toFixed(2)}</p>
                <p className='text-sm text-gray-500 mt-1'>Tá»•ng COâ‚‚ (táº¥n)</p>
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
                <p className='text-3xl font-bold text-purple-600'>
                  {report.monthlyBreakdown.length}
                </p>
                <p className='text-sm text-gray-500 mt-1'>ThÃ¡ng cÃ³ dá»¯ liá»‡u</p>
              </div>
            </div>

            {/* Monthly Chart */}
            <ChartCard
              title='COâ‚‚ háº¥p thá»¥ theo thÃ¡ng'
              subtitle={`NÄƒm ${selectedYear}`}
              className='mb-6'
            >
              <div className='h-80'>
                {/* Chart placeholder */}
                <div className='grid grid-cols-12 gap-2 h-full items-end p-4'>
                  {report.monthlyBreakdown.map((data, index) => {
                    const maxCO2 = Math.max(
                      ...report.monthlyBreakdown.map((d) => d.co2Kg ?? d.totalCO2Kg ?? 0),
                    );
                    const co2Value = data.co2Kg ?? data.totalCO2Kg ?? 0;
                    const height = maxCO2 > 0 ? (co2Value / maxCO2) * 100 : 0;
                    const monthLabel =
                      typeof data.month === 'string' ? data.month : (data.monthName ?? '');
                    return (
                      <div key={index} className='flex flex-col items-center'>
                        <div
                          className='w-full bg-green-500 rounded-t transition-all hover:bg-green-600'
                          style={{
                            height: `${height}%`,
                            minHeight: co2Value > 0 ? '4px' : '0',
                          }}
                          title={`${monthLabel}: ${formatNumber(co2Value)} kg`}
                        ></div>
                        <span className='text-xs text-gray-500 mt-2'>
                          {monthLabel.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>

            {/* Project Breakdown */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>COâ‚‚ theo dá»± Ã¡n</h2>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>
                        Dá»± Ã¡n
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-medium text-gray-500'>
                        COâ‚‚ (kg)
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-medium text-gray-500'>
                        TÃ­n chá»‰
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-medium text-gray-500'>
                        Tá»· lá»‡
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>
                        Biá»ƒu Ä‘á»“
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.projectBreakdown.map((project) => (
                      <tr
                        key={project.projectId}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='py-3 px-4 text-sm font-medium text-gray-900'>
                          {project.projectName}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600 text-right'>
                          {formatNumber(project.co2Kg)}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600 text-right'>
                          {formatNumber(project.creditsIssued)}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600 text-right'>
                          {formatPercentage(project.percentage)}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-green-500 h-2 rounded-full'
                              style={{ width: `${project.percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default Co2ReportPage;
