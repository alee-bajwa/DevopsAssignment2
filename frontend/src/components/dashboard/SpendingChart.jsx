/**
 * Spending Chart Component
 */
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SpendingChart = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-bar-chart" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <p className="text-muted mt-3">No data available</p>
      </div>
    );
  }

  // Group transactions by date (last 7 days)
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  const spendingByDay = {};
  last7Days.forEach(date => {
    spendingByDay[date] = { debit: 0, credit: 0 };
  });

  transactions.forEach(txn => {
    const date = new Date(txn.created_at).toISOString().split('T')[0];
    if (spendingByDay[date]) {
      if (txn.direction === 'debit') {
        spendingByDay[date].debit += parseFloat(txn.amount);
      } else {
        spendingByDay[date].credit += parseFloat(txn.amount);
      }
    }
  });

  const data = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Spending',
        data: last7Days.map(date => spendingByDay[date].debit),
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
      },
      {
        label: 'Income',
        data: last7Days.map(date => spendingByDay[date].credit),
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SpendingChart;

