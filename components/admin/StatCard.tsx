"use client";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

const StatCard = ({ label, value, helper }: StatCardProps) => {
  return (
    <div className="rounded-[18px] border border-border bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
    </div>
  );
};

export default StatCard;


