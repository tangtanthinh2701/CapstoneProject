import { useState, useEffect } from 'react';
import {
  createProject,
  getProjectById,
  updateProject,
} from '../models/project.api';
export interface PhaseForm {
  phaseOrder: number;
  phaseName: string;
  description: string;
  phaseStatus: string;
  expectedStartDate: string;
  expectedEndDate: string;
  actualStartDate: string;
  budget: number | null;
  targetConsumedCarbon: number | null;
  notes: string;
}

export interface ProjectForm {
  name: string;
  description: string;
  projectStatus: string;
  isPublic: boolean;
  phases: PhaseForm[];
}

// ========== HOOK ==========
export const useProjectFormViewModel = (projectId?: string) => {
  const isEdit = Boolean(projectId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [treeSpeciesList, setTreeSpeciesList] = useState<TreeSpecies[]>([]);

  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    projectStatus: 'PLANNING',
    isPublic: true,
    phases: [],
  });

  // Load existing project for edit
  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    console.log('🔵 Loading project ID:', projectId);

    getProjectById(projectId!)
      .then((response) => {
        console.log('✅ API Response:', response);

        if (!response.success) {
          throw new Error(response.message || 'API returned success=false');
        }

        const project = response.data;

        console.log('✅ Project data:', project);

        setForm({
          name: project.name,
          description: project.description || '',
          projectStatus: project.projectStatus,
          isPublic: project.isPublic,
          phases: (project.phases || []).map((p: any) => ({
            phaseOrder: p.phaseOrder,
            phaseName: p.phaseName,
            description: p.description || '',
            phaseStatus: p.phaseStatus,
            expectedStartDate: p.expectedStartDate || '',
            expectedEndDate: p.expectedEndDate || '',
            actualStartDate: p.actualStartDate || '',
            budget: p.budget ?? null,
            targetConsumedCarbon: p.targetConsumedCarbon ?? null,
            notes: p.notes || '',
          })),
        });
      })
      .catch((err) => {
        console.error('❌ Error loading project:', err);
        setError(err.message || 'Không thể tải dữ liệu dự án');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isEdit, projectId]);

  // ========== UPDATE FIELD ==========
  const updateField = (key: keyof ProjectForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ========== PHASE MANAGEMENT ==========
  const addPhase = () => {
    setForm((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          phaseOrder: prev.phases.length + 1,
          phaseName: '',
          description: '',
          phaseStatus: 'PLANNING',
          expectedStartDate: '',
          expectedEndDate: '',
          actualStartDate: '',
          budget: null,
          targetConsumedCarbon: null,
          notes: '',
        },
      ],
    }));
  };

  const removePhase = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== idx),
    }));
  };

  const updatePhaseField = (idx: number, key: keyof PhaseForm, value: any) => {
    setForm((prev) => {
      const phases = [...prev.phases];
      phases[idx] = { ...phases[idx], [key]: value };
      return { ...prev, phases };
    });
  };

  // ========== SAVE ==========
  const save = async () => {
    setSaving(true);
    setError(null);

    // Validate
    if (!form.name.trim()) {
      setError('Tên dự án không được để trống');
      setSaving(false);
      return;
    }

    // Prepare payload theo format API mới
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      projectStatus: form.projectStatus,
      isPublic: form.isPublic,
      phases: form.phases.map((p, idx) => ({
        phaseOrder: idx + 1,
        phaseName: p.phaseName.trim(),
        description: p.description.trim(),
        phaseStatus: p.phaseStatus,
        expectedStartDate: p.expectedStartDate,
        expectedEndDate: p.expectedEndDate,
        actualStartDate: p.actualStartDate,
        budget: p.budget ?? 0,
        targetConsumedCarbon: p.targetConsumedCarbon ?? 0,
        notes: p.notes.trim(),
      })),
    };

    try {
      if (isEdit) {
        await updateProject(projectId!, payload);
      } else {
        await createProject(payload);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || 'Lưu dự án thất bại');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    isEdit,
    loading,
    saving,
    error,
    form,
    treeSpeciesList,
    updateField,
    addPhase,
    removePhase,
    updatePhaseField,
    save,
  };
};
