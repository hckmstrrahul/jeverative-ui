/** Explicit semantics only: never reinterpret arbitrary model-authored copy. */
export function financialValue(
  amount: number | undefined,
  currency = 'INR',
  format = 'amount',
  unavailable = false,
) {
  if (unavailable || amount === undefined)
    return { text: '—', tone: 'secondary', unavailable: true };
  const text = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  const rounded = text === '0.00' ? 0 : amount;
  const semantic = format === 'return' || format === 'percent';
  return {
    text:
      (rounded < 0 ? '−' : semantic && rounded > 0 ? '+' : '') +
      (format === 'percent'
        ? ''
        : currency === 'INR'
          ? '₹'
          : currency === 'USD'
            ? '$'
            : '') +
      text +
      (format === 'percent' ? '%' : ''),
    tone: semantic
      ? rounded > 0
        ? 'positive'
        : rounded < 0
          ? 'negative'
          : 'secondary'
      : 'primary',
    unavailable: false,
  };
}
