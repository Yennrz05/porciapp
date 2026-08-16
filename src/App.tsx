import { useState } from 'react';
import { Menu, Database, TriangleAlert } from 'lucide-react';
import type { View } from '@/types';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { Sidebar } from '@/components/Sidebar';
import { LockScreen } from '@/components/LockScreen';
import { ToastContainer } from '@/components/ToastContainer';
import { Dashboard } from '@/views/Dashboard';
import { LotesView } from '@/views/LotesView';
import { FasesView } from '@/views/FasesView';
import { DatosView } from '@/views/DatosView';
import { ConfigView } from '@/views/ConfigView';
import { getLastBackup } from '@/exports';

const viewTitles: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Inicio', subtitle: 'Pedido de alimento de la semana' },
  lotes: { title: 'Lotes', subtitle: 'Gestión de lotes porcinos' },
  fases: { title: 'Fases de Consumo', subtitle: 'Alimentación por etapa de crecimiento' },
  datos: { title: 'Importar / Exportar', subtitle: 'Respaldo de datos' },
  config: { title: 'Configuración', subtitle: 'Parámetros de la aplicación' },
};

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
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
  } = useAppData();
  const { profile, desbloquear, bloquear, cambiarNombre } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toasts, showToast, dismissToast } = useToast();

  const currentTitle = viewTitles[view];

  const lastBackupRaw = getLastBackup();
  let lastBackupDate: Date | null = null;
  let lastBackupText: string | null = null;
  if (lastBackupRaw) {
    const date = new Date(lastBackupRaw);
    if (!isNaN(date.getTime())) {
      lastBackupDate = date;
      lastBackupText = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    }
  }
  const backupAntiguo =
    lastBackupDate !== null &&
    Date.now() - lastBackupDate.getTime() > 15 * 24 * 60 * 60 * 1000;

  if (!profile) {
    return <LockScreen onUnlock={desbloquear} />;
  }

  return (
    <div className="app">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        nombre={profile.nombre}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <button
              className="topbar__menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <div>
              <div className="topbar__title">{currentTitle.title}</div>
            </div>
          </div>
          <div className="topbar__right">
            <span
              className={`badge badge--backup ${
                backupAntiguo ? 'badge--danger' : lastBackupText ? 'badge--success' : 'badge--neutral'
              }`}
            >
              {backupAntiguo ? <TriangleAlert /> : <Database />}
              {lastBackupText
                ? `Último respaldo: ${lastBackupText}`
                : 'Sin respaldo guardado'}
            </span>
          </div>
        </header>
        <main className="content">
          {view === 'dashboard' && <Dashboard data={data} onNavigate={setView} />}
          {view === 'lotes' && (
            <LotesView
              data={data}
              onAddLote={addLote}
              onUpdateLote={updateLote}
              onDeleteLote={deleteLote}
              showToast={showToast}
            />
          )}
          {view === 'fases' && (
            <FasesView
              data={data}
              onAddFase={addFase}
              onUpdateFase={updateFase}
              onDeleteFase={deleteFase}
              showToast={showToast}
            />
          )}
          {view === 'datos' && (
            <DatosView data={data} onImport={importData} showToast={showToast} />
          )}
          {view === 'config' && (
            <ConfigView
              config={data.config}
              onSave={updateConfig}
              showToast={showToast}
              nombre={profile.nombre}
              onCambiarNombre={cambiarNombre}
              onBloquear={bloquear}
              onResetData={resetData}
            />
          )}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
