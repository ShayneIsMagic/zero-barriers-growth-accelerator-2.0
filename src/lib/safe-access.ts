/**
 * Safe data access utilities to prevent undefined/null errors
 */

/**
 * Safely access nested object properties
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue: T | null = null
): T | null {
  if (!obj || typeof obj !== 'object') return defaultValue;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * Safely access array elements
 */
export function safeArray<T = any>(arr: any, defaultValue: T[] = []): T[] {
  return Array.isArray(arr) ? arr : defaultValue;
}

/**
 * Safely map over an array with fallback
 */
export function safeMap<T, R>(
  arr: any,
  mapper: (item: T, index: number) => R,
  _defaultValue: R[] = []
): R[] {
  const safeArr = safeArray<T>(arr);
  return safeArr.map(mapper);
}

/**
 * Safely get a string value with fallback
 */
export function safeString(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Safely get a number value with fallback
 */
export function safeNumber(value: any, fallback: number = 0): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  return isNaN(num) ? fallback : num;
}

/**
 * Safely get a boolean value with fallback
 */
export function safeBoolean(value: any, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return fallback;
}

/**
 * Check if a value exists and is not null/undefined
 */
export function exists(value: any): boolean {
  return value !== null && value !== undefined;
}

/**
 * Safely execute a function with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  onError?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    onError?.(error as Error);
    return fallback;
  }
}

/**
 * Safe async execution with error handling
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    onError?.(error as Error);
    return fallback;
  }
}
