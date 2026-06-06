export type ValidationResult = {
  valid: boolean;
  warning?: string;
  blocking?: boolean;
};

export function validateLMPDate(date: Date): ValidationResult {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, blocking: true };
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  if (date.getFullYear() < currentYear - 2) {
    return {
      valid: false,
      blocking: true,
      warning: 'This date feels a little too far in the past. Please check it once more.',
    };
  }

  if (date > now) {
    return {
      valid: false,
      blocking: true,
      warning: 'This date appears to be in the future.',
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysAgo = Math.floor((now.getTime() - date.getTime()) / msPerDay);

  if (daysAgo > 315) {
    return {
      valid: true,
      blocking: false,
      warning: 'This date feels a little outside a typical pregnancy timeline. Please check it once more.',
    };
  }

  if (daysAgo < 14) {
    return {
      valid: true,
      blocking: false,
      warning: 'You may still be very early in your journey.',
    };
  }

  return { valid: true };
}

export function parseLMPFields(day: string, month: string, year: string): Date | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (d < 1 || d > 31) return null;
  if (m < 1 || m > 12) return null;
  if (y < 1900 || year.length !== 4) return null;

  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return date;
}
