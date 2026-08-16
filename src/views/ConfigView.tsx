import { useState, useEffect } from 'react';
import { Save, Settings, UserRound, Lock, Trash2 } from 'lucide-react';
import type { Config } from '@/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ConfigViewProps {
  config: Config;
  onSave: (config: Config) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  nombre: string;
  onCambiarNombre: (nombre: string) => void;
  onBloquear: () => void;
  onResetData: () => void;
}

export function ConfigView({
  config,
  onSave,
  showToast,
  nombre,
  onCambiarNombre,
  onBloquear,
  onResetData,
}: ConfigViewProps) {
  const [form, setForm] = useState<Config>(config);
  const [nombreForm, setNombreForm] = useState(nombre);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  useEffect(() => {
    setNombreForm(nombre);
  }, [nombre]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    showToast('Configuración guardada correctamente', 'success');
  };

  const handleGuardarNombre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreForm.trim()) {
      showToast('Escribe tu nombre', 'warning');
      return;
    }
    onCambiarNombre(nombreForm);
    showToast('Nombre actualizado correctamente', 'success');
  };

  const handleBloquear = () => {
    onBloquear();
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header__left">
          <span className="section-header__title">Configuración</span>
          <span className="section-header__subtitle">
            Parámetros de cálculo de pedidos y cuenta
          </span>
        </div>
      </div>

      <div className="config-grid">
        <div className="card">
          <div className="card__header">
            <span className="card__title">
              <Settings /> Parámetros de Cálculo
            </span>
          </div>
        <form onSubmit={handleSubmit}>
          <div className="card__body">
            <div className="form-group">
              <label htmlFor="pesoPorBache">Peso por Bache (kg)</label>
              <input
                id="pesoPorBache"
                type="number"
                min="1"
                value={form.pesoPorBache}
                onChange={(e) =>
                  setForm({ ...form, pesoPorBache: Number(e.target.value) })
                }
              />
              <span className="form-hint">
                Peso estándar de cada bache de alimento. Baches a pedir = Faltante ÷
                Peso por Bache (redondeado hacia arriba). Valor por defecto: 2700 kg.
              </span>
            </div>
          </div>
          <div className="modal__footer">
            <button type="submit" className="btn btn--primary">
              <Save />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card__header">
          <span className="card__title">
            <UserRound /> Mi cuenta
          </span>
        </div>
        <form onSubmit={handleGuardarNombre}>
          <div className="card__body">
            <div className="form-group">
              <label htmlFor="cuenta-nombre">Tu nombre</label>
              <input
                id="cuenta-nombre"
                type="text"
                placeholder="Escribe tu nombre"
                value={nombreForm}
                onChange={(e) => setNombreForm(e.target.value)}
              />
              <span className="form-hint">
                Se usa para el saludo personalizado en el inicio. No se incluye en la
                importación ni exportación de datos.
              </span>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={handleBloquear}>
              <Lock />
              Bloquear ahora
            </button>
            <button type="submit" className="btn btn--primary">
              <Save />
              Guardar Nombre
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card__header">
          <span className="card__title">
            <Trash2 /> Eliminar todos los datos
          </span>
        </div>
        <div className="card__body">
          <p className="form-hint">
            Borra todos los lotes y fases de consumo, y restablece la configuración a
            los valores por defecto. Tu nombre y preferencias de cuenta se conservan.
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setConfirmReset(true)}
          >
            <Trash2 />
            Eliminar todos los datos
          </button>
        </div>
      </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Eliminar todos los datos"
        message="Se eliminarán todos los lotes y fases de consumo, y la configuración volverá a los valores por defecto. Tu nombre se conserva. Esta acción no se puede deshacer."
        confirmLabel="Eliminar todo"
        onConfirm={() => {
          onResetData();
          setConfirmReset(false);
          showToast('Todos los datos fueron eliminados', 'success');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
