/**
 * Cost Monitoring and Rate Limiting for AI API Usage
 * Protects against unexpected costs and abuse
 */

interface CostLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perRequestLimit: number;
}

interface UsageStats {
  dailyUsage: number;
  monthlyUsage: number;
  lastReset: string;
}

export class CostMonitor {
  private static readonly COST_LIMITS: CostLimits = {
    dailyLimit: 10, // $10 per day
    monthlyLimit: 100, // $100 per month
    perRequestLimit: 0.50, // $0.50 per request
  };

  private static readonly COST_ESTIMATES = {
    openai: {
      'gpt-4o': 0.03, // per 1K tokens
      'gpt-4-turbo-preview': 0.03,
    },
    gemini: {
      'gemini-1.5-flash': 0.001, // per 1K tokens (free tier)
    },
    claude: {
      'claude-3-haiku-20240307': 0.25, // per 1M tokens
    },
  };

  static estimateCost(provider: string, model: string, contentLength: number): number {
    const providerCosts = this.COST_ESTIMATES[provider as keyof typeof this.COST_ESTIMATES];
    if (!providerCosts) return 0;

    const costPerToken = providerCosts[model as keyof typeof providerCosts] || 0;
    const estimatedTokens = Math.ceil(contentLength / 4); // Rough estimate: 4 chars per token
    return (costPerToken * estimatedTokens) / 1000;
  }

  static checkCostLimits(provider: string, model: string, contentLength: number): {
    allowed: boolean;
    estimatedCost: number;
    reason?: string;
  } {
    const estimatedCost = this.estimateCost(provider, model, contentLength);
    
    // Check per-request limit
    if (estimatedCost > this.COST_LIMITS.perRequestLimit) {
      return {
        allowed: false,
        estimatedCost,
        reason: `Estimated cost $${estimatedCost.toFixed(4)} exceeds per-request limit of $${this.COST_LIMITS.perRequestLimit}`,
      };
    }

    // Check daily limit (simplified - in production, use Redis/database)
    const dailyUsage = this.getDailyUsage();
    if (dailyUsage + estimatedCost > this.COST_LIMITS.dailyLimit) {
      return {
        allowed: false,
        estimatedCost,
        reason: `Daily limit would be exceeded. Current: $${dailyUsage.toFixed(2)}, Request: $${estimatedCost.toFixed(4)}`,
      };
    }

    return {
      allowed: true,
      estimatedCost,
    };
  }

  static recordUsage(provider: string, model: string, contentLength: number): void {
    const cost = this.estimateCost(provider, model, contentLength);
    // In production, store this in Redis/database
    console.log(`[COST MONITOR] ${provider}/${model}: $${cost.toFixed(4)}`);
  }

  private static getDailyUsage(): number {
    // In production, retrieve from Redis/database
    // For now, return 0 (reset daily)
    return 0;
  }

  static getUsageStats(): UsageStats {
    return {
      dailyUsage: this.getDailyUsage(),
      monthlyUsage: 0, // Implement monthly tracking
      lastReset: new Date().toISOString(),
    };
  }

  static getCostLimits(): CostLimits {
    return { ...this.COST_LIMITS };
  }
}
