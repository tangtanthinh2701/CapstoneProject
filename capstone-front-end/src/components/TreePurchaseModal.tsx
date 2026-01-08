import { useState, useEffect } from 'react';
import {
  getAvailableTrees,
  createTreePurchase,
  type AvailableTree,
  type TreePurchasePayload,
} from '../models/treePurchase.api';

interface Props {
  phaseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TreePurchaseModal({
  phaseId,
  onClose,
  onSuccess,
}: Props) {
  const [availableTrees, setAvailableTrees] = useState<AvailableTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrees, setLoadingTrees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<TreePurchasePayload>({
    phaseId,
    farmId: 0,
    treeSpeciesId: 0,
    quantity: 0,
    unitPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [selectedTree, setSelectedTree] = useState<AvailableTree | null>(null);

  // Load available trees
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTrees(true);
        setError(null);

        const trees = await getAvailableTrees();

        console.log('✅ Loaded trees:', trees); // Debug log

        // Validate data - SỬA LẠI FIELD NAME
        const validTrees = trees.filter(
          (t) =>
            t.farmId &&
            t.treeSpeciesId &&
            t.availableTrees !== undefined && // ← ĐỔI TÊN
            t.availableTrees > 0, // ← ĐỔI TÊN
        );

        console.log('✅ Valid trees:', validTrees); // Debug log

        setAvailableTrees(validTrees);

        if (validTrees.length === 0 && trees.length > 0) {
          setError('Không có cây khả dụng với dữ liệu hợp lệ');
        }
      } catch (err: any) {
        console.error('❌ Error loading trees:', err);
        setError(err.message || 'Không tải được danh sách cây');
      } finally {
        setLoadingTrees(false);
      }
    };
    load();
  }, []);

  const updateField = <K extends keyof TreePurchasePayload>(
    key: K,
    value: TreePurchasePayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTreeSelection = (tree: AvailableTree) => {
    setSelectedTree(tree);
    setForm((prev) => ({
      ...prev,
      farmId: tree.farmId,
      treeSpeciesId: tree.treeSpeciesId,
      unitPrice: tree.suggestedUnitPrice || 0, // ← ĐỔI TÊN
    }));
  };

  const calculateEstimatedCarbon = () => {
    if (!selectedTree || !form.quantity) return 0;
    return (selectedTree.estimatedCarbonPerTree || 0) * form.quantity;
  };

  const calculateTotalPrice = () => {
    return form.quantity * form.unitPrice;
  };

  const handleSubmit = async () => {
    // Validation
    if (form.farmId === 0) {
      setError('Vui lòng chọn nông trại và loài cây');
      return;
    }
    if (form.quantity <= 0) {
      setError('Số lượng phải lớn hơn 0');
      return;
    }
    if (selectedTree && form.quantity > (selectedTree.availableTrees || 0)) {
      // ← ĐỔI TÊN
      setError(
        `Số lượng vượt quá khả dụng (${selectedTree.availableTrees || 0})`, // ← ĐỔI TÊN
      );
      return;
    }
    if (form.unitPrice <= 0) {
      setError('Đơn giá phải lớn hơn 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTreePurchase(form);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Tạo đơn mua thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl max-w-4xl w-full p-6 my-8'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <span className='material-icons text-green-500'>
              add_shopping_cart
            </span>
            Mua cây cho Phase
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <span className='material-icons'>close</span>
          </button>
        </div>

        {error && (
          <div className='mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {/* TREE SELECTION */}
          <div>
            <label className='block text-sm mb-2 text-gray-300 font-semibold'>
              1. Chọn Nông trại & Loài cây{' '}
              <span className='text-red-400'>*</span>
            </label>

            {loadingTrees ? (
              <div className='text-center py-8 text-gray-400'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2'></div>
                <p>Đang tải danh sách cây...</p>
              </div>
            ) : availableTrees.length === 0 ? (
              <div className='text-center py-8 text-gray-400 bg-[#071811] rounded-lg border border-[#1E3A2B]'>
                <span className='material-icons text-5xl mb-2 opacity-30'>
                  inventory_2
                </span>
                <p>Không có cây khả dụng</p>
                <p className='text-xs mt-2'>Vui lòng thêm cây vào Farm trước</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2'>
                {availableTrees.map((tree, index) => {
                  const key = `${tree.farmId}-${tree.treeSpeciesId}-${index}`;
                  const isSelected =
                    selectedTree?.farmId === tree.farmId &&
                    selectedTree?.treeSpeciesId === tree.treeSpeciesId;

                  return (
                    <div
                      key={key}
                      onClick={() => handleTreeSelection(tree)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        isSelected
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-[#1E3A2B] bg-[#071811] hover:border-green-500/50'
                      }`}
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <h4 className='font-semibold text-white'>
                            {tree.treeSpeciesName || 'N/A'}
                          </h4>
                          <p className='text-xs text-gray-400 italic'>
                            {tree.scientificName || 'N/A'}
                          </p>
                        </div>
                        {isSelected && (
                          <span className='material-icons text-green-500'>
                            check_circle
                          </span>
                        )}
                      </div>

                      <div className='space-y-1 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Nông trại:</span>
                          <span className='text-gray-200 text-right truncate ml-2'>
                            {tree.farmName || 'N/A'}
                          </span>
                        </div>
                        {tree.farmLocation && (
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Địa điểm:</span>
                            <span className='text-gray-200 text-right truncate ml-2 text-xs'>
                              {tree.farmLocation}
                            </span>
                          </div>
                        )}
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Số lượng:</span>
                          <span className='text-green-400 font-semibold'>
                            {(tree.availableTrees || 0).toLocaleString()} cây
                          </span>
                        </div>
                        {tree.ageInYears !== undefined &&
                          tree.ageInMonths !== undefined && (
                            <div className='flex justify-between'>
                              <span className='text-gray-400'>Tuổi:</span>
                              <span className='text-gray-200'>
                                {tree.ageInYears} năm {tree.ageInMonths} tháng
                              </span>
                            </div>
                          )}
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Carbon/cây:</span>
                          <span className='text-blue-400'>
                            {(tree.estimatedCarbonPerTree || 0).toFixed(2)} tấn
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-400'>Giá đề xuất:</span>
                          <span className='text-yellow-400 font-semibold'>
                            {(tree.suggestedUnitPrice || 0).toLocaleString()}{' '}
                            VND
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PURCHASE DETAILS */}
          {selectedTree && (
            <>
              <div className='border-t border-[#1E3A2B] pt-4'>
                <label className='block text-sm mb-2 text-gray-300 font-semibold'>
                  2. Chi tiết đơn mua
                </label>

                <div className='grid grid-cols-1 md: grid-cols-2 gap-4'>
                  {/* QUANTITY */}
                  <div>
                    <label className='block text-xs mb-1 text-gray-400'>
                      Số lượng <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      max={selectedTree.availableTrees || 0}
                      className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                      placeholder={`Tối đa:  ${selectedTree.availableTrees || 0}`}
                      value={form.quantity || ''}
                      onChange={(e) =>
                        updateField('quantity', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  {/* UNIT PRICE */}
                  <div>
                    <label className='block text-xs mb-1 text-gray-400'>
                      Đơn giá (VND) <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='0'
                      step='1000'
                      className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                      value={form.unitPrice || ''}
                      onChange={(e) =>
                        updateField(
                          'unitPrice',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  {/* PURCHASE DATE */}
                  <div>
                    <label className='block text-xs mb-1 text-gray-400'>
                      Ngày mua
                    </label>
                    <input
                      type='date'
                      className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                      value={form.purchaseDate}
                      onChange={(e) =>
                        updateField('purchaseDate', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* NOTES */}
                <div className='mt-4'>
                  <label className='block text-xs mb-1 text-gray-400'>
                    Ghi chú
                  </label>
                  <textarea
                    rows={2}
                    className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='Ghi chú về đơn mua...'
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* SUMMARY */}
              <div className='bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4'>
                <h3 className='font-semibold mb-3 text-green-400'>
                  📊 Tóm tắt đơn hàng
                </h3>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Tổng cây:</span>
                    <span className='text-white font-semibold'>
                      {form.quantity.toLocaleString()} cây
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Tổng tiền:</span>
                    <span className='text-yellow-400 font-bold'>
                      {calculateTotalPrice().toLocaleString()} VND
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Carbon ước tính:</span>
                    <span className='text-green-400 font-bold'>
                      {calculateEstimatedCarbon().toFixed(2)} tấn
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Đơn giá/cây:</span>
                    <span className='text-white'>
                      {form.unitPrice.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-[#1E3A2B]'>
          <button
            onClick={onClose}
            className='px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition'
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className='px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold disabled:opacity-50 flex items-center gap-2 transition'
            disabled={loading || !selectedTree}
          >
            {loading ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                Đang tạo...
              </>
            ) : (
              <>
                <span className='material-icons text-lg'>shopping_cart</span>
                Tạo đơn mua
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
