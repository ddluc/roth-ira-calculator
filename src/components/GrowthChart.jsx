import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { fmtK } from '../calc.js'

ChartJS.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
)

const legend = [
  { label: 'Portfolio value', color: '#378ADD' },
  { label: 'Total contributions', color: '#888780' },
  { label: 'Total gains', color: '#1D9E75' },
]

export default function GrowthChart({ years, portfolioData, contribData, gainsData }) {
  const data = {
    labels: years.map((y) => 'Yr ' + y),
    datasets: [
      {
        label: 'Portfolio value',
        data: portfolioData,
        borderColor: '#378ADD',
        backgroundColor: 'rgba(55,138,221,0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
        order: 3,
      },
      {
        label: 'Total contributions',
        data: contribData,
        borderColor: '#888780',
        backgroundColor: 'rgba(136,135,128,0.08)',
        fill: true,
        tension: 0,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 3],
        order: 2,
      },
      {
        label: 'Total gains',
        data: gainsData,
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.10)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
        order: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ' ' + ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString(),
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(128,128,128,0.1)' },
        ticks: {
          color: '#888',
          font: { size: 11 },
          autoSkip: false,
          maxRotation: 0,
          callback: (val, i) => (i % 5 === 0 ? 'Yr ' + i : ''),
        },
      },
      y: {
        grid: { color: 'rgba(128,128,128,0.1)' },
        ticks: { color: '#888', font: { size: 11 }, callback: (v) => fmtK(v) },
      },
    },
  }

  return (
    <>
      <div className="chart-legend">
        {legend.map((l) => (
          <span className="legend-item" key={l.label}>
            <span className="legend-swatch" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </>
  )
}
