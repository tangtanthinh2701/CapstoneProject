import { useState, useEffect } from 'react';
import { fetchTreeSpecies, type TreeSpecies } from '../models/treeSpecies.api';
import {
  createProject,
  getProjectById,
  updateProject,
} from '../models/project.api';
import type { Phase, PhaseTreeSpecies } from '../models/project.api';

export interface TreeSpeciesOnPhaseForm {
  treeSpeciesId: number | null;
  quantityPlanned: number | null;
  costPerTree: number | null;
  plantingCost: number | null;
  maintenanceCostYearly: number | null;
  notes: string | null;
}

export interface PhaseForm {
  phaseNumber: number;
  phaseName: string;
  description: string;
  startDate: string;
  endDate: string;
  phaseStatus: string;
  expectedDurationDays: number | null;
  actualDurationDays: number | null;
  budget: number | null;
  actualCost: number | null;
  notes: string | null;
  treeSpecies: TreeSpeciesOnPhaseForm[];
}

export interface ProjectForm {
  name: string;
  description: string;
  locationText: string;
  latitude: string;
  longitude: string;
  area: string;
  areaUnit: string;
  usableArea: string;
  plantingDate: string;
  totalTreesPlanned: string;
  plantingDensity: string;
  projectStatus: string;
  isPublic: boolean;
  partnerOrganizations: string[];
  phases: PhaseForm[];
}

export const useProjectFormViewModel = (projectId?: string) => {
  const isEdit = Boolean(projectId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [treeSpeciesList, setTreeSpeciesList] = useState<TreeSpecies[]>([]);

  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    locationText: '',
    latitude: '',
    longitude: '',
    area: '',
    areaUnit: 'm2',
    usableArea: '',
    plantingDate: '',
    totalTreesPlanned: '',
    plantingDensity: '',
    projectStatus: 'PLANNING',
    isPublic: true,
    partnerOrganizations: [],
    phases: [],
  });

  useEffect(() => {
    fetchTreeSpecies().then(setTreeSpeciesList).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    getProjectById(projectId!)
      .then((project) => {
        setForm({
          name: project.name,
          description: project.description || '',
          locationText: project.locationText,
          latitude: String(project.latitude || ''),
          longitude: String(project.longitude || ''),
          area: String(project.area || ''),
          areaUnit: project.areaUnit || 'm2',
          usableArea: String(project.usableArea || ''),
          plantingDate: project.plantingDate || '',
          totalTreesPlanned: String(project.totalTreesPlanned || ''),
          plantingDensity: String(project.plantingDensity || ''),
          projectStatus: project.projectStatus,
          isPublic: project.isPublic,
          partnerOrganizations: project.partnerOrganizations || [],

          phases: project.phases.map((p: Phase) => ({
            phaseNumber: p.phaseNumber,
            phaseName: p.phaseName,
            description: p.description || '',
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            phaseStatus: p.phaseStatus,
            expectedDurationDays: p.expectedDurationDays ?? 0,
            actualDurationDays: p.actualDurationDays ?? 0,
            budget: p.budget ?? 0,
            actualCost: p.actualCost ?? 0,
            notes: p.notes ?? '',
            treeSpecies: p.treeSpecies.map((ts: PhaseTreeSpecies) => ({
              treeSpeciesId: ts.treeSpecies.id,
              quantityPlanned: ts.quantityPlanned,
              costPerTree: ts.costPerTree ?? 0,
              plantingCost: ts.plantingCost ?? 0,
              maintenanceCostYearly: ts.maintenanceCostYearly ?? 0,
              notes: ts.notes ?? '',
            })),
          })),
        });
      })
      .finally(() => setLoading(false));
  }, [isEdit, projectId]);

  const updateField = (key: keyof ProjectForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addPhase = () => {
    setForm((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          phaseNumber: prev.phases.length + 1,
          phaseName: '',
          description: '',
          phaseStatus: 'PLANNING',
          startDate: '',
          endDate: '',
          expectedDurationDays: 0,
          actualDurationDays: 0,
          budget: 0,
          actualCost: 0,
          notes: '',
          treeSpecies: [],
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

  const emptyTreeSpeciesRow: TreeSpeciesOnPhaseForm = {
    treeSpeciesId: null,
    quantityPlanned: null,
    costPerTree: null,
    plantingCost: null,
    maintenanceCostYearly: null,
    notes: '',
  };

  const addTreeSpeciesToPhase = (phaseIndex: number) => {
    setForm((prev) => {
      const phases = [...prev.phases];
      const phase = { ...phases[phaseIndex] };

      const species = [...phase.treeSpecies];
      const last = species[species.length - 1];
      const isEmpty =
        last &&
        last.treeSpeciesId == null &&
        last.quantityPlanned == null &&
        last.costPerTree == null &&
        last.plantingCost == null &&
        last.maintenanceCostYearly == null &&
        (!last.notes || last.notes.trim() === '');

      if (isEmpty) return prev;
      species.push({ ...emptyTreeSpeciesRow });
      phase.treeSpecies = species;
      phases[phaseIndex] = phase;

      return { ...prev, phases };
    });
  };

  const updatePhaseTreeSpeciesField = (
    pIndex: number,
    sIndex: number,
    key: keyof TreeSpeciesOnPhaseForm,
    value: any,
  ) => {
    setForm((prev) => {
      const phases = [...prev.phases];
      const species = [...phases[pIndex].treeSpecies];

      species[sIndex] = { ...species[sIndex], [key]: value };

      phases[pIndex] = { ...phases[pIndex], treeSpecies: species };

      return { ...prev, phases };
    });
  };

  const removeTreeSpeciesFromPhase = (
    phaseIndex: number,
    speciesIndex: number,
  ) => {
    setForm((prev) => {
      const phases = [...prev.phases];
      const phase = { ...phases[phaseIndex] };

      phase.treeSpecies = phase.treeSpecies.filter(
        (_, idx) => idx !== speciesIndex,
      );

      phases[phaseIndex] = phase;
      return { ...prev, phases };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      area: parseFloat(form.area),
      usableArea: parseFloat(form.usableArea),
      totalTreesPlanned: parseInt(form.totalTreesPlanned),
      plantingDensity: parseFloat(form.plantingDensity),
      phases: form.phases.map((p, idx) => ({
        ...p,
        phaseNumber: idx + 1,
        treeSpecies: p.treeSpecies.map((ts) => ({
          treeSpeciesId: ts.treeSpeciesId,
          quantityPlanned: ts.quantityPlanned,
          costPerTree: ts.costPerTree,
          plantingCost: ts.plantingCost,
          maintenanceCostYearly: ts.maintenanceCostYearly,
          notes: ts.notes,
        })),
      })),
    };

    try {
      if (isEdit) return await updateProject(projectId!, payload);
      return await createProject(payload);
    } catch (err) {
      setError('Lưu dự án thất bại');
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
    addTreeSpeciesToPhase,
    removeTreeSpeciesFromPhase,
    updatePhaseTreeSpeciesField,
    save,
  };
};
