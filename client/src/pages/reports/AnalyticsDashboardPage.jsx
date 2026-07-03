import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';
import * as reportService from '../../services/reportService';

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#f97316', '#ef4444', '#6b7280'];

const STATUS_COLORS = {
  Available: '#22c55e',
  Borrowed: '#f59e0b',
  Reserved: '#3b82f6',
  UnderMaintenance: '#f97316',
  Lost: '#ef4444',
  Retired: '#6b7280'
};

const Card = ({ label, value, accent = 'text-ink-900' }) => (
  <div className="rounded-lg border border-border bg-white p-4">
    <p className="text-sm text-ink-400">{label}</p>
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
  </div>
);

const AnalyticsDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [spend, setSpend] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getAssetSummary(),
      reportService.getAssetsByCategory(),
      reportService.getAssetsByStatus(),
      reportService.getProcurementSpend(),
      reportService.getBorrowingTrends()
    ]).then(([s, c, st, sp, tr]) => {
      setSummary(s);
      setByCategory(c);
      setByStatus(st);
      setSpend(sp);
      setTrends(tr);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-ink-400">Loading analytics…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="heading-page">Reporting & Analytics</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total assets" value={summary.totalAssets} />
        <Card label="Total items" value={summary.totalItems} />
        <Card label="Available items" value={summary.availableItems} accent="text-green-700" />
        <Card label="Borrowed items" value={summary.borrowedItems} accent="text-amber-700" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets by category */}
        <div className="rounded-lg border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Assets by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="totalQty" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availableQty" name="Available" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by status */}
        <div className="rounded-lg border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Assets by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                label={({ status, count }) => `${status} (${count})`}
              >
                {byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Procurement spend */}
        <div className="rounded-lg border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Procurement Spend by Month</h2>
          {spend.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">No procurement data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={spend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="spend" name="Spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Borrowing trends */}
        <div className="rounded-lg border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Borrowing Trends</h2>
          {trends.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">No borrowing data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="checkouts" name="Checkouts" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="returns" name="Returns" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Legend verticalAlign="bottom" height={36} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
