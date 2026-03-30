'use client'

interface RingChartProps {
  label: string
  current: number
  goal: number
  unit: string
  color: string
  size?: number
  strokeWidth?: number
}

export default function RingChart({
  label,
  current,
  goal,
  unit,
  color,
  size = 110,
  strokeWidth = 10,
}: RingChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / goal, 1)
  const dash = circumference * progress
  const gap = circumference - dash
  const center = size / 2

  const remaining = Math.max(goal - current, 0)
  const over = current > goal ? current - goal : 0

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#2e2e3e"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-white leading-none">
            {Math.round(current)}
          </span>
          <span className="text-[10px] text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-300">{label}</span>
      <span className="text-[10px] text-gray-500">
        {over > 0 ? (
          <span style={{ color }}>+{Math.round(over)} over</span>
        ) : (
          `${Math.round(remaining)} left`
        )}
      </span>
    </div>
  )
}
