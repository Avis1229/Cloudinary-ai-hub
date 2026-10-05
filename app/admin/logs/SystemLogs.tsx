'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Shield, Search, ChevronLeft, ChevronRight, Activity, AlertTriangle, Info, Terminal } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SystemLogs() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('All');
  const [module, setModule] = useState('All');
  const limit = 20;

  const { data, error, isLoading } = useSWR(
    `/api/admin/logs?page=${page}&limit=${limit}&level=${level}&module=${module}`,
    fetcher
  );

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const getLevelIcon = (lvl: string) => {
    switch (lvl) {
      case 'critical':
      case 'error': return <AlertTriangle size={16} className="text-error" />;
      case 'warn': return <Shield size={16} className="text-warning" />;
      case 'info': return <Info size={16} className="text-info" />;
      default: return <Activity size={16} className="text-base-content" />;
    }
  };

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case 'critical': return 'badge-error';
      case 'error': return 'badge-error badge-outline';
      case 'warn': return 'badge-warning badge-outline';
      case 'info': return 'badge-info badge-outline';
      default: return 'badge-ghost';
    }
  };

  if (error) return <div className="p-6 text-error">Failed to load system logs.</div>;

  return (
    <div className="p-6 w-full space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-base-300 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm opacity-60">
            <Link href="/admin/security" className="hover:underline">Security</Link>
            <span>/</span>
            <span>Logs</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <Terminal className="text-primary" size={32} />
            System Audit Trail
          </h1>
          <p className="text-sm opacity-70 mt-2">
            Comprehensive logs for system operations, authentication, and security events.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm">
        <div className="form-control w-full sm:max-w-xs">
          <label className="label">
            <span className="label-text text-xs font-bold uppercase tracking-widest">Level</span>
          </label>
          <select 
            className="select select-bordered select-sm w-full" 
            value={level} 
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          >
            <option value="All">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="form-control w-full sm:max-w-xs">
          <label className="label">
            <span className="label-text text-xs font-bold uppercase tracking-widest">Module</span>
          </label>
          <select 
            className="select select-bordered select-sm w-full" 
            value={module} 
            onChange={(e) => { setModule(e.target.value); setPage(1); }}
          >
            <option value="All">All Modules</option>
            <option value="auth">Auth</option>
            <option value="order">Order</option>
            <option value="payment">Payment</option>
            <option value="system">System</option>
            <option value="security">Security</option>
            <option value="product">Product</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200 text-base-content uppercase text-[10px] tracking-widest font-bold">
                <th>Timestamp</th>
                <th>Level</th>
                <th>Module</th>
                <th>Message</th>
                <th>IP / User</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <span className="loading loading-spinner text-primary"></span>
                  </td>
                </tr>
              ) : data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 opacity-60">
                    No logs found matching criteria.
                  </td>
                </tr>
              ) : (
                data?.logs?.map((log: any) => (
                  <tr key={log._id} className="hover">
                    <td className="whitespace-nowrap font-mono text-xs opacity-70">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td>
                      <div className={`badge badge-sm uppercase text-[9px] font-bold ${getLevelBadge(log.level)} gap-1`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                        {log.module}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm">{log.message}</span>
                      {Object.keys(log.meta || {}).length > 0 && (
                        <div className="mt-1 text-[10px] font-mono opacity-60 max-w-md truncate">
                          {JSON.stringify(log.meta)}
                        </div>
                      )}
                    </td>
                    <td className="text-xs">
                      {log.ipAddress && <div className="font-mono opacity-80">IP: {log.ipAddress}</div>}
                      {log.user && (
                        <div className="text-primary mt-1">
                          User: {log.user.name || log.user.email}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-base-300 bg-base-50">
            <span className="text-xs opacity-60 font-bold uppercase tracking-widest">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
            </span>
            <div className="join">
              <button 
                className="join-item btn btn-sm" 
                onClick={handlePrevious} 
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className="join-item btn btn-sm" 
                onClick={handleNext} 
                disabled={page === data.pagination.totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
