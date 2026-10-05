'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Shield, ShieldAlert, ShieldCheck, Users, Activity, Lock, Key, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminSecurity() {
  const { data, error, isLoading } = useSWR('/api/admin/security/metrics', fetcher, {
    refreshInterval: 15000 // Poll every 15 seconds for realtime
  });

  const [simulating, setSimulating] = useState(false);

  // Trigger a fake security event for testing the realtime UI
  const triggerFakeEvent = async () => {
    if (simulating) return;
    setSimulating(true);
    try {
      await fetch('/api/admin/security/simulate-attack', {
        method: 'POST',
      });
      // SWR will pick it up on next poll (15s) or we can wait a bit
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSimulating(false), 2000);
    }
  };

  if (error) return <div className="p-6 text-error">Failed to load security metrics.</div>;

  return (
    <div className="p-6 w-full space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-base-300 pb-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary italic flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            Security Operations Center
          </h1>
          <p className="text-sm opacity-70 mt-2 tracking-widest uppercase font-bold text-[10px]">
            Real-time Threat Monitoring & Access Control
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={triggerFakeEvent} 
            disabled={simulating}
            className="btn btn-sm btn-outline btn-error"
          >
            {simulating ? 'Simulating...' : 'Simulate Auth Attack'}
          </button>
          <Link href="/admin/logs" className="btn btn-sm btn-primary">
            View Full Audit Trail
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-base-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <>
          {/* Status Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Health Status */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              data?.systemHealth === 'Optimal' 
                ? 'bg-success/10 border-success/30' 
                : data?.systemHealth === 'Warning' 
                  ? 'bg-error/10 border-error/30' 
                  : 'bg-warning/10 border-warning/30'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`p-2 rounded-xl ${
                  data?.systemHealth === 'Optimal' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}>
                  {data?.systemHealth === 'Optimal' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</span>
              </div>
              <div>
                <p className={`text-2xl font-bold font-headline ${
                  data?.systemHealth === 'Optimal' ? 'text-success' : 'text-error'
                }`}>{data?.systemHealth}</p>
                <p className="text-xs opacity-70 mt-1">System Health</p>
              </div>
            </div>

            {/* Active Threats */}
            <div className="p-6 rounded-2xl border border-base-300 bg-base-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 rounded-xl bg-error/10 text-error">
                  <AlertTriangle size={24} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">24h</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-base-content">{data?.activeThreats || 0}</p>
                <p className="text-xs opacity-70 mt-1">Active Threats / Warnings</p>
              </div>
            </div>

            {/* Auth Events */}
            <div className="p-6 rounded-2xl border border-base-300 bg-base-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lock size={24} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">24h</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-base-content">{data?.recentAuthEvents || 0}</p>
                <p className="text-xs opacity-70 mt-1">Auth / Registration Events</p>
              </div>
            </div>

            {/* Admin Accounts */}
            <div className="p-6 rounded-2xl border border-base-300 bg-base-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 rounded-xl bg-secondary/10 text-secondary">
                  <Key size={24} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-base-content">{data?.adminUsers?.length || 0}</p>
                <p className="text-xs opacity-70 mt-1">Privileged Admin Accounts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live Security Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                  <Activity className="text-primary" size={20} />
                  Live Security Alerts
                </h2>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-error">Live</span>
                </div>
              </div>

              <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                {data?.securityAlerts?.length === 0 ? (
                  <div className="p-12 text-center opacity-50 flex flex-col items-center">
                    <ShieldCheck size={48} className="mb-4 opacity-50" />
                    <p>No recent security alerts.</p>
                    <p className="text-xs">Your sanctuary is secure.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-base-200/50">
                    {data?.securityAlerts?.map((alert: any) => (
                      <div key={alert._id} className="p-5 hover:bg-base-200/50 transition-colors flex gap-4">
                        <div className="mt-1">
                          {alert.level === 'critical' ? (
                            <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-error">
                              <AlertTriangle size={16} />
                            </div>
                          ) : alert.level === 'warn' ? (
                            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                              <ShieldAlert size={16} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center text-info">
                              <Activity size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-base-content">{alert.message}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 whitespace-nowrap ml-4">
                              {format(new Date(alert.createdAt), 'HH:mm:ss')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs opacity-70 font-mono bg-base-200 px-2 py-0.5 rounded">
                              IP: {alert.ipAddress || 'Internal'}
                            </span>
                            <span className="text-xs opacity-70 font-mono bg-base-200 px-2 py-0.5 rounded">
                              Mod: {alert.module}
                            </span>
                            {alert.user && (
                              <span className="text-xs text-primary font-bold">
                                User: {alert.user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Privileged Accounts Audit */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <Users className="text-secondary" size={20} />
                Privileged Access
              </h2>
              
              <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm divide-y divide-base-200/50">
                {data?.adminUsers?.map((admin: any) => (
                  <div key={admin._id} className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold font-headline italic">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-base-content truncate">{admin.name}</p>
                      <p className="text-xs opacity-60 truncate">{admin.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="badge badge-primary badge-sm font-bold uppercase tracking-widest text-[9px]">Admin</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Recommendations */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Recommendations
                </h3>
                <ul className="space-y-3 text-sm opacity-80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Enforce 2FA for all Privileged Accounts to mitigate credential stuffing.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Review active session tokens bi-weekly.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Keep production logs retention strictly to 30 days for compliance.
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
