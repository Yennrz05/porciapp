import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { FaseConsumo } from '@/types';
import { formatNumber } from '@/utils';

interface FaseModalProps {
  fase: FaseConsumo | null;
  onSave: (fase: Omit<FaseConsumo, 'id'> | FaseConsumo) => void;
  onClose: () => void;
}

export function FaseModal({ fase, onSave, onClose }: FaseModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    semanaInicio: 1,
    semanaFin: 4,
    consumoDiarioKg: 0.5,
  });

  useEffect(() => {
    if (fase) {
      setForm({
        nombre: fase.nombre,
        semanaInicio: fase.semanaInicio,
        semanaFin: fase.semanaFin,
        consumoDiarioKg: fase.consumoDiarioKg,
      });
    }
  }, [fase]);

  const semanaValida =
    form.semanaFin >= form.semanaInicio && form.semanaInicio >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !semanaValida) return;
    const payload = {
      nombre: form.nombre.trim(),
      semanaInicio: Number(form.semanaInicio) || 1,
      semanaFin: Number(form.semanaFin) || 1,
      consumoDiarioKg: Number(form.consumoDiarioKg) || 0,
    };
    if (fase) {
      onSave({ ...fase, ...payload });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{fase ? 'Editar Fase' : 'Nueva Fase'}</span>
          <button className="modal__close" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label htmlFor="faseNombre">Nombre de la Fase *</label>
              <input
                id="faseNombre"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Fase 3 · Desarrollo"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="semanaInicio">Semana Inicio</label>
                <input
                  id="semanaInicio"
                  type="number"
                  min="1"
                  max="53"
                  value={form.semanaInicio}
                  onChange={(e) =>
                    setForm({ ...form, semanaInicio: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="semanaFin">Semana Fin</label>
                <input
                  id="semanaFin"
                  type="number"
                  min="1"
                  max="53"
                  value={form.semanaFin}
                  onChange={(e) =>
                    setForm({ ...form, semanaFin: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {!semanaValida && (
              <div className="form-error">La semana fin debe ser mayor o igual a la semana inicio.</div>
            )}

            <div className="form-group">
              <label htmlFor="consumoDiario">Consumo Diario (kg por animal)</label>
              <input
                id="consumoDiario"
                type="number"
                min="0"
                step="0.01"
                value={form.consumoDiarioKg}
                onChange={(e) =>
                  setForm({ ...form, consumoDiarioKg: Number(e.target.value) })
                }
              />
              <span className="form-hint">
                Consumo semanal por animal: {formatNumber(form.consumoDiarioKg * 7, 2)} kg
              </span>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={!semanaValida}>
              {fase ? 'Guardar Cambios' : 'Crear Fase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
