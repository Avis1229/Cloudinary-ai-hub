'use client';

import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@/lib/models/UserModel';

// We won't use the overly truncated formatId anymore
const formatFullId = (id: string) => {
  if (!id) return '';
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

export default function Users() {
  const { data: users, error, isLoading, mutate } = useSWR(`/api/admin/users`);
  const esRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    const es = new EventSource('/api/admin/realtime');
    esRef.current = es;
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      try {
        const evt = JSON.parse(e.data);
        if (evt.type === 'user.updated' || evt.type === 'user.deleted') {
          mutate();
        }
      } catch {}
    };
    es.addEventListener('admin', handler as any);
    return () => {
      es.removeEventListener('admin', handler as any);
      es.close();
    };
  }, [mutate]);

  function exportCsv() {
    if (!filtered.length) {
      toast.error('Nothing to export');
      return;
    }
    const headers = ['id','name','email','phone','isAdmin'];
    const rows = filtered.map(u => [u._id, escapeCsv(u.name||''), escapeCsv(u.email||''), escapeCsv(u.phone||''), u.isAdmin ? 'YES' : 'NO']);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }

  function escapeCsv(value: string) {
    if (/[",\n]/.test(value)) {
      return '"' + value.replace(/"/g,'""') + '"';
    }
    return value;
  }

  const { trigger: deleteUser, isMutating: deleting } = useSWRMutation(
    `/api/admin/users`,
    async (url, { arg }: { arg: { userId: string } }) => {
      const toastId = toast.loading('Deleting user...');
      const res = await fetch(`${url}/${arg.userId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      res.ok ? toast.success('User deleted', { id: toastId }) : toast.error(data.message || 'Delete failed', { id: toastId });
    },
  );

  const { trigger: updateUserQuick } = useSWRMutation(
    `/api/admin/users/updateQuick`,
    async (_url, { arg }: { arg: { userId: string; isAdmin: boolean } }) => {
      const res = await fetch(`/api/admin/users/${arg.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: arg.isAdmin }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.message || 'Update failed');
      }
    }
  );

  const [selected, setSelected] = useState<string[]>([]);
  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }
  function toggleSelectAll() {
    if (allSelected) setSelected([]); else setSelected(filtered.map(u=>u._id));
  }
  async function bulkDelete() {
    if (!selected.length) return;
    if (!confirm(`Delete ${selected.length} user(s)?`)) return;
    for (const id of selected) {
      await deleteUser({ userId: id });
    }
    setSelected([]);
  }

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [view, setView] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'));

  const filtered: User[] = useMemo(() => {
    if (!users) return [];
    return users.filter((u: User) => {
      const s = search.toLowerCase();
      const matches = !s || 
                      u.name?.toLowerCase().includes(s) || 
                      u.email?.toLowerCase().includes(s) || 
                      u.phone?.toLowerCase().includes(s) ||
                      u._id.toLowerCase().includes(s);
      const roleOk = roleFilter === 'all' || (roleFilter === 'admin' ? u.isAdmin : !u.isAdmin);
      return matches && roleOk;
    });
  }, [users, search, roleFilter]);

  const allSelected = selected.length > 0 && filtered.length > 0 && selected.length === filtered.length;

  const stats = useMemo(() => {
    const total = users?.length || 0;
    const admins = users?.filter((u: User) => u.isAdmin).length || 0;
    const members = total - admins;
    return { total, admins, members };
  }, [users]);

  function handleDelete(id: string) {
    if (confirm('Delete this user?')) deleteUser({ userId: id });
  }
  function handleToggleAdmin(u: User) {
    const next = !u.isAdmin;
    mutate((prev: any) => prev?.map((p: User) => p._id === u._id ? { ...p, isAdmin: next } : p), { revalidate: false });
    updateUserQuick({ userId: u._id, isAdmin: next });
  }

  const LoadingSkeleton = (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-base-200 rounded w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-base-200 rounded-3xl" />
        ))}
      </div>
      <div className="h-96 bg-base-200 rounded-3xl" />
    </div>
  );

  if (error) return <div className="p-8 text-error font-bold text-center border border-error/20 rounded-xl bg-error/5">Failed to load users.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">User Directory</h1>
          <p className="text-sm text-base-content/60">Manage your members, administrators, and their records.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="stats shadow-sm border border-base-200 hidden sm:flex">
            <div className="stat px-4 py-2">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-lg">{stats.total}</div>
            </div>
            <div className="stat px-4 py-2">
              <div className="stat-title text-xs">Admins</div>
              <div className="stat-value text-lg text-primary">{stats.admins}</div>
            </div>
          </div>
          
          <div className="join border border-base-300 rounded-lg overflow-hidden">
            <button className={`btn btn-sm join-item ${view==='table'?'bg-primary text-primary-content hover:bg-primary-focus':'bg-base-100'}`} onClick={()=>setView('table')}>
              Table
            </button>
            <button className={`btn btn-sm join-item ${view==='cards'?'bg-primary text-primary-content hover:bg-primary-focus':'bg-base-100'}`} onClick={()=>setView('cards')}>
              Cards
            </button>
          </div>
          
          <button onClick={exportCsv} className="btn btn-sm btn-outline gap-2">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1 md:max-w-xs">
              <label className="label py-1"><span className="label-text text-xs uppercase font-bold tracking-wider opacity-70">Search Directory</span></label>
              <input 
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
                placeholder="Name, email, phone or ID..." 
                className="input input-sm input-bordered w-full" 
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="label py-1"><span className="label-text text-xs uppercase font-bold tracking-wider opacity-70">Role Filter</span></label>
              <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as any)} className="select select-sm select-bordered w-full">
                <option value='all'>All Roles</option>
                <option value='admin'>Administrators</option>
                <option value='user'>Standard Members</option>
              </select>
            </div>
            
            <div className="flex-1 flex justify-end items-center gap-3">
              <div className="text-xs font-medium bg-base-200 px-3 py-1.5 rounded-full">
                Showing {filtered.length} of {users?.length || 0}
              </div>
              {selected.length > 0 && (
                <button onClick={bulkDelete} className="btn btn-sm btn-error shadow-sm gap-2">
                  🗑 Delete ({selected.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading && LoadingSkeleton}

      {!isLoading && filtered.length === 0 && (
        <div className="p-16 border-2 border-dashed border-base-300 rounded-3xl text-center flex flex-col items-center gap-3">
          <span className="text-5xl">🙈</span>
          <p className="font-bold text-lg">No users found</p>
          <p className="text-sm text-base-content/60">Try adjusting your search or filters.</p>
          {search && <button className="btn btn-sm btn-outline mt-2" onClick={()=>setSearch('')}>Clear Search</button>}
        </div>
      )}

      {/* Table View */}
      {!isLoading && filtered.length > 0 && view === 'table' && (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-base-200/50 text-base-content">
                <tr>
                  <th className="w-12"><input type="checkbox" className="checkbox checkbox-sm" checked={allSelected} onChange={toggleSelectAll} /></th>
                  <th>User Info</th>
                  <th>Contact</th>
                  <th>ID</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: User) => (
                  <tr key={user._id} className={`hover transition-colors ${selected.includes(user._id) ? 'bg-primary/5' : ''}`}>
                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" checked={selected.includes(user._id)} onChange={()=>toggleSelect(user._id)} />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full border border-base-300 bg-base-200 flex items-center justify-center">
                            {user.avatar ? (
                              <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <span className="text-sm font-bold text-primary">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{user.name}</div>
                          <div className="text-xs text-base-content/50">Joined {new Date((user as any).createdAt || Date.now()).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-base-content/50 mt-0.5">{user.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div className="font-mono text-xs bg-base-200 px-2 py-1 rounded inline-block" title={user._id}>
                        {formatFullId(user._id)}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={()=>handleToggleAdmin(user)} 
                        className={`badge badge-sm font-semibold border-0 ${user.isAdmin ? 'badge-primary text-primary-content' : 'bg-base-200 text-base-content/70'}`}
                      >
                        {user.isAdmin ? 'Admin' : 'Member'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/admin/users/${user._id}`} className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary">View Full Profile</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {!isLoading && filtered.length > 0 && view === 'cards' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((u: User) => (
            <div 
              key={u._id} 
              className={`card bg-base-100 border transition-all duration-200 shadow-sm hover:shadow-md ${selected.includes(u._id) ? 'border-primary ring-1 ring-primary' : 'border-base-200'}`}
            >
              <div className="absolute top-4 right-4 z-10">
                <input type="checkbox" className="checkbox checkbox-sm" checked={selected.includes(u._id)} onChange={()=>toggleSelect(u._id)} />
              </div>
              
              <div className="card-body p-6">
                <div className="flex flex-col items-center text-center gap-3 mb-2">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full border-4 border-base-100 shadow-sm bg-base-200 flex items-center justify-center">
                      {u.avatar ? (
                        <Image src={u.avatar} alt={u.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <span className="text-2xl font-bold text-primary">{u.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate w-48 mx-auto" title={u.name}>{u.name}</h3>
                    <button 
                      onClick={()=>handleToggleAdmin(u)}
                      className={`badge badge-sm mt-2 border-0 font-medium ${u.isAdmin ? 'badge-primary' : 'bg-base-200 text-base-content/60'}`}
                    >
                      {u.isAdmin ? '🛡 Administrator' : '👤 Member'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-4 py-4 border-t border-b border-base-200/60">
                  <div className="flex items-start gap-2">
                    <span className="text-base-content/40 mt-0.5">✉️</span>
                    <span className="text-sm truncate" title={u.email}>{u.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base-content/40 mt-0.5">📱</span>
                    <span className="text-sm">{u.phone || <span className="text-base-content/40 italic">No phone added</span>}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base-content/40 mt-0.5">🆔</span>
                    <span className="text-xs font-mono bg-base-200 px-1.5 py-0.5 rounded text-base-content/70" title={u._id}>{formatFullId(u._id)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 mt-auto">
                  <Link href={`/admin/users/${u._id}`} className="btn btn-sm btn-primary flex-1 shadow-sm shadow-primary/20">
                    View Profile
                  </Link>
                  <button 
                    disabled={deleting} 
                    onClick={()=>handleDelete(u._id)} 
                    className="btn btn-sm btn-square btn-outline btn-error"
                    title="Delete User"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
