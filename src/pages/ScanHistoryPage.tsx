import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/react';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { getScanHistory } from '../services/api';
import type { ScanHistoryItem } from '../services/mockData';

const filterOptions = ['All', 'Compliant', 'Needs Review', 'Non-Compliant'];

type SortMode = 'Newest' | 'Oldest' | 'Highest Score' | 'Lowest Score';

export function ScanHistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('Newest');

  const { getToken } = useClerkAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    getScanHistory(getTokenRef.current).then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    const next = items.filter((item) => {
      const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...next].sort((a, b) => {
      if (sortMode === 'Highest Score') return b.score - a.score;
      if (sortMode === 'Lowest Score') return a.score - b.score;
      if (sortMode === 'Oldest') return a.id - b.id;
      return b.id - a.id;
    });
  }, [items, search, statusFilter, sortMode]);

  const metrics = {
    total: items.length,
    compliant: items.filter((item) => item.status === 'Compliant').length,
    nonCompliant: items.filter((item) => item.status === 'Non-Compliant').length,
    review: items.filter((item) => item.status === 'Needs Review').length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Scan history</div>
          <h1 className="text-4xl font-bold text-white">Recent compliance checks</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-500/50 sm:w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Highest Score">Highest Score</option>
            <option value="Lowest Score">Lowest Score</option>
          </select>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Scans" value={String(metrics.total)} accent="cyan" />
        <MetricCard label="Compliant" value={String(metrics.compliant)} accent="emerald" />
        <MetricCard label="Non-Compliant" value={String(metrics.nonCompliant)} accent="red" />
        <MetricCard label="Needs Review" value={String(metrics.review)} accent="amber" />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title="No scans found" description="Try adjusting the search or filter to view matching compliance records." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Compliance Score</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Issues</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="cursor-pointer transition-colors duration-[var(--transition-fast)] ease-out hover:bg-slate-900/80" onClick={() => navigate(`/report/${item.id}`)}>
                    <td className="px-5 py-4 font-medium text-white">{item.product}</td>
                    <td className="px-5 py-4">{item.date}</td>
                    <td className="px-5 py-4">{item.score} / 100</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">{item.status === 'Non-Compliant' ? '3' : item.status === 'Needs Review' ? '2' : '1'}</td>
                    <td className="px-5 py-4 text-cyan-300">Open</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
