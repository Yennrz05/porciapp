import { useState, useEffect, useCallback } from 'react';
import type { AppData, Lote, FaseConsumo, Config } from '@/types';
import { loadData, saveData, getDefaultData, generateId } from '@/utils';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateConfig = useCallback((config: Config) => {
    setData((prev) => ({ ...prev, config }));
  }, []);

  // Lotes CRUD
  const addLote = useCallback((lote: Omit<Lote, 'id' | 'fechaCreacion'>) => {
    setData((prev) => ({
      ...prev,
      lotes: [
        ...prev.lotes,
        { ...lote, id: generateId(), fechaCreacion: new Date().toISOString() },
      ],
    }));
  }, []);

  const updateLote = useCallback((id: string, updates: Partial<Lote>) => {
    setData((prev) => ({
      ...prev,
      lotes: prev.lotes.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, []);

  const deleteLote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      lotes: prev.lotes.filter((l) => l.id !== id),
    }));
  }, []);

  // Fases CRUD
  const addFase = useCallback((fase: Omit<FaseConsumo, 'id'>) => {
    setData((prev) => ({
      ...prev,
      fases: [...prev.fases, { ...fase, id: generateId() }],
    }));
  }, []);

  const updateFase = useCallback((id: string, updates: Partial<FaseConsumo>) => {
    setData((prev) => ({
      ...prev,
      fases: prev.fases.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }, []);

  const deleteFase = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      fases: prev.fases.filter((f) => f.id !== id),
    }));
  }, []);

  const importData = useCallback((imported: AppData) => {
    setData({
      lotes: imported.lotes ?? [],
      fases: imported.fases ?? [],
      config: { ...getDefaultData().config, ...imported.config },
      version: imported.version ?? '1.0.0',
    });
  }, []);

  const resetData = useCallback(() => {
    setData(getDefaultData());
  }, []);

  return {
    data,
    updateConfig,
    addLote,
    updateLote,
    deleteLote,
    addFase,
    updateFase,
    deleteFase,
    importData,
    resetData,
  };
}

export type AppDataHook = ReturnType<typeof useAppData>;
