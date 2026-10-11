// Advanced Fractal Analysis Engine
// Detects self-similar patterns and market structure

import { Candle, FractalPoint, FractalPattern } from './types';

/**
 * Detect basic fractals (5-bar pattern)
 * High fractal: central bar higher than 2 bars on each side
 * Low fractal: central bar lower than 2 bars on each side
 */
export function detectBasicFractals(candles: Candle[]): FractalPoint[] {
  const fractals: FractalPoint[] = [];
  
  if (candles.length < 5) return fractals;
  
  for (let i = 2; i < candles.length - 2; i++) {
    const prev2 = candles[i - 2];
    const prev1 = candles[i - 1];
    const current = candles[i];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    // High fractal (resistance level)
    if (
      current.high > prev2.high &&
      current.high > prev1.high &&
      current.high > next1.high &&
      current.high > next2.high
    ) {
      fractals.push({
        index: i,
        price: current.high,
        type: 'high',
        strength: calculateFractalStrength(candles, i, 'high'),
        timestamp: current.time,
      });
    }
    
    // Low fractal (support level)
    if (
      current.low < prev2.low &&
      current.low < prev1.low &&
      current.low < next1.low &&
      current.low < next2.low
    ) {
      fractals.push({
        index: i,
        price: current.low,
        type: 'low',
        strength: calculateFractalStrength(candles, i, 'low'),
        timestamp: current.time,
      });
    }
  }
  
  return fractals;
}

/**
 * Calculate fractal strength (0-1)
 * Based on how dominant the fractal is within its local context
 */
function calculateFractalStrength(candles: Candle[], index: number, type: 'high' | 'low'): number {
  const windowSize = 20;
  const startIdx = Math.max(0, index - windowSize);
  const endIdx = Math.min(candles.length, index + windowSize + 1);
  const window = candles.slice(startIdx, endIdx);
  
  const maxHigh = Math.max(...window.map(c => c.high));
  const minLow = Math.min(...window.map(c => c.low));
  const range = maxHigh - minLow;
  
  if (range === 0) return 0.5;
  
  if (type === 'high') {
    const dominance = (candles[index].high - minLow) / range;
    return Math.min(1, Math.max(0, dominance));
  } else {
    const dominance = (maxHigh - candles[index].low) / range;
    return Math.min(1, Math.max(0, dominance));
  }
}

/**
 * Detect multi-timeframe patterns
 * Identifies support/resistance zones and trend reversals
 */
export function detectPatterns(candles: Candle[], fractals: FractalPoint[]): FractalPattern[] {
  const patterns: FractalPattern[] = [];
  
  if (fractals.length < 2) {
    return [{
      type: 'neutral',
      direction: 'up',
      strength: 0.5,
      supportLevel: Math.min(...candles.map(c => c.low)),
      resistanceLevel: Math.max(...candles.map(c => c.high)),
      confidence: 0.3,
    }];
  }
  
  // Analyze fractal sequences for patterns
  for (let i = 0; i < fractals.length - 1; i++) {
    const current = fractals[i];
    const next = fractals[i + 1];
    
    // Reversal: high fractal followed by low fractal
    if (current.type === 'high' && next.type === 'low') {
      const resistance = current.price;
      const support = next.price;
      const range = resistance - support;
      const rangePercent = (range / resistance) * 100;
      
      patterns.push({
        type: 'reversal',
        direction: 'down',
        strength: (current.strength + next.strength) / 2,
        supportLevel: support,
        resistanceLevel: resistance,
        confidence: Math.min(1, rangePercent / 10), // Higher range = higher confidence
      });
    }
    
    // Continuation: low fractal followed by high fractal
    if (current.type === 'low' && next.type === 'high') {
      const support = current.price;
      const resistance = next.price;
      const range = resistance - support;
      const rangePercent = (range / support) * 100;
      
      patterns.push({
        type: 'continuation',
        direction: 'up',
        strength: (current.strength + next.strength) / 2,
        supportLevel: support,
        resistanceLevel: resistance,
        confidence: Math.min(1, rangePercent / 10),
      });
    }
  }
  
  // If no clear patterns, return neutral assessment
  if (patterns.length === 0) {
    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    const direction = lastCandle.close >= prevCandle.close ? 'up' : 'down';
    
    patterns.push({
      type: 'neutral',
      direction,
      strength: 0.5,
      supportLevel: Math.min(...candles.slice(-20).map(c => c.low)),
      resistanceLevel: Math.max(...candles.slice(-20).map(c => c.high)),
      confidence: 0.4,
    });
  }
  
  return patterns;
}

/**
 * Calculate Hurst Exponent
 * Measures market efficiency and predictability
 * ~0.5: Random walk (Efficient Market)
 * <0.5: Mean-reverting (Predictable, bouncy)
 * >0.5: Trending (Momentum-driven)
 */
export function calculateHurstExponent(candles: Candle[], maxLag: number = 30): number {
  if (candles.length < maxLag + 10) return 0.5;
  
  const closes = candles.map(c => c.close);
  const lags: number[] = [];
  const rescaledRanges: number[] = [];
  
  // Calculate for different lag periods
  for (let lag = 10; lag <= maxLag; lag += 5) {
    let totalRescaledRange = 0;
    let count = 0;
    
    // Calculate for each window
    for (let start = 0; start <= closes.length - lag; start += lag) {
      const window = closes.slice(start, start + lag);
      if (window.length < lag) break;
      
      // Calculate mean
      const mean = window.reduce((a, b) => a + b) / window.length;
      
      // Calculate demeaned series
      const demeaned = window.map(p => p - mean);
      
      // Calculate cumulative sum
      const cumulative: number[] = [];
      let sum = 0;
      for (const val of demeaned) {
        sum += val;
        cumulative.push(sum);
      }
      
      // Calculate range
      const maxCum = Math.max(...cumulative);
      const minCum = Math.min(...cumulative);
      const range = maxCum - minCum;
      
      // Calculate standard deviation
      const variance = demeaned.reduce((sum, val) => sum + val * val, 0) / window.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate rescaled range
      if (stdDev > 0) {
        totalRescaledRange += range / stdDev;
        count++;
      }
    }
    
    if (count > 0) {
      lags.push(Math.log(lag));
      rescaledRanges.push(Math.log(totalRescaledRange / count));
    }
  }
  
  if (lags.length < 2) return 0.5;
  
  // Linear regression to find Hurst exponent (slope)
  const n = lags.length;
  const sumX = lags.reduce((a, b) => a + b, 0);
  const sumY = rescaledRanges.reduce((a, b) => a + b, 0);
  const sumXY = lags.reduce((sum, x, i) => sum + x * rescaledRanges[i], 0);
  const sumX2 = lags.reduce((sum, x) => sum + x * x, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;
  
  if (denominator === 0) return 0.5;
  
  const hurst = numerator / denominator;
  return Math.min(1, Math.max(0, hurst));
}

/**
 * Identify support and resistance levels by clustering fractals
 */
export function identifyLevels(
  fractals: FractalPoint[],
  tolerance: number = 0.02 // 2% tolerance
): { support: number[]; resistance: number[] } {
  const levels = { support: [] as number[], resistance: [] as number[] };
  
  // Separate into highs and lows
  const highFractals = fractals
    .filter(f => f.type === 'high')
    .map(f => f.price)
    .sort((a, b) => a - b);
  
  const lowFractals = fractals
    .filter(f => f.type === 'low')
    .map(f => f.price)
    .sort((a, b) => a - b);
  
  // Cluster similar prices
  const clusterPrices = (prices: number[]): number[] => {
    if (prices.length === 0) return [];
    
    const clusters: number[] = [];
    let currentCluster: number[] = [prices[0]];
    
    for (let i = 1; i < prices.length; i++) {
      const change = Math.abs(prices[i] - prices[i - 1]) / prices[i - 1];
      
      if (change < tolerance) {
        currentCluster.push(prices[i]);
      } else {
        const avgPrice = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
        clusters.push(avgPrice);
        currentCluster = [prices[i]];
      }
    }
    
    const avgPrice = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
    clusters.push(avgPrice);
    
    return clusters;
  };
  
  levels.support = clusterPrices(lowFractals);
  levels.resistance = clusterPrices(highFractals);
  
  return levels;
}

/**
 * Score fractal quality based on market context
 * Higher score = stronger fractal
 */
export function scoreFractal(candles: Candle[], index: number, type: 'high' | 'low'): number {
  let score = 0.5; // Base score
  
  if (index < 1 || index >= candles.length - 1) return score;
  
  const current = candles[index];
  const prev = candles[index - 1];
  const next = candles[index + 1];
  
  // Volume confirmation
  const avgVolume = (prev.volume + current.volume + next.volume) / 3;
  if (current.volume > avgVolume * 1.2) score += 0.15; // High volume confirmation
  
  // Wick/shadow size (stronger if wicks are small)
  const currentRange = current.high - current.low;
  const bodySize = Math.abs(current.close - current.open);
  if (bodySize / currentRange > 0.6) score += 0.1; // Strong candle body
  
  // Previous candle relationship
  if (type === 'high' && prev.close < current.open) score += 0.1; // Gap up before high
  if (type === 'low' && prev.close > current.open) score += 0.1; // Gap down before low
  
  return Math.min(1, score);
}
