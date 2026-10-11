export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type SignalSummary = {
  name: string;
  value: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function generateMarketData(length = 120): Candle[] {
  const data: Candle[] = [];
  let price = 62000;

  for (let i = 0; i < length; i++) {
    const open = price;
    const drift = randomBetween(-280, 380);
    const close = Math.max(50000, open + drift);
    const high = Math.max(open, close) + randomBetween(80, 400);
    const low = Math.min(open, close) - randomBetween(80, 350);

    data.push({
      time: `T-${length - i}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(randomBetween(800, 2100).toFixed(0)),
    });

    price = close;
  }

  return data.reverse();
}

export function getSignalSummary(data: Candle[]): SignalSummary[] {
  const closes = data.map((d) => d.close);
  const last = closes[closes.length - 1];
  const avg = closes.reduce((sum, v) => sum + v, 0) / closes.length;
  const trend = (last - avg) / avg;

  return [
    { name: "Trend", value: Math.min(1, Math.max(0, 0.5 + trend * 6)) },
    { name: "Momentum", value: Math.min(1, Math.max(0, 0.4 + randomBetween(0.2, 0.8))) },
    { name: "Fractal", value: Math.min(1, Math.max(0, 0.55 + randomBetween(0.05, 0.4))) },
    { name: "Risk", value: Math.min(1, Math.max(0, 0.35 + randomBetween(0.1, 0.4))) },
  ];
}

export function getTimeframeSignals() {
  return [
    { label: "1s", active: false },
    { label: "1m", active: true },
    { label: "5m", active: false },
    { label: "1h", active: false },
    { label: "4h", active: false },
    { label: "1D", active: false },
    { label: "1W", active: false },
    { label: "1M", active: false },
  ];
}

export function generateForecast(data: Candle[]) {
  const closes = data.map((d) => d.close);
  const latest = closes[closes.length - 1];
  const previous = closes[closes.length - 2] ?? latest;
  const momentum = ((latest - previous) / previous) * 100;
  const volatility = data.slice(-20).reduce((sum, item) => sum + Math.abs(item.close - item.open), 0) / 20;
  const fractalScore = Math.min(1, Math.max(0, 0.5 + (momentum / 12) * 0.6));
  const projectedPrice = latest * (1 + momentum / 100 * 0.6);

  return {
    projectedPrice,
    direction: momentum >= 0 ? "Bullish" : "Bearish",
    momentum: Number(momentum.toFixed(2)),
    volatility: Number(volatility.toFixed(2)),
    fractalScore: Number(fractalScore.toFixed(2)),
  };
}
