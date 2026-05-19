export const formatEur = (amountCents: number) => {
  const value = Number.isFinite(amountCents) ? amountCents / 100 : 0;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
};


