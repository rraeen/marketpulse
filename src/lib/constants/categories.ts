export const CATEGORIES = [
  'Micro-economics',
  'Stocks',
  'Commodities',
  'Investment Market Updates',
  'Investment Guidance'
] as const;

export type Category = (typeof CATEGORIES)[number];
