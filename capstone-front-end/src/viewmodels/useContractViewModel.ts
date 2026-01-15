import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getContractList,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractStats,
  type Contract,
  type ContractPayload,
  type ContractStats,
} from '../models/contract.api';

// ========== CONTRACT LIST VIEWMODEL ==========
export const useContractViewModel = () => {
  const [data, setData] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    pending: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contractsRes, statsData] = await Promise.all([
        getContractList({
          status: statusFilter || undefined,
          search: search || undefined,
          month: monthFilter || undefined,
          year: yearFilter || undefined,
        }),
        getContractStats(),
      ]);

      if (contractsRes.success && contractsRes.data) {
        setData(contractsRes.data);
        setStats(statsData);
      } else {
        throw new Error('Không tải được danh sách hợp đồng');
      }
    } catch (e: any) {
      console.error('Error loading contracts:', e);
      setError(e.message || 'Không tải được danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, search, monthFilter, yearFilter]);

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa hợp đồng này? ')) return;

    try {
      await deleteContract(id);
      await load();
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  };

  return {
    loading,
    error,
    data,
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    remove,
    reload: load,
  };
};

// ========== CONTRACT FORM VIEWMODEL ==========
export const useContractFormViewModel = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ContractPayload>({
    projectId: 0,
    contractCategory: 'ENTERPRISE_PROJECT',
    contractType: 'OWNERSHIP',
    unitPrice: 0,
    totalAmount: 0,
    contractTermYears: 1,
    startDate: '',
    endDate: '',
    autoRenewal: false,
    harvestRights: false,
    transferAllowed: true,
    content: {
      treeCount: 0,
      carbonPercentage: 0,
      benefits: [],
    },
  });

  useEffect(() => {
    if (!isEdit) {
      setInitialLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const response = await getContractById(Number(id));

        if (!response.success || !response.data) {
          throw new Error('Không tải được dữ liệu hợp đồng');
        }

        const data = response.data;

        setForm({
          projectId: data.projectId,
          contractCategory: data.contractCategory,
          contractType: data.contractType,
          unitPrice: data.unitPrice,
          totalAmount: data.totalAmount,
          contractTermYears: data.contractTermYears,
          startDate: data.startDate,
          endDate: data.endDate,
          autoRenewal: data.autoRenewal,
          renewalTermYears: data.renewalTermYears || undefined,
          renewalNoticeDays: data.renewalNoticeDays || undefined,
          maxRenewals: data.maxRenewals || undefined,
          harvestRights: data.harvestRights,
          transferAllowed: data.transferAllowed,
          earlyTerminationPenalty: data.earlyTerminationPenalty || undefined,
          notes: data.notes || undefined,
          content: data.content || undefined,
        });
      } catch (err: any) {
        console.error('Error loading contract:', err);
        setError(err.message || 'Không tải được dữ liệu hợp đồng');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const updateField = <K extends keyof ContractPayload>(
    key: K,
    value: ContractPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateContentField = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value,
      },
    }));
  };

  const validate = (): boolean => {
    if (form.projectId === 0) {
      setError('Vui lòng chọn dự án');
      return false;
    }
    if (form.totalAmount <= 0) {
      setError('Tổng giá trị hợp đồng phải lớn hơn 0');
      return false;
    }
    if (!form.startDate || !form.endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        const response = await updateContract(Number(id), form);
        console.log('✅ Update success:', response);
        return response;
      } else {
        const response = await createContract(form);
        console.log('✅ Create success:', response);
        return response;
      }
    } catch (e: any) {
      console.error('❌ Save failed:', e);
      setError(e.message || 'Lưu hợp đồng thất bại');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    isEdit,
    loading,
    initialLoading,
    error,
    form,
    updateField,
    updateContentField,
    save,
  };
};

// ========== CONTRACT DETAIL VIEWMODEL ==========
export const useContractDetailViewModel = () => {
  const { id } = useParams();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getContractById(Number(id));

      if (!response.success || !response.data) {
        throw new Error('Không tìm thấy hợp đồng');
      }

      setContract(response.data);
    } catch (err: any) {
      console.error('Error loading contract detail:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return {
    contract,
    loading,
    error,
    reload: load,
  };
};
