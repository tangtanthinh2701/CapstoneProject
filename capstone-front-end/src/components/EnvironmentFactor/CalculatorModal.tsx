import React, { useState } from 'react';
import type {
  CO2CalculationInput,
  CO2CalculationResult,
  EnvironmentFactor,
} from '../../models/environmentFactor.model';
import { formatNumber } from '../../utils/formatters';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (data: CO2CalculationInput) => Promise<CO2CalculationResult>;
  factors: EnvironmentFactor[];
  batches?: Array<{ id: number; code: string; treeSpeciesName: string }>;
  treeSpecies?: Array<{ id: number; name: string; baseCarbonRate: number }>;
  isLoading?: boolean;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onCalculate,
  factors,
  batches = [],
  treeSpecies = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    batchId: 0,
    treeSpeciesId: 0,
    quantityAlive: 0,
    avgHeightCm: 0,
    avgTrunkDiameterCm: 0,
    avgCanopyDiameterCm: 0,
  });

  const [factorValues, setFactorValues] = useState<Record<number, number>>({});
  const [result, setResult] = useState<CO2CalculationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : parseInt(value) || 0,
    }));
  };

  const handleFactorChange = (factorId: number, value: number) => {
    setFactorValues((prev) => ({
      ...prev,
      [factorId]: value,
    }));
  };

  const handleCalculate = async () => {
    const environmentFactors = Object.entries(factorValues).map(([factorId, value]) => ({
      factorId: parseInt(factorId),
      value,
    }));

    const input: CO2CalculationInput = {
      ...formData,
      environmentFactors,
    };

    try {
      const calcResult = await onCalculate(input);
      setResult(calcResult);
    } catch (error) {
      console.error('Calculation failed:', error);
    }
  };

  const activeFactors = factors.filter((f) => f.isActive);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-black bg-opacity-50' onClick={onClose}></div>

        <div className='relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl'>
            <h2 className='text-xl font-semibold text-gray-900'>TÃ­nh toÃ¡n COâ‚‚ háº¥p thá»¥</h2>
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            >
              âœ•
            </button>
          </div>

          <div className='p-6 space-y-6'>
            {/* Batch Selection */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>LÃ´ cÃ¢y</label>
                <select
                  name='batchId'
                  value={formData.batchId}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                >
                  <option value={0}>Chá»n lÃ´ cÃ¢y</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.code} - {batch.treeSpeciesName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>LoÃ i cÃ¢y</label>
                <select
                  name='treeSpeciesId'
                  value={formData.treeSpeciesId}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                >
                  <option value={0}>Chá»n loÃ i cÃ¢y</option>
                  {treeSpecies.map((species) => (
                    <option key={species.id} value={species.id}>
                      {species.name} (Rate: {species.baseCarbonRate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tree Measurements */}
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>ThÃ´ng sá»‘ cÃ¢y trá»“ng</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>Sá»‘ cÃ¢y sá»‘ng</label>
                  <input
                    type='number'
                    name='quantityAlive'
                    value={formData.quantityAlive}
                    onChange={handleChange}
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>Chiá»u cao TB (cm)</label>
                  <input
                    type='number'
                    name='avgHeightCm'
                    value={formData.avgHeightCm}
                    onChange={handleChange}
                    min='0'
                    step='0.1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    ÄÆ°á»ng kÃ­nh thÃ¢n TB (cm)
                  </label>
                  <input
                    type='number'
                    name='avgTrunkDiameterCm'
                    value={formData.avgTrunkDiameterCm}
                    onChange={handleChange}
                    min='0'
                    step='0.1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    ÄÆ°á»ng kÃ­nh tÃ¡n TB (cm)
                  </label>
                  <input
                    type='number'
                    name='avgCanopyDiameterCm'
                    value={formData.avgCanopyDiameterCm}
                    onChange={handleChange}
                    min='0'
                    step='0.1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Environment Factors */}
            <div className='p-4 bg-green-50 rounded-lg'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>Yáº¿u tá»‘ mÃ´i trÆ°á»ng</h3>
              <div className='space-y-4'>
                {activeFactors.map((factor) => (
                  <div key={factor.id} className='flex items-center gap-4'>
                    <div className='flex-1'>
                      <label className='block text-sm text-gray-700'>
                        {factor.factorName}
                        <span className='text-xs text-gray-500 ml-1'>({factor.unit})</span>
                      </label>
                      <p className='text-xs text-gray-400'>
                        Pháº¡m vi: {factor.minValue} - {factor.maxValue}
                      </p>
                    </div>
                    <input
                      type='number'
                      value={factorValues[factor.id] || factor.baseValue}
                      onChange={(e) =>
                        handleFactorChange(factor.id, parseFloat(e.target.value) || 0)
                      }
                      min={factor.minValue}
                      max={factor.maxValue}
                      step='0.01'
                      className='w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className='w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
            >
              {isLoading ? 'Äang tÃ­nh toÃ¡n...' : 'TÃ­nh toÃ¡n COâ‚‚'}
            </button>

            {/* Result */}
            {result && (
              <div className='p-4 bg-blue-50 rounded-lg'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Káº¿t quáº£ tÃ­nh toÃ¡n
                </h3>

                <div className='grid grid-cols-2 gap-4 mb-4'>
                  <div className='text-center p-4 bg-white rounded-lg'>
                    <p className='text-3xl font-bold text-blue-600'>
                      {formatNumber(result.baseCO2Kg)}
                    </p>
                    <p className='text-sm text-gray-500'>COâ‚‚ cÆ¡ báº£n (kg)</p>
                  </div>
                  <div className='text-center p-4 bg-white rounded-lg'>
                    <p className='text-3xl font-bold text-green-600'>
                      {formatNumber(result.adjustedCO2Kg)}
                    </p>
                    <p className='text-sm text-gray-500'>COâ‚‚ Ä‘iá»u chá»‰nh (kg)</p>
                  </div>
                </div>

                <div className='mb-4'>
                  <p className='text-sm text-gray-600'>
                    Há»‡ sá»‘ mÃ´i trÆ°á»ng tá»•ng:{' '}
                    <span className='font-semibold'>
                      {result.totalEnvironmentFactor.toFixed(3)}
                    </span>
                  </p>
                </div>

                {result.factorBreakdown.length > 0 && (
                  <div>
                    <p className='text-sm font-medium text-gray-700 mb-2'>
                      Chi tiáº¿t cÃ¡c yáº¿u tá»‘:
                    </p>
                    <div className='space-y-2'>
                      {result.factorBreakdown.map((fb) => (
                        <div
                          key={fb.factorId}
                          className='flex justify-between text-sm p-2 bg-white rounded'
                        >
                          <span>{fb.factorName}</span>
                          <span
                            className={
                              fb.impact === 'POSITIVE'
                                ? 'text-green-600'
                                : fb.impact === 'NEGATIVE'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }
                          >
                            Ã—{fb.multiplier.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className='w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              ÄÃ³ng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;
