"use client";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleIncrease = () => {
    if (max) {
      onChange(Math.min(max, value + 1));
    } else {
      onChange(value + 1);
    }
  };

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink">
      <button
        type="button"
        onClick={handleDecrease}
        aria-label="Decrease quantity"
        className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        -
      </button>
      <span className="min-w-[24px] text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={handleIncrease}
        aria-label="Increase quantity"
        className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;


