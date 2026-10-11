// Advanced Price Prediction Engine
// Combines multiple models for robust forecasting

import { Candle, Prediction, PredictionModel, TechnicalIndicators } from './types';

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      sma.push(0);
    } else {
      const sum = candles
        .slice(i - period + 1, i + 1)
        .reduce((acc, candle) => acc + candle.close, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

/**
 * Exponential Moving Average (EMA)
 * Gives more weight to recent prices
 */
export function calculateEMA(candles: Candle[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA = SMA
  let sum = 0;
  for (let i = 0; i < period && i < candles.length; i++) {
    sum += candles[i].close;
  }
  ema[0] = sum / Math.min(period, candles.length);
  
  // Calculate EMA
  for (let i = 1; i < candles.length; i++) {
    const currentEMA = (candles[i].close - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(currentEMA);
  }
  
  return ema;
}

/**
 * RSI (Relative Strength Index)
 * Measures momentum: >70 = overbought, <30 = oversold
 */
export function calculateRSI(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 50;
  
  const changes: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Calculate initial average gain and loss
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate smoothed RSI for recent data
  for (let i = period; i < changes.length; i++) {
    if (changes[i] > 0) avgGain = (avgGain * (period - 1) + changes[i]) / period;
    else avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
  }
  
  if (avgLoss === 0) return avgGain > 0 ? 100 : 50;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  
  return rsi;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Shows momentum and trend direction
 */
export function calculateMACD(
  candles: Candle[]
): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);
  
  const macd = ema12[ema12.length - 1] - ema26[ema26.length - 1];
  
  // Signal line = 9-period EMA of MACD
  const macdArray = [];
  for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
    macdArray.push(ema12[i] - ema26[i]);
  }
  
  // Create candle array for EMA calculation
  const macdCandles: Candle[] = macdArray.map((val, i) => ({
    time: candles[i]?.time || 0,
    open: val,
    high: val,
    low: val,
    close: val,
    volume: 1,
  }));
  
  const signalEMA = calculateEMA(macdCandles, 9);
  const signal = signalEMA[signalEMA.length - 1];
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

/**
 * Calculate Momentum
 * Rate of price change over period
 */
export function calculateMomentum(candles: Candle[], period: number = 10): number {
  if (candles.length < period + 1) return 0;
  
  const current = candles[candles.length - 1].close;
  const previous = candles[candles.length - period - 1].close;
  
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate Volatility (Standard Deviation)
 * Measures price fluctuations
 */
export function calculateVolatility(candles: Candle[], period: number = 20): number {
  if (candles.length < period) return 0;
  
  const recent = candles.slice(-period);
  const mean = recent.reduce((sum, c) => sum + c.close, 0) / period;
  const variance = recent.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
  
  return Math.sqrt(variance);
}

/**
 * LSTM-inspired prediction
 * Uses weighted recent prices to predict next price
 */
function predictLSTM(candles: Candle[], lookback: number = 20): number {
  if (candles.length < lookback) return candles[candles.length - 1].close;
  
  const recent = candles.slice(-lookback);
  
  // Exponential weights (more recent = higher weight)
  const weights = recent.map((_, i) => {
    const alpha = 2 / (lookback + 1);
    return Math.pow(1 - alpha, lookback - i - 1) * alpha;
  });
  
  const weightedPrice = recent.reduce(
    (sum, candle, i) => sum + candle.close * weights[i],
    0
  );
  
  // Factor in momentum
  const momentum = (recent[recent.length - 1].close - recent[0].close) / recent[0].close;
  
  return weightedPrice * (1 + momentum * 0.2);
}

/**
 * Linear regression prediction
 * Fits line to recent prices
 */
function predictLinearRegression(candles: Candle[]): number {
  if (candles.length < 5) return candles[candles.length - 1].close;
  
  const recent = candles.slice(-20);
  const n = recent.length;
  
  // Calculate sums for linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recent[i].close;
    sumXY += i * recent[i].close;
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict next value
  return intercept + slope * n;
}

/**
 * RSI mean reversion prediction
 * Predicts pullback when RSI is extreme
 */
function predictRSIMeanReversion(candles: Candle[]): number {
  const current = candles[candles.length - 1].close;
  const rsi = calculateRSI(candles, 14);
  
  if (rsi > 70) {
    // Overbought - predict pullback
    return current * 0.98;
  } else if (rsi < 30) {
    // Oversold - predict bounce
    return current * 1.02;
  }
  
  return current;
}

/**
 * Momentum-based prediction
 * Extrapolates momentum
 */
function predictMomentum(candles: Candle[]): number {
  const current = candles[candles.length - 1].close;
  const momentum = calculateMomentum(candles, 10);
  
  // Use 50% of momentum for next period
  return current * (1 + (momentum / 100) * 0.5);
}

/**
 * Generate all technical indicators
 */
export function calculateIndicators(candles: Candle[]): TechnicalIndicators {
  const sma20 = calculateSMA(candles, 20);
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);
  const macdData = calculateMACD(candles);
  const rsi = calculateRSI(candles, 14);
  const momentum = calculateMomentum(candles, 10);
  const volatility = calculateVolatility(candles, 20);
  
  return {
    rsi,
    macd: macdData.macd,
    signal: macdData.signal,
    momentum,
    volatility,
    sma20: sma20[sma20.length - 1] || 0,
    ema12: ema12[ema12.length - 1] || 0,
    ema26: ema26[ema26.length - 1] || 0,
  };
}

/**
 * Generate consolidated price prediction
 * Combines multiple models with weighted ensemble
 */
export function predictPrice(candles: Candle[]): Prediction {
  const timestamp = Date.now();
  const currentPrice = candles[candles.length - 1].close;
  
  if (candles.length < 5) {
    return {
      price: currentPrice,
      direction: 'neutral',
      confidence: 0,
      timestamp,
      models: [],
    };
  }
  
  // Generate predictions from each model
  const models: PredictionModel[] = [];
  
  // Model 1: LSTM
  const lstmPrediction = predictLSTM(candles, 20);
  models.push({
    name: 'LSTM',
    prediction: lstmPrediction,
    confidence: 0.8,
  });
  
  // Model 2: Linear Regression
  const linearPrediction = predictLinearRegression(candles);
  models.push({
    name: 'Linear Regression',
    prediction: linearPrediction,
    confidence: 0.75,
  });
  
  // Model 3: RSI Mean Reversion
  const rsiPrediction = predictRSIMeanReversion(candles);
  models.push({
    name: 'RSI Mean Reversion',
    prediction: rsiPrediction,
    confidence: 0.7,
  });
  
  // Model 4: Momentum Extrapolation
  const momentumPrediction = predictMomentum(candles);
  models.push({
    name: 'Momentum',
    prediction: momentumPrediction,
    confidence: 0.75,
  });
  
  // Weighted ensemble
  let totalWeight = 0;
  let weightedPrediction = 0;
  let totalConfidence = 0;
  
  for (const model of models) {
    weightedPrediction += model.prediction * model.confidence;
    totalConfidence += model.confidence;
    totalWeight++;
  }
  
  const ensemblePrediction = weightedPrediction / totalConfidence;
  const priceChange = (ensemblePrediction - currentPrice) / currentPrice;
  
  // Determine direction and confidence
  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  let confidence = 0;
  
  if (Math.abs(priceChange) < 0.002) {
    direction = 'neutral';
    confidence = 0.3;
  } else if (priceChange > 0.002) {
    direction = 'up';
    confidence = Math.min(0.95, Math.abs(priceChange) * 10);
  } else {
    direction = 'down';
    confidence = Math.min(0.95, Math.abs(priceChange) * 10);
  }
  
  // Factor in model agreement
  const upVotes = models.filter(m => m.prediction > currentPrice).length;
  const modelConsensus = Math.abs(upVotes - models.length / 2) / (models.length / 2);
  confidence = confidence * (0.5 + modelConsensus * 0.5);
  
  return {
    price: ensemblePrediction,
    direction,
    confidence: Math.min(1, Math.max(0, confidence)),
    timestamp,
    models,
  };
}
