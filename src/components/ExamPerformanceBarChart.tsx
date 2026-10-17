import React, { useMemo } from 'react';
import {
  buildGroupedChartData,
  buildYTicks,
  formatChartTick,
} from '../lib/track-record-utils';
import type { TrackRecord } from '../context/data-context';

type ExamPerformanceBarChartProps = {
  trackRecord: TrackRecord;
  emptyLabel?: string;
  compact?: boolean;
};

export const ExamPerformanceBarChart: React.FC<ExamPerformanceBarChartProps> = ({
  trackRecord,
  emptyLabel = 'No exam data recorded yet.',
  compact = false,
}) => {
  const chartData = useMemo(() => buildGroupedChartData(trackRecord), [trackRecord]);

  if (!chartData) {
    return (
      <div className={`exam-grouped-chart-empty${compact ? ' is-compact' : ''}`}>
        <p>{emptyLabel}</p>
      </div>
    );
  }

  const { groups, legend, yMax } = chartData;
  const yTicks = buildYTicks(yMax);

  return (
    <div
      className={`exam-grouped-chart${compact ? ' is-compact' : ''}`}
      role="img"
      aria-label="Exam performance grouped bar chart"
    >
      <div className="exam-grouped-chart-body">
        <div className="exam-grouped-chart-y" aria-hidden="true">
          {[...yTicks].reverse().map((tick) => (
            <span key={tick}>{formatChartTick(tick)}</span>
          ))}
        </div>

        <div className="exam-grouped-chart-plot">
          <div className="exam-grouped-chart-plot-area">
            <div className="exam-grouped-chart-grid" aria-hidden="true">
              {yTicks.map((tick) => (
                <div
                  key={tick}
                  className="exam-grouped-chart-gridline"
                  style={{ bottom: `${(tick / yMax) * 100}%` }}
                />
              ))}
            </div>

            <div className="exam-grouped-chart-groups">
              {groups.map((group) => (
                <div key={group.year} className="exam-grouped-chart-group">
                  <div className="exam-grouped-chart-bars">
                    {group.bars.map((bar) => {
                      const height = bar.numeric > 0
                        ? Math.min(100, (bar.numeric / yMax) * 100)
                        : 0;

                      return (
                        <div
                          key={`${group.year}-${bar.label}`}
                          className="exam-grouped-chart-bar"
                          style={{
                            height: `${height}%`,
                            backgroundColor: bar.color,
                          }}
                          title={`${bar.label}: ${bar.value}`}
                          aria-label={`${bar.category}, ${group.year}: ${bar.value}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="exam-grouped-chart-years">
            {groups.map((group) => (
              <span key={group.year} className="exam-grouped-chart-category">
                {group.year}
              </span>
            ))}
          </div>
        </div>
      </div>

      {legend.length > 0 && (
        <div className="exam-grouped-chart-legend">
          {legend.map((entry) => (
            <span key={entry.label} className="exam-grouped-chart-legend-item">
              <span
                className="exam-grouped-chart-swatch"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
