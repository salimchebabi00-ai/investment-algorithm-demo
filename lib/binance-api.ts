// Binance API Client
// Real cryptocurrency data fetching

import { Candle, CryptoTicker } from './types';

const BINANCE_API = 'https://api.binance.com/api/v3';

const TIMEFRAME_MAP: Record<string, string> = {
  '1s': '1s',
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M',
};

const TOP_CRYPTOS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'SOLUSDT',
  'DOGEUSDT',
  'POLKAUSDT',
  'LINKUSDT',
  'AVAXUSDT',
  'UNIUSDT',
  'LTCUSDT',
  'ATOMUSDT',
  'MATICUSDT',
  'VETUSDT',
];

/**
 * Fetch candlestick data from Binance
 */
export async function fetchKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
): Promise<Candle[]> {
  try {
    const binanceInterval = TIMEFRAME_MAP[interval] || '1h';
    const url = `${BINANCE_API}/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((kline: any[]) => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[7]),
    }));
  } catch (error) {
    console.error('Error fetching Binance klines:', error);
    return [];
  }
}

/**
 * Fetch 24-hour ticker data for top cryptos
 */
export async function fetchTopCryptos(): Promise<CryptoTicker[]> {
  try {
    const tickers: CryptoTicker[] = [];
    
    for (const symbol of TOP_CRYPTOS) {
      try {
        const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        tickers.push({
          symbol: data.symbol,
          name: data.symbol.replace('USDT', ''),
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.openTime),
          changePercent: parseFloat(data.priceChangePercent),
          highPrice: parseFloat(data.highPrice),
          lowPrice: parseFloat(data.lowPrice),
          volume: parseFloat(data.volume),
          quoteVolume: parseFloat(data.quoteAssetVolume),
        });
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err);
      }
    }
    
    return tickers;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    return [];
  }
}

/**
 * Fetch all trading pairs from Binance
 */
export async function fetchAllTradingPairs(): Promise<CryptoTicker[]> {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    if (!response.ok) throw new Error('Failed to fetch tickers');
    
    const data = await response.json();
    
    return data
      .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
      .map((ticker: any) => ({
        symbol: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.openTime),
        changePercent: parseFloat(ticker.priceChangePercent),
        highPrice: parseFloat(ticker.highPrice),
        lowPrice: parseFloat(ticker.lowPrice),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteAssetVolume),
      }))
      .sort((a: CryptoTicker, b: CryptoTicker) => b.quoteVolume - a.quoteVolume)
      .slice(0, 100); // Top 100 by volume
  } catch (error) {
    console.error('Error fetching all trading pairs:', error);
    return [];
  }
}

/**
 * Cache for API calls to avoid rate limiting
 */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Cached fetch for ticker data
 */
export async function fetchTickerCached(symbol: string): Promise<CryptoTicker | null> {
  const cacheKey = `ticker-${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const ticker: CryptoTicker = {
      symbol: data.symbol,
      name: data.symbol.replace('USDT', ''),
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.openTime),
      changePercent: parseFloat(data.priceChangePercent),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteAssetVolume),
    };
    
    cache.set(cacheKey, { data: ticker, timestamp: Date.now() });
    return ticker;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}
