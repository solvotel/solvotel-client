// utils/AmountToWords.js
import { toWords } from 'number-to-words';

export function amountToWords(num) {
  if (!num) return 'Zero';
  const words = toWords(num);
  return `INR ${words.charAt(0).toUpperCase() + words.slice(1)} Only`;
}
