import { useState } from 'react';
import { Plus, Pencil, Trash2, Wheat, Info } from 'lucide-react';
import type { AppData, FaseConsumo } from '@/types';
import { formatNumber } from '@/utils';
import { FaseModal } from '@/components/FaseModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface FasesViewProps {
  data: AppData;
  onAddFase: (fase: Omit<FaseConsumo, 'id'>) => void;
  onUpdateFase: (id: string, updates: Partial<FaseConsumo>) => void;
  onDeleteFase: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const DOT_COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

export function FasesView({
  data,
  onAddFase,
  onUpdateFase,
  onDeleteFase,
  showToast,
}: FasesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFase, setEditingFase] = useState<FaseConsumo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FaseConsumo | null>(null);

  const openNew = () => {
    setEditingFase(null);
    setModalOpen(true);
  };

  const openEdit = (fase: FaseConsumo) => {
    setEditingFase(fase);
    setModalOpen(true);
  };

  const handleSave = (fase: Omit<FaseConsumo, 'id'> | FaseConsumo) => {
    if ('id' in fase) {
      onUpdateFase(fase.id, fase);
      showToast('Fase actualizada correctamente', 'success');
    } else {
      onAddFase(fase);
      showToast('Fase creada correctamente', 'success');
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDeleteFase(confirmDelete.id);
      showToast(`Fase "${confirmDelete.nombre}" eliminada`, 'info');
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header__left">
          <span className="section-header__title">Fases de Consumo</span>
          <span className="section-header__subtitle">
            Alimentación por etapa de crecimiento
          </span>
        </div>
        <div className="section-header__actions">
          {data.fases.length > 0 && (
            <button className="btn btn--primary" onClick={openNew}>
              <Plus />
              Nueva Fase
            </button>
          )}
        </div>
      </div>

      <div className="card mb-2">
        <div className="card__body">
          <div className="info-note">
            <Info />
            <span className="text-muted">
              La fase se asigna automáticamente según la edad del lote.
            </span>
          </div>
        </div>
      </div>

      <div className="fase-grid">
        {data.fases.map((fase, index) => (
          <div key={fase.id} className="fase-card">
            <div className="fase-card__body">
              <div className="fase-card__header">
                <span
                  className="fase-card__dot"
                  style={{ background: DOT_COLORS[index % DOT_COLORS.length] }}
                />
                <div>
                  <div className="fase-card__nombre">{fase.nombre}</div>
                  <div className="fase-card__semana">
                    Semanas {fase.semanaInicio} – {fase.semanaFin}
                  </div>
                </div>
              </div>
              <div className="fase-card__datos">
                <div className="fase-card__dato">
                  <span className="fase-card__dato-label">Consumo diario</span>
                  <span className="fase-card__dato-value">
                    {formatNumber(fase.consumoDiarioKg, 2)} kg
                  </span>
                </div>
                <div className="fase-card__dato">
                  <span className="fase-card__dato-label">Consumo semanal</span>
                  <span className="fase-card__dato-value">
                    {formatNumber(fase.consumoDiarioKg * 7, 2)} kg
                  </span>
                </div>
              </div>
            </div>
            <div className="fase-card__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => openEdit(fase)}>
                <Pencil /> Editar
              </button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setConfirmDelete(fase)}
              >
                <Trash2 /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.fases.length === 0 && (
        <div className="card">
          <div className="card__body">
            <div className="empty-state">
              <div className="empty-state__icon">
                <Wheat />
              </div>
              <div className="empty-state__title">No hay fases configuradas</div>
              <div className="empty-state__text">
                Crea fases de consumo para calcular los requerimientos de alimento.
              </div>
              <button className="btn btn--primary" onClick={openNew}>
                <Plus />
                Crear Primera Fase
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <FaseModal
          fase={editingFase}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar Fase"
        message={`¿Seguro que deseas eliminar la fase "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
