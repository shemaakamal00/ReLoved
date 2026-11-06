interface StatCardsProps {
  variant: "admin" | "seller";
  stats: { label: string; value: number | null | undefined }[];
}

function StatCards({ variant, stats }: StatCardsProps) {
  return (
    <div className={`${variant}-stats`}>
      {stats.map((stat) => (
        <article className={`${variant}-stat-card`} key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value ?? "–"}</strong>
        </article>
      ))}
    </div>
  );
}

export default StatCards;
