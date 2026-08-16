import { useState, useEffect } from 'react';
import { X, CalendarDays, PiggyBank, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Lote, FaseConsumo, View } from '@/types';
import { calcularLote, getCurrentWeek, formatNumber, formatKg, plural } from '@/utils';

interface LoteModalProps {
  lote: Lote | null;
  fases: FaseConsumo[];
  pesoPorBache: number;
  onNavigate: (view: View) => void;
  onSave: (lote: Omit<Lote, 'id' | 'fechaCreacion'> | Lote) => void;
  onClose: () => void;
}

export function LoteModal({
  lote,
  fases,
  pesoPorBache,
  onNavigate,
  onSave,
  onClose,
}: LoteModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    numAnimales: '',
    semanaIngreso: String(getCurrentWeek()),
    inventarioKg: '',
    notas: '',
  });

  useEffect(() => {
    if (lote) {
      setForm({
        nombre: lote.nombre,
        numAnimales: String(lote.numAnimales),
        semanaIngreso: String(lote.semanaIngreso),
        inventarioKg: String(lote.inventarioKg),
        notas: lote.notas,
      });
    }
  }, [lote]);

  const semanaActual = getCurrentWeek();

  const num = Number(form.numAnimales) || 0;
  const semana = Number(form.semanaIngreso) || 1;
  const inv = Number(form.inventarioKg) || 0;

  const preview = calcularLote(
    {
      id: 'preview',
      nombre: form.nombre || 'Vista previa',
      numAnimales: num,
      semanaIngreso: semana,
      inventarioKg: inv,
      notas: '',
      fechaCreacion: '',
    },
    fases,
    { pesoPorBache }
  );

  const sinFase = !preview.faseId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (sinFase) return;
    if (lote) {
      onSave({ ...lote, ...form, numAnimales: num, semanaIngreso: semana, inventarioKg: inv });
    } else {
      onSave({ ...form, numAnimales: num, semanaIngreso: semana, inventarioKg: inv });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{lote ? 'Editar Lote' : 'Nuevo Lote'}</span>
          <button className="modal__close" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Lote *</label>
              <input
                id="nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Lote 1 · Enero 2026"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numAnimales">Número de Animales</label>
                <input
                  id="numAnimales"
                  type="number"
                  min="0"
                  value={form.numAnimales}
                  onChange={(e) =>
                    setForm({ ...form, numAnimales: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="inventarioKg">Inventario en Almacén (kg)</label>
                <input
                  id="inventarioKg"
                  type="number"
                  min="0"
                  value={form.inventarioKg}
                  onChange={(e) =>
                    setForm({ ...form, inventarioKg: e.target.value })
                  }
                />
                <span className="form-hint">Kilos disponibles hoy</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="semanaIngreso">Semana de Llegada</label>
              <input
                id="semanaIngreso"
                type="number"
                min="1"
                max="53"
                value={form.semanaIngreso}
                onChange={(e) =>
                  setForm({ ...form, semanaIngreso: e.target.value })
                }
              />
            </div>

            {sinFase && (
              <div className="form-error form-error--warning">
                <div className="form-error__row">
                  <AlertTriangle />
                  <span>
                    No existe una fase de consumo que cubra las semanas de este lote.
                    Crea una fase antes de guardarlo.
                  </span>
                </div>
                <button
                  type="button"
                  className="form-error__link"
                  onClick={() => onNavigate('fases')}
                >
                  Ir a Fases de Consumo <ArrowRight />
                </button>
              </div>
            )}

            <div className="preview-panel">
              <div className="preview-panel__header">
                <CalendarDays />
                <span>
                  Semana {semanaActual} · Vista previa automática del cálculo
                </span>
              </div>
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-item__label">Edad del lote</span>
                  <span className="preview-item__value">
                    {preview.edadSemanas} sem
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-item__label">Fase automática</span>
                  <span className="preview-item__value">
                    {preview.faseNombre}
                    {preview.consumoDiarioKg > 0
                      ? ` · ${formatNumber(preview.consumoDiarioKg, 2)} kg`
                      : ''}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-item__label">Consumo semanal</span>
                  <span className="preview-item__value">
                    {formatKg(preview.consumoSemanalKg)}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-item__label">Faltante</span>
                  <span
                    className={`preview-item__value ${
                      preview.deficitKg > 0 ? 'text-danger' : 'text-success'
                    }`}
                  >
                    {preview.deficitKg > 0
                      ? formatKg(preview.deficitKg)
                      : 'OK'}
                  </span>
                </div>
              </div>
              <div
                className={`preview-result ${
                  preview.bachesAPedir > 0
                    ? 'preview-result--warning'
                    : 'preview-result--ok'
                }`}
              >
                <PiggyBank />
                <span>
                  Baches a pedir:{' '}
                  <strong>
                    {preview.bachesAPedir > 0
                      ? `${plural(preview.bachesAPedir, 'bache', 'baches')} de ${formatKg(pesoPorBache)}`
                      : 'Ninguno'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notas">Notas</label>
              <textarea
                id="notas"
                rows={2}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Observaciones del lote..."
              />
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={sinFase || !form.nombre.trim()}>
              {lote ? 'Guardar Cambios' : 'Crear Lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
