// Platshållarrader medan en tabell eller lista laddas
function TableSkeleton({ rows = 3, label }: { rows?: number; label: string }) {
  return (
    <div className="table-skeleton" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="table-skeleton__row" aria-hidden="true" key={index}>
          <div className="skeleton skeleton--line" style={{ width: "40%" }} />
          <div className="skeleton skeleton--line" style={{ width: "15%" }} />
          <div className="skeleton skeleton--line" style={{ width: "20%" }} />
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
