import { Activity, BrainCircuit, CandlestickChart, Coins, Gauge, Layers3, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { StrategyCard } from "@/components/StrategyCard";
import { TradingChart } from "@/components/TradingChart";
import { generateMarketData, generateForecast, getSignalSummary, getTimeframeSignals } from "@/lib/market";

export default function HomePage() {
  const market = generateMarketData(120);
  const forecast = generateForecast(market);
  const summary = getSignalSummary(market);
  const timeframeSignals = getTimeframeSignals();

  const metricCards = [
    { label: "حجم المحفظة الوهمية", value: "$128,450", trend: "+8.4%", icon: Coins },
    { label: "معدل النجاح", value: "68.2%", trend: "+4.7%", icon: Gauge },
    { label: "قيمة المحفظة اليومية", value: "$3,280", trend: "+1.3%", icon: TrendingUp },
    { label: "مستوى الخطر", value: "متوسط", trend: "-0.8%", icon: ShieldCheck },
  ];

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Trading Infrastructure</p>
          <h1>Quantum Fractal Trading Lab</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-btn">Live Monitor</button>
          <button className="primary-btn">Open Strategy</button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-card glow">
          <div className="hero-header">
            <span className="status-dot" />
            <span>Market pulse</span>
          </div>

          <div className="hero-price-row">
            <div>
              <p className="small-label">BTC / USD</p>
              <h2>$64,880.40</h2>
            </div>
            <div className="pill success">+2.76%</div>
          </div>

          <div className="mini-stats">
            <div>
              <span>Prediction</span>
              <strong>Uptrend</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>81%</strong>
            </div>
            <div>
              <span>Risk</span>
              <strong>Low</strong>
            </div>
          </div>
        </div>

        <div className="hero-card compact">
          <div className="hero-header">
            <BrainCircuit size={18} />
            <span>Signal stack</span>
          </div>
          <ul className="signal-list">
            {summary.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <strong className={item.value >= 0.7 ? "positive" : "neutral"}>{item.value.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="metrics-grid">
        {metricCards.map(({ label, value, trend, icon: Icon }) => (
          <div key={label} className="metric-card">
            <div className="icon-wrap">
              <Icon size={18} />
            </div>
            <div>
              <p>{label}</p>
              <h3>{value}</h3>
            </div>
            <span className="trend positive">{trend}</span>
          </div>
        ))}
      </section>

      <section className="chart-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Chart layer</p>
            <h3>TradingView-inspired signal overlay</h3>
          </div>
          <div className="timeframe-pills">
            {timeframeSignals.map((f) => (
              <button key={f.label} className={f.active ? "active" : ""}>{f.label}</button>
            ))}
          </div>
        </div>

        <TradingChart data={market} forecast={forecast} />
      </section>

      <section className="strategy-grid">
        <StrategyCard
          icon={BrainCircuit}
          title="Deep Learning Engine"
          desc="LSTM + Transformer learns sequential patterns from prior candles and multi-frame momentum cycles."
          badge="Model A"
          score={81}
        />

        <StrategyCard
          icon={Sparkles}
          title="Fractal Scanner"
          desc="Detects reversal and continuation zones using self-similar high-low structures across timeframes."
          badge="Fractal"
          score={74}
        />

        <StrategyCard
          icon={Layers3}
          title="Quantum-Inspired Optimizer"
          desc="Hybrid search engine for portfolio allocation, risk weighting and scenario simulation."
          badge="QAOA"
          score={69}
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <CandlestickChart size={18} />
            <h4>Order Flow</h4>
          </div>

          <div className="order-list">
            <div className="order-row">
              <span>Buy BTC</span>
              <strong className="positive">+$1,240</strong>
            </div>
            <div className="order-row">
              <span>Sell ETH</span>
              <strong className="negative">-$460</strong>
            </div>
            <div className="order-row">
              <span>Long SOL</span>
              <strong className="positive">+$880</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <Activity size={18} />
            <h4>AI Forecast</h4>
          </div>

          <div className="forecast-box">
            <p>Predicted next impulse</p>
            <h3>{forecast.projectedPrice.toFixed(2)}</h3>
            <span className="pill neutral">{forecast.direction}</span>
          </div>

          <ul className="forecast-list">
            <li>
              <span>Momentum</span>
              <strong>{forecast.momentum.toFixed(2)}</strong>
            </li>
            <li>
              <span>Volatility</span>
              <strong>{forecast.volatility.toFixed(2)}</strong>
            </li>
            <li>
              <span>Fractal score</span>
              <strong>{forecast.fractalScore.toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
