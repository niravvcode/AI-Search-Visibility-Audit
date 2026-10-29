interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showLevel?: boolean;
}

export function ScoreGauge({
  score,
  size = "md",
  label = "Readiness Score",
  showLevel = true,
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const radiusMap = {
    sm: 28,
    md: 44,
    lg: 60,
  };
  const strokeMap = {
    sm: 5,
    md: 8,
    lg: 10,
  };
  const sizePx = {
    sm: 70,
    md: 110,
    lg: 150,
  };

  const r = radiusMap[size];
  const stroke = strokeMap[size];
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = "text-danger";
  let badgeText = "Critical Gaps";
  let badgeColor = "bg-danger/10 text-danger border-danger/20";

  if (clampedScore >= 80) {
    colorClass = "text-success";
    badgeText = "Answer Ready";
    badgeColor = "bg-success/10 text-success border-success/20";
  } else if (clampedScore >= 60) {
    colorClass = "text-info";
    badgeText = "Competitive";
    badgeColor = "bg-info/10 text-info border-info/20";
  } else if (clampedScore >= 40) {
    colorClass = "text-warning";
    badgeText = "Needs Optimization";
    badgeColor = "bg-warning/10 text-warning border-warning/20";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={sizePx[size]}
          height={sizePx[size]}
          viewBox={`0 0 ${sizePx[size]} ${sizePx[size]}`}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={sizePx[size] / 2}
            cy={sizePx[size] / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-border opacity-60"
          />
          {/* Progress circle */}
          <circle
            cx={sizePx[size] / 2}
            cy={sizePx[size] / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${colorClass} transition-all duration-700 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tracking-tight text-text ${
              size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-base"
            }`}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-semibold text-muted">/100</span>
        </div>
      </div>

      {label && <p className="text-xs font-medium text-muted mt-2">{label}</p>}

      {showLevel && (
        <span
          className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeColor}`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}
