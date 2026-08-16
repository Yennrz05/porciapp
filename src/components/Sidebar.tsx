import {
  LayoutDashboard,
  Boxes,
  Wheat,
  Database,
  Settings,
  PiggyBank,
  X,
  UserRound,
  Moon,
  Sun,
} from 'lucide-react';
import type { View } from '@/types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  nombre: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const navItems: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { view: 'lotes', label: 'Lotes', icon: Boxes },
  { view: 'fases', label: 'Consumo', icon: Wheat },
  { view: 'datos', label: 'Importar / Exportar', icon: Database },
  { view: 'config', label: 'Configuración', icon: Settings },
];

export function Sidebar({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  nombre,
  theme,
  toggleTheme,
}: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar__overlay ${isOpen ? 'sidebar__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <PiggyBank />
          </div>
          <div className="sidebar__title">
            <h1>Gestión Porcina</h1>
            <p>Pedidos de alimento</p>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Cerrar menú">
            <X />
          </button>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                className={`sidebar__nav-item ${
                  currentView === item.view ? 'sidebar__nav-item--active' : ''
                }`}
                onClick={() => {
                  onNavigate(item.view);
                  onClose();
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-icon">
              <UserRound />
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-label">Bienvenido</span>
              <strong className="sidebar__user-name">{nombre}</strong>
            </div>
          </div>
          <button
            className="sidebar__theme-btn"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
        </div>
      </aside>
    </>
  );
}
