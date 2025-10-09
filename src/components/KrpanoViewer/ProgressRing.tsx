interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
}

export function ProgressRing({ 
  percent, 
  size = 60, 
  stroke = 4 
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percent / 100);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {/* White background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="white"
          stroke="none"
        />
        {/* Progress background (optional, for subtle ring behind progress) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#5EAC24"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%"
          }}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 600,
          color: "#5EAC24",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          pointerEvents: "none"
        }}
      >
        {Math.round(percent)}%
      </div>
    </div>
  );
}