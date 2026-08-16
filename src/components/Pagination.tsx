import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <span className="pagination__info">
        {from}–{to} de {totalItems}
      </span>
      <div className="pagination__controls">
        <button
          className="btn btn--ghost btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="pagination__dots">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`btn btn--sm ${p === page ? 'pagination__active' : 'btn--ghost'}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="btn btn--ghost btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
