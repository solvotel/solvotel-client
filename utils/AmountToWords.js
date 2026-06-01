// utils/AmountToWords.js

const ones = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const tens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

const twoDigitWords = (value) => {
  if (value < 20) return ones[value];
  const ten = Math.floor(value / 10);
  const one = value % 10;
  return one ? `${tens[ten]}-${ones[one]}` : tens[ten];
};

const numberToIndianWords = (value) => {
  if (value === 0) return 'zero';

  const crore = Math.floor(value / 10000000);
  value %= 10000000;
  const lakh = Math.floor(value / 100000);
  value %= 100000;
  const thousand = Math.floor(value / 1000);
  value %= 1000;
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;

  const parts = [];

  if (crore) parts.push(`${twoDigitWords(crore)} crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} thousand`);
  if (hundred) parts.push(`${ones[hundred]} hundred`);
  if (remainder) parts.push(twoDigitWords(remainder));

  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

export function amountToWords(num) {
  if (num === undefined || num === null || num === '') return 'INR Zero Only';
  const numericValue = Number(num);
  if (Number.isNaN(numericValue)) return 'INR Zero Only';

  const absoluteValue = Math.floor(Math.abs(numericValue));
  const words = numberToIndianWords(absoluteValue);
  const formatted = words.charAt(0).toUpperCase() + words.slice(1);

  return `INR ${formatted} Only`;
}
