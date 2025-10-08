import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format score with color coding
export function formatScore(score: number): {
  value: string;
  className: string;
  label: string;
} {
  if (score >= 90) {
    return {
      value: score.toString(),
      className: 'score-excellent',
      label: 'Excellent',
    };
  } else if (score >= 80) {
    return {
      value: score.toString(),
      className: 'score-good',
      label: 'Good',
    };
  } else if (score >= 70) {
    return {
      value: score.toString(),
      className: 'score-average',
      label: 'Average',
    };
  } else {
    return {
      value: score.toString(),
      className: 'score-poor',
      label: 'Needs Improvement',
    };
  }
}

// Format priority with color coding
export function formatPriority(priority: string): {
  label: string;
  className: string;
} {
  switch (priority.toLowerCase()) {
    case 'critical':
      return {
        label: 'Critical',
        className: 'badge-destructive',
      };
    case 'high':
      return {
        label: 'High',
        className: 'badge-warning',
      };
    case 'medium':
      return {
        label: 'Medium',
        className: 'badge-primary',
      };
    case 'low':
      return {
        label: 'Low',
        className: 'badge-secondary',
      };
    default:
      return {
        label: priority,
        className: 'badge-secondary',
      };
  }
}

// Format severity with color coding
export function formatSeverity(severity: string): {
  label: string;
  className: string;
} {
  switch (severity.toLowerCase()) {
    case 'critical':
      return {
        label: 'Critical',
        className: 'badge-destructive',
      };
    case 'high':
      return {
        label: 'High',
        className: 'badge-warning',
      };
    case 'medium':
      return {
        label: 'Medium',
        className: 'badge-primary',
      };
    case 'low':
      return {
        label: 'Low',
        className: 'badge-secondary',
      };
    default:
      return {
        label: severity,
        className: 'badge-secondary',
      };
  }
}

// Format date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Convert to title case
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// Convert snake_case to Title Case
export function snakeToTitleCase(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

// Convert kebab-case to Title Case
export function kebabToTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join(' ');
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry function
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
