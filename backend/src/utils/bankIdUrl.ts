import { BANK_ID_URL } from '@/config';

export const bankIdURL = (...parts: string[]): string => {
  const urlParts = [BANK_ID_URL, ...parts];
  return urlParts.map(pathPart => pathPart.replace(/(^\/|\/$)/g, '')).join('/');
};
