'use client';
import { useState } from 'react';
import { Button } from './ui/button';
export function FinanceChart({
  title,
  series,
  period = '1W',
  style = 'line',
}: {
  title: string;
  series: { label: string; value: number }[];
  period?: string;
  style?: string;
}) {
  const [range, setRange] = useState(period);
  const count = range === '1D' ? 2 : range === '1W' ? 3 : series.length;
  const points = series.slice(-count);
  const low = Math.min(...points.map((p) => p.value)),
    high = Math.max(...points.map((p) => p.value));
  const span = high - low || 1;
  const plotted = points.map((p, i) => ({
    x: 20 + (i * 360) / Math.max(1, points.length - 1),
    y: 160 - ((p.value - low) / span) * 130,
    ...p,
  }));
  return (
    <section className="finance-chart" aria-label={title}>
      <h2>{title}</h2>
      <p>Sample historical values · {range}</p>
      <svg
        viewBox="0 0 400 190"
        // SVG needs an image role; replacing it with <img> loses the inline chart.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-label={`${title}, ${range}. ${points.map((p) => `${p.label}: ${p.value}`).join(', ')}`}
      >
        {style === 'bar' ? (
          plotted.map((p) => (
            <rect
              key={p.label}
              x={p.x - 8}
              y={p.y}
              width="16"
              height={180 - p.y}
              fill="var(--contentAccentSecondary)"
            />
          ))
        ) : (
          <polyline
            points={plotted.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--contentAccentSecondary)"
            strokeWidth="2"
          />
        )}
        <text x="20" y="188" fontSize="10" fill="currentColor">
          {points[0]?.label}
        </text>
        <text
          x="380"
          y="188"
          textAnchor="end"
          fontSize="10"
          fill="currentColor"
        >
          {points.at(-1)?.label}
        </text>
      </svg>
      <div className="finance-ranges" aria-label="Chart range">
        {['1D', '1W', '1M'].map((r) => (
          <Button
            key={r}
            size="sm"
            variant={r === range ? 'default' : 'ghost'}
            aria-pressed={r === range}
            onClick={() => setRange(r)}
          >
            {r}
          </Button>
        ))}
      </div>
    </section>
  );
}
