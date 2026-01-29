export const CURRENCIES: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  MXN: 'MX$',
};

export const CURRENCY_OPTIONS = Object.keys(CURRENCIES);

export function formatAmount(amount: number, currencyCode: string): string {
  const symbol = CURRENCIES[currencyCode] ?? currencyCode + ' ';
  const value = typeof amount === 'number' && !isNaN(amount) ? amount.toFixed(2) : '0.00';
  return `${symbol}${value}`;
}
