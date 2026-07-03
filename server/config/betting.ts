import { ConfigurationError } from "../core/errors";

export interface BettingConfig {
  maxKellyStakePercent: number;
  defaultCommissionRate: number;
}

const maxKellyStakePercentStr = process.env.MAX_KELLY_STAKE_PERCENT || "0.05";
const maxKellyStakePercent = parseFloat(maxKellyStakePercentStr);
if (isNaN(maxKellyStakePercent) || maxKellyStakePercent < 0 || maxKellyStakePercent > 1) {
  throw new ConfigurationError(`Invalid MAX_KELLY_STAKE_PERCENT: ${maxKellyStakePercentStr}. Must be between 0.0 and 1.0 (e.g. 0.05 for 5%)`);
}

const defaultCommissionRateStr = process.env.DEFAULT_COMMISSION_RATE || "0.0";
const defaultCommissionRate = parseFloat(defaultCommissionRateStr);
if (isNaN(defaultCommissionRate) || defaultCommissionRate < 0 || defaultCommissionRate > 0.5) {
  throw new ConfigurationError(`Invalid DEFAULT_COMMISSION_RATE: ${defaultCommissionRateStr}`);
}

export const bettingConfig: BettingConfig = {
  maxKellyStakePercent,
  defaultCommissionRate,
};
