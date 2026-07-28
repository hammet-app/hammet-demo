type SuccessMetricsProps = {
    total: number;
    codes: number;
};

export function SuccessMetrics({
    total,
    codes,
}: SuccessMetricsProps) {

  return (

    <div className="grid gap-4 p-8 md:grid-cols-3">
      <MetricCard
        title="Students Imported"
        value={total}
        color="text-success"
      />

      <MetricCard
        title="Credentials Generated"
        value={codes}
        color="text-purple-mid"
      />

      <MetricCard
        title="Expires"
        value="48 Hours"
        color="text-amber"
      />
    </div>

  );

}

type MetricCardProps = {
    title: string;
    value: string | number;
    color: string;
};

function MetricCard({
  title,
  value,
}: MetricCardProps) {

  return (

    <div className="rounded-2xl border border-border bg-bg-page p-5">

      <p className="text-xs uppercase tracking-wide text-text-muted">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-text-primary"
        style={{ fontFamily: "var(--font-head)", }}
      >
        {value}
      </p>

    </div>

  );

}