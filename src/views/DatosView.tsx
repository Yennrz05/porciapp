import { useRef } from 'react';
import { Download, Upload, FileJson, Database } from 'lucide-react';
import type { AppData } from '@/types';
import { formatNumber } from '@/utils';
import { APP_VERSION } from '@/utils';
import { setLastBackup } from '@/exports';

interface DatosViewProps {
  data: AppData;
  onImport: (data: AppData) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function DatosView({ data, onImport, showToast }: DatosViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    if (sinDatos) {
      showToast('No hay datos para exportar. Crea al menos una fase o un lote.', 'warning');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `porciapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackup();
    showToast('Backup JSON exportado correctamente', 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text) as AppData;
        if (!imported.lotes || !Array.isArray(imported.lotes)) {
          throw new Error('Formato inválido');
        }
        onImport({
          lotes: imported.lotes,
          fases: imported.fases?.length ? imported.fases : [],
          config: imported.config ?? {
            pesoPorBache: 2700,
          },
          version: imported.version ?? APP_VERSION,
        });
        showToast('Datos importados correctamente', 'success');
      } catch {
        showToast('Error: archivo JSON inválido', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalAnimales = data.lotes.reduce((s, l) => s + l.numAnimales, 0);
  const sinDatos = data.lotes.length === 0 && data.fases.length === 0;

  return (
    <div>
      <div className="section-header">
        <div className="section-header__left">
          <span className="section-header__title">Importar / Exportar Datos</span>
          <span className="section-header__subtitle">
            Gestión de respaldos de la aplicación
          </span>
        </div>
      </div>

      <div className="data-actions">
        <div className="data-actions__cards data-actions__cards--backup">
        <div className="data-action-card">
          <div className="data-action-card__icon data-action-card__icon--green">
            <FileJson />
          </div>
          <div className="data-action-card__content">
            <div className="data-action-card__title">Exportar Backup (JSON)</div>
            <div className="data-action-card__desc">
              Descarga un archivo con todos los datos de la aplicación (lotes, fases y
              configuración) para guardar como respaldo y poder importarlo para recuperar el estado de la aplicación en otro momento.
            </div>
            <div className="data-action-card__actions">
              <button className="btn btn--primary" onClick={exportJSON} disabled={sinDatos}>
                <Download />
                Descargar JSON
              </button>
            </div>
          </div>
        </div>

        <div className="data-action-card">
          <div className="data-action-card__icon data-action-card__icon--blue">
            <Upload />
          </div>
          <div className="data-action-card__content">
            <div className="data-action-card__title">Importar Backup (JSON)</div>
            <div className="data-action-card__desc">
              Restaura el estado de la aplicación desde un archivo JSON previamente
              exportado. Esto reemplazará todos los datos actuales.
            </div>
            <div className="data-action-card__actions">
              <button className="btn btn--ghost" onClick={handleImportClick}>
                <Upload />
                Seleccionar Archivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">
              <Database /> Resumen de Datos Actuales
            </span>
          </div>
          <div className="card__body">
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-card__label">Lotes</div>
                <div className="stat-card__value">{data.lotes.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Fases de Consumo</div>
                <div className="stat-card__value">{data.fases.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Total Animales</div>
                <div className="stat-card__value">{formatNumber(totalAnimales)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Versión</div>
                <div className="stat-card__value">{data.version}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
