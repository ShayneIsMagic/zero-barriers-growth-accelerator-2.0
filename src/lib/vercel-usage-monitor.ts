/**
 * Vercel Usage Monitor
 * Tracks and warns about approaching Vercel limits
 */

// Vercel Hobby Plan Limits
const VERCEL_LIMITS = {
  bandwidth: {
    limit: 100 * 1024 * 1024 * 1024, // 100 GB in bytes
    warningThreshold: 0.8, // Warn at 80%
    criticalThreshold: 0.95, // Critical at 95%
  },
  serverlessFunctionHours: {
    limit: 1000, // 1000 hours per month
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
  },
  builds: {
    limit: 6000, // 6000 build minutes per month
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
  },
};

interface UsageData {
  bandwidth: {
    used: number;
    limit: number;
    percentage: number;
    remaining: string;
  };
  functions: {
    hours: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  builds: {
    minutes: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  warnings: string[];
}

/**
 * Get current usage from localStorage (client-side tracking)
 */
export function getUsageTracking(): UsageData {
  if (typeof window === 'undefined') {
    return getEmptyUsage();
  }

  try {
    const stored = localStorage.getItem('vercel_usage_tracking');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading usage tracking:', error);
  }

  return getEmptyUsage();
}

/**
 * Track an analysis execution
 */
export function trackAnalysis(estimatedDuration: number = 180) {
  if (typeof window === 'undefined') return;

  const usage = getUsageTracking();

  // Estimate function hours (duration in seconds / 3600)
  const hours = estimatedDuration / 3600;
  usage.functions.hours += hours;
  usage.functions.percentage = (usage.functions.hours / usage.functions.limit) * 100;
  usage.functions.remaining = usage.functions.limit - usage.functions.hours;

  // Estimate bandwidth (average analysis response ~500KB)
  const estimatedBandwidth = 500 * 1024; // 500 KB
  usage.bandwidth.used += estimatedBandwidth;
  usage.bandwidth.percentage = (usage.bandwidth.used / usage.bandwidth.limit) * 100;
  usage.bandwidth.remaining = formatBytes(usage.bandwidth.limit - usage.bandwidth.used);

  // Check for warnings
  usage.warnings = checkThresholds(usage);

  // Save updated usage
  localStorage.setItem('vercel_usage_tracking', JSON.stringify(usage));

  // Show warnings if any
  if (usage.warnings.length > 0) {
    showUsageWarnings(usage.warnings);
  }

  return usage;
}

/**
 * Track a build
 */
export function trackBuild(durationMinutes: number = 1) {
  if (typeof window === 'undefined') return;

  const usage = getUsageTracking();
  usage.builds.minutes += durationMinutes;
  usage.builds.percentage = (usage.builds.minutes / usage.builds.limit) * 100;
  usage.builds.remaining = usage.builds.limit - usage.builds.minutes;

  usage.warnings = checkThresholds(usage);
  localStorage.setItem('vercel_usage_tracking', JSON.stringify(usage));

  if (usage.warnings.length > 0) {
    showUsageWarnings(usage.warnings);
  }

  return usage;
}

/**
 * Reset usage tracking (call at start of new month)
 */
export function resetUsageTracking() {
  if (typeof window === 'undefined') return;

  localStorage.setItem('vercel_usage_tracking', JSON.stringify(getEmptyUsage()));
}

/**
 * Check if any thresholds are exceeded
 */
function checkThresholds(usage: UsageData): string[] {
  const warnings: string[] = [];

  // Check bandwidth
  const bandwidthPercent = usage.bandwidth.percentage / 100;
  if (bandwidthPercent >= VERCEL_LIMITS.bandwidth.criticalThreshold) {
    warnings.push(`🚨 CRITICAL: Bandwidth at ${usage.bandwidth.percentage.toFixed(1)}% (${usage.bandwidth.remaining} remaining)`);
  } else if (bandwidthPercent >= VERCEL_LIMITS.bandwidth.warningThreshold) {
    warnings.push(`⚠️ WARNING: Bandwidth at ${usage.bandwidth.percentage.toFixed(1)}% (${usage.bandwidth.remaining} remaining)`);
  }

  // Check function hours
  const functionPercent = usage.functions.percentage / 100;
  if (functionPercent >= VERCEL_LIMITS.serverlessFunctionHours.criticalThreshold) {
    warnings.push(`🚨 CRITICAL: Serverless hours at ${usage.functions.percentage.toFixed(1)}% (${usage.functions.remaining.toFixed(0)} hours remaining)`);
  } else if (functionPercent >= VERCEL_LIMITS.serverlessFunctionHours.warningThreshold) {
    warnings.push(`⚠️ WARNING: Serverless hours at ${usage.functions.percentage.toFixed(1)}% (${usage.functions.remaining.toFixed(0)} hours remaining)`);
  }

  // Check builds
  const buildPercent = usage.builds.percentage / 100;
  if (buildPercent >= VERCEL_LIMITS.builds.criticalThreshold) {
    warnings.push(`🚨 CRITICAL: Build minutes at ${usage.builds.percentage.toFixed(1)}% (${usage.builds.remaining} minutes remaining)`);
  } else if (buildPercent >= VERCEL_LIMITS.builds.warningThreshold) {
    warnings.push(`⚠️ WARNING: Build minutes at ${usage.builds.percentage.toFixed(1)}% (${usage.builds.remaining} minutes remaining)`);
  }

  return warnings;
}

/**
 * Show usage warnings to user
 */
function showUsageWarnings(warnings: string[]) {
  warnings.forEach(warning => {
    if (warning.includes('CRITICAL')) {
      console.error(warning);
      // Could also show toast notification
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast({
          title: 'Vercel Limit Alert',
          description: warning,
          variant: 'destructive',
        });
      }
    } else {
      console.warn(warning);
    }
  });
}

/**
 * Get empty usage data
 */
function getEmptyUsage(): UsageData {
  return {
    bandwidth: {
      used: 0,
      limit: VERCEL_LIMITS.bandwidth.limit,
      percentage: 0,
      remaining: formatBytes(VERCEL_LIMITS.bandwidth.limit),
    },
    functions: {
      hours: 0,
      limit: VERCEL_LIMITS.serverlessFunctionHours.limit,
      percentage: 0,
      remaining: VERCEL_LIMITS.serverlessFunctionHours.limit,
    },
    builds: {
      minutes: 0,
      limit: VERCEL_LIMITS.builds.limit,
      percentage: 0,
      remaining: VERCEL_LIMITS.builds.limit,
    },
    warnings: [],
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get usage dashboard component data
 */
export function getUsageDashboardData() {
  const usage = getUsageTracking();

  return {
    bandwidth: {
      used: formatBytes(usage.bandwidth.used),
      total: formatBytes(usage.bandwidth.limit),
      percentage: usage.bandwidth.percentage,
      status: getStatusLevel(usage.bandwidth.percentage),
    },
    functions: {
      used: usage.functions.hours.toFixed(1),
      total: usage.functions.limit,
      percentage: usage.functions.percentage,
      status: getStatusLevel(usage.functions.percentage),
    },
    builds: {
      used: usage.builds.minutes,
      total: usage.builds.limit,
      percentage: usage.builds.percentage,
      status: getStatusLevel(usage.builds.percentage),
    },
    warnings: usage.warnings,
    hasWarnings: usage.warnings.length > 0,
  };
}

function getStatusLevel(percentage: number): 'safe' | 'warning' | 'critical' {
  if (percentage >= 95) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'safe';
}

/**
 * Initialize usage tracking (call on app start)
 */
export function initializeUsageTracking() {
  if (typeof window === 'undefined') return;

  // Check if tracking exists
  const existing = localStorage.getItem('vercel_usage_tracking');
  if (!existing) {
    resetUsageTracking();
  }

  // Check if new month (reset tracking)
  const lastReset = localStorage.getItem('usage_last_reset');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

  if (lastReset !== currentMonth) {
    resetUsageTracking();
    localStorage.setItem('usage_last_reset', currentMonth);
  }
}

