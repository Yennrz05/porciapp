import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Boxes,
  AlertTriangle,
  CalendarDays,
  Search,
} from 'lucide-react';
import type { AppData, Lote, LoteCalculado, View } from '@/types';
import { calcularTodos, formatNumber, formatKg, getCurrentWeek, plural, estadoDescripcion } from '@/utils';
import { LoteModal } from '@/components/LoteModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';

const PAGE_SIZE = 8;

interface LotesViewProps {
  data: AppData;
  onAddLote: (lote: Omit<Lote, 'id' | 'fechaCreacion'>) => void;
  onUpdateLote: (id: string, updates: Partial<Lote>) => void;
  onDeleteLote: (id: string) => void;
  onNavigate: (view: View) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function LotesView({
  data,
  onAddLote,
  onUpdateLote,
  onDeleteLote,
  onNavigate,
  showToast,
}: LotesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lote | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'faltante' | 'ok'>('todos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [busqueda, filtro]);

  const semanaActual = getCurrentWeek();
  const lotesCalc = calcularTodos(data.lotes, data.fases, data.config);

  const query = busqueda.trim().toLowerCase();
  const lotesFiltrados = lotesCalc.filter((l) => {
    if (query && !l.nombre.toLowerCase().includes(query) && !l.faseNombre.toLowerCase().includes(query))
      return false;
    if (filtro === 'faltante' && l.bachesAPedir <= 0) return false;
    if (filtro === 'ok' && l.bachesAPedir > 0) return false;
    return true;
  });

  const totalPages = Math.ceil(lotesFiltrados.length / PAGE_SIZE);
  const lotesPaginados = lotesFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalAnimales = data.lotes.reduce((s, l) => s + l.numAnimales, 0);
  const totalBaches = lotesCalc.reduce((s, l) => s + l.bachesAPedir, 0);
  const lotesAlerta = lotesCalc.filter((l) => l.estado !== 'ok').length;

  const openNew = () => {
    if (data.fases.length === 0) {
      showToast(
        'Primero debes crear al menos una fase de consumo antes de registrar un lote',
        'warning'
      );
      return;
    }
    setEditingLote(null);
    setModalOpen(true);
  };

  const openEdit = (lote: Lote) => {
    setEditingLote(lote);
    setModalOpen(true);
  };

  const handleSave = (lote: Omit<Lote, 'id' | 'fechaCreacion'> | Lote) => {
    if ('id' in lote) {
      onUpdateLote(lote.id, lote);
    } else {
      onAddLote(lote);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDeleteLote(confirmDelete.id);
      showToast(`Lote "${confirmDelete.nombre}" eliminado`, 'info');
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header__left">
          <span className="section-header__title">Gestión de Lotes</span>
          <span className="section-header__subtitle">
            {plural(data.lotes.length, 'lote registrado', 'lotes registrados')}
          </span>
        </div>
        <div className="section-header__actions">
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Buscar lote o fase..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar lote"
            />
          </div>
          {data.lotes.length > 0 && (
            <button className="btn btn--primary" onClick={openNew}>
              <Plus />
              Nuevo Lote
            </button>
          )}
        </div>
      </div>

      {data.lotes.length > 0 && (
        <div className="filter-bar">
          <button
            className={`btn btn--sm ${filtro === 'todos' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({lotesCalc.length})
          </button>
          <button
            className={`btn btn--sm ${filtro === 'faltante' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFiltro('faltante')}
          >
            Con faltante ({lotesCalc.filter((l) => l.bachesAPedir > 0).length})
          </button>
          <button
            className={`btn btn--sm ${filtro === 'ok' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFiltro('ok')}
          >
            Inventario OK ({lotesCalc.filter((l) => l.bachesAPedir <= 0).length})
          </button>
        </div>
      )}

      <div className="mini-strip">
        <div className="mini-strip__item">
          <CalendarDays />
          <span>
            Semana actual <strong>{semanaActual}</strong>
          </span>
        </div>
        <div className="mini-strip__item">
          <Boxes />
          <span>
            <strong>{formatNumber(totalAnimales)}</strong> animales
          </span>
        </div>
        <div className="mini-strip__item">
          <AlertTriangle />
          <span>
            <strong>{lotesAlerta}</strong> en alerta
          </span>
        </div>
        <div className="mini-strip__item mini-strip__item--accent">
          <span>
            Pedido total: <strong>{totalBaches}</strong>{' '}
            {totalBaches === 1 ? 'bache' : 'baches'}
          </span>
        </div>
      </div>

      {lotesCalc.length === 0 ? (
        <div className="card">
          <div className="card__body">
            <div className="empty-state">
              <div className="empty-state__icon">
                <Boxes />
              </div>
              <div className="empty-state__title">No hay lotes registrados</div>
              <div className="empty-state__text">
                Crea tu primer lote. La fase y el consumo se calculan solos según la
                semana actual ({semanaActual}) y la semana de llegada.
              </div>
              <button className="btn btn--primary" onClick={openNew}>
                <Plus />
                Crear Primer Lote
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {lotesFiltrados.length === 0 ? (
            <div className="card">
              <div className="card__body">
                <div className="empty-state">
                  <div className="empty-state__icon">
                    <Search />
                  </div>
                  <div className="empty-state__title">Sin resultados</div>
                  <div className="empty-state__text">
                    No hay lotes que coincidan con tu búsqueda.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="table-wrap desktop-table">
                <table className="table table--striped">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Animales</th>
                      <th>Fase (kg/animal/día)</th>
                      <th>Edad</th>
                      <th>Consumo Sem.</th>
                      <th>Inventario</th>
                      <th>Faltante</th>
                      <th>Baches</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesPaginados.map((l) => (
                      <LoteRow
                        key={l.id}
                        lote={l}
                        onEdit={() => openEdit(l)}
                        onDelete={() => setConfirmDelete(l)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mobile-cards">
                {lotesPaginados.map((l) => (
                  <LoteMobileCard
                    key={l.id}
                    lote={l}
                    onEdit={() => openEdit(l)}
                    onDelete={() => setConfirmDelete(l)}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={lotesFiltrados.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {modalOpen && (
        <LoteModal
          lote={editingLote}
          fases={data.fases}
          pesoPorBache={data.config.pesoPorBache}
          onNavigate={onNavigate}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar Lote"
        message={`¿Seguro que deseas eliminar el lote "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function LoteRow({
  lote,
  onEdit,
  onDelete,
}: {
  lote: LoteCalculado;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const rowClass =
    lote.estado === 'danger'
      ? 'row--danger'
      : lote.estado === 'warning'
      ? 'row--warning'
      : '';

  return (
    <tr className={rowClass}>
      <td className="font-bold">{lote.nombre}</td>
      <td>{formatNumber(lote.numAnimales)}</td>
      <td>
        <div className="td-primary">
          {lote.faseId ? (
            lote.faseNombre
          ) : (
            <span className="text-warning">Sin fase</span>
          )}
        </div>
        <div className="td-secondary">{formatNumber(lote.consumoDiarioKg, 2)} kg/animal/día</div>
      </td>
      <td>
        <div className="td-primary">{lote.edadSemanas} sem</div>
        <div className="td-secondary">sem {lote.semanaActual} − sem {lote.semanaIngreso}</div>
      </td>
      <td>{formatKg(lote.consumoSemanalKg)}</td>
      <td>{formatKg(lote.inventarioKg)}</td>
      <td className={lote.deficitKg > 0 ? 'text-danger font-bold' : 'text-success'}>
        {lote.deficitKg > 0 ? formatKg(lote.deficitKg) : 'OK'}
      </td>
      <td className="font-bold">{lote.bachesAPedir > 0 ? lote.bachesAPedir : '-'}</td>
      <td>
        <EstadoBadge estado={lote.estado} baches={lote.bachesAPedir} />
      </td>
      <td>
        <div className="flex gap-2">
          <button className="btn btn--ghost btn--sm" onClick={onEdit}>
            <Pencil />
          </button>
          <button className="btn btn--ghost btn--sm" onClick={onDelete}>
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}

function LoteMobileCard({
  lote,
  onEdit,
  onDelete,
}: {
  lote: LoteCalculado;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cardClass =
    lote.estado === 'danger'
      ? 'lote-card--danger'
      : lote.estado === 'warning'
      ? 'lote-card--warning'
      : '';

  return (
    <div className={`lote-card ${cardClass}`}>
      <div className="lote-card__header">
        <div>
          <div className="lote-card__name">{lote.nombre}</div>
          <div className="lote-card__meta">
            {lote.faseId ? (
              <>
                {lote.faseNombre} · {formatNumber(lote.consumoDiarioKg, 2)} kg/animal/día ·{' '}
                {formatNumber(lote.numAnimales)} animales
              </>
            ) : (
              <span className="text-warning">
                Sin fase · {formatNumber(lote.numAnimales)} animales
              </span>
            )}
          </div>
        </div>
        <EstadoBadge estado={lote.estado} baches={lote.bachesAPedir} />
      </div>
      <div className="lote-card__body">
        <div className="lote-card__field">
          <div className="lote-card__field-label">Edad</div>
          <div className="lote-card__field-value">{lote.edadSemanas} sem</div>
        </div>
        <div className="lote-card__field">
          <div className="lote-card__field-label">Consumo Semanal</div>
          <div className="lote-card__field-value">{formatKg(lote.consumoSemanalKg)}</div>
        </div>
        <div className="lote-card__field">
          <div className="lote-card__field-label">Inventario</div>
          <div className="lote-card__field-value">{formatKg(lote.inventarioKg)}</div>
        </div>
        <div className="lote-card__field">
          <div className="lote-card__field-label">Faltante</div>
          <div
            className={`lote-card__field-value ${
              lote.deficitKg > 0 ? 'text-danger' : 'text-success'
            }`}
          >
            {lote.deficitKg > 0 ? formatKg(lote.deficitKg) : 'OK'}
          </div>
        </div>
      </div>
      <div className="lote-card__actions">
        <button className="btn btn--ghost btn--sm" onClick={onEdit}>
          <Pencil /> Editar
        </button>
        <button className="btn btn--ghost btn--sm" onClick={onDelete}>
          <Trash2 /> Eliminar
        </button>
      </div>
    </div>
  );
}

function EstadoBadge({ estado, baches = 0 }: { estado: 'ok' | 'warning' | 'danger'; baches?: number }) {
  const clases: Record<'ok' | 'warning' | 'danger', string> = {
    ok: 'badge--success',
    warning: 'badge--warning',
    danger: 'badge--danger',
  };
  if (estado === 'ok')
    return <span className={`badge ${clases[estado]}`}>{estadoDescripcion('ok')}</span>;
  if (estado === 'danger')
    return (
      <span className={`badge ${clases[estado]}`}>
        <AlertTriangle /> {estadoDescripcion('danger', baches)}
      </span>
    );
  return <span className={`badge ${clases[estado]}`}>{estadoDescripcion('warning', baches)}</span>;
}
