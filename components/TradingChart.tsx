import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TradingChart({ data, forecast }: { data: any[]; forecast: any }) {
  const chartData = data.map((point, index) => ({
    ...point,
    projected: index > data.length - 5 ? forecast.projectedPrice : null,
  }));

  return (
    <div style={{ height: 420, width: "100%", background: "rgba(15,23,42,0.7)", borderRadius: 16, border: "1px solid rgba(148,163,184,0.2)", padding: 10 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.16)" />
          <XAxis dataKey="time" tick={{ fill: "#9bb0c5", fontSize: 10 }} minTickGap={20} />
          <YAxis tick={{ fill: "#9bb0c5", fontSize: 10 }} domain={["dataMin - 1000", "dataMax + 1000"]} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(103,232,249,0.4)", borderRadius: 12, color: "#ebf3ff" }}
          />
          <Area type="monotone" dataKey="close" stroke="#67e8f9" strokeWidth={2} fill="url(#lineGradient)" />
          <Area type="monotone" dataKey="projected" stroke="#36d399" strokeDasharray="4 4" strokeWidth={2} fill="none" />
          <ReferenceDot x={chartData[chartData.length - 1]?.time} y={forecast.projectedPrice} r={5} fill="#36d399" stroke="#fff" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
