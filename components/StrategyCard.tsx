import type { LucideIcon } from "lucide-react";

export function StrategyCard({
  icon: Icon,
  title,
  desc,
  badge,
  score,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  badge: string;
  score: number;
}) {
  return (
    <div className="strategy-card">
      <div className="card-top">
        <div className="card-icon">
          <Icon size={20} />
        </div>
        <span className="badge">{badge}</span>
      </div>

      <h4>{title}</h4>
      <p>{desc}</p>

      <div className="score-row">
        <span>Signal score</span>
        <strong>{score}%</strong>
      </div>
    </div>
  );
}
