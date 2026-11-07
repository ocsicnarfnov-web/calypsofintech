import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  indicator?: 'nominal' | 'alert' | 'warning' | 'neutral';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  indicator = 'neutral',
  action,
}) => {
  const indicatorStyles = {
    nominal: 'text-emerald-700 dark:text-emerald-400',
    alert: 'text-rose-700 dark:text-rose-400',
    warning: 'text-amber-700 dark:text-amber-400',
    neutral: 'text-neutral-500 dark:text-neutral-400',
  };

  return (
    <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
            {label}
          </span>
          {trend && (
            <span
              className={`text-xs font-mono tabular-nums ${
                trend.isNeutral
                  ? 'text-neutral-500 dark:text-neutral-400'
                  : trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
          {value}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
        {subtext ? (
          <span className={`truncate ${indicatorStyles[indicator]}`}>{subtext}</span>
        ) : (
          <span className="text-neutral-400 dark:text-neutral-500">Live ledger</span>
        )}

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white underline underline-offset-2 shrink-0 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
