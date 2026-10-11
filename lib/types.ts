// Core type definitions

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FractalPoint {
  index: number;
  price: number;
  type: 'high' | 'low';
  strength: number; // 0-1
  timestamp: number;
}

export interface FractalPattern {
  type: 'reversal' | 'continuation' | 'neutral';
  direction: 'up' | 'down';
  strength: number; // 0-1
  supportLevel: number;
  resistanceLevel: number;
  confidence: number; // 0-1
}

export interface Prediction {
  price: number;
  direction: 'up' | 'down' | 'neutral';
  confidence: number; // 0-1
  timestamp: number;
  models: PredictionModel[];
}

export interface PredictionModel {
  name: string;
  prediction: number;
  confidence: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  signal: number;
  momentum: number;
  volatility: number;
  sma20: number;
  ema12: number;
  ema26: number;
}

export interface CryptoTicker {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
}

export interface ChartData {
  symbol: string;
  interval: string;
  candles: Candle[];
  fractals: FractalPoint[];
  patterns: FractalPattern[];
  levels: {
    support: number[];
    resistance: number[];
  };
  indicators: TechnicalIndicators;
  prediction: Prediction;
  hurstExponent: number;
  timestamp: number;
}
