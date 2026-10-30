interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showLevel?: boolean;
  showGrade?: boolean;
}

export function ScoreGauge({
  score,
  size = "md",
  label = "Readiness Score",
  showLevel = true,
  showGrade = true,
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const radiusMap = {
    sm: 28,
    md: 44,
    lg: 60,
  };
  const strokeMap = {
    sm: 5,
    md: 7,
    lg: 9,
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
  let grade = "F";

  if (clampedScore >= 90) {
    colorClass = "text-success";
    badgeText = "Answer Ready";
    badgeColor = "bg-success/10 text-success border-success/20";
    grade = "A+";
  } else if (clampedScore >= 75) {
    colorClass = "text-success";
    badgeText = "Optimized";
    badgeColor = "bg-success/10 text-success border-success/20";
    grade = "A";
  } else if (clampedScore >= 60) {
    colorClass = "text-info";
    badgeText = "Competitive";
    badgeColor = "bg-info/10 text-info border-info/20";
    grade = "B";
  } else if (clampedScore >= 45) {
    colorClass = "text-warning";
    badgeText = "Needs Work";
    badgeColor = "bg-warning/10 text-warning border-warning/20";
    grade = "C";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={sizePx[size]}
          height={sizePx[size]}
          viewBox={`0 0 ${sizePx[size]} ${sizePx[size]}`}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Background circle track */}
          <circle
            cx={sizePx[size] / 2}
            cy={sizePx[size] / 2}
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-border opacity-50"
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
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center">
            <span
              className={`font-extrabold tracking-tight text-text ${
                size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-base"
              }`}
            >
              {clampedScore}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted ml-0.5">/100</span>
          </div>
          {showGrade && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Grade {grade}
            </span>
          )}
        </div>
      </div>

      {label && <p className="text-xs font-medium text-muted mt-2">{label}</p>}

      {showLevel && (
        <span
          className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}
