'use client';

import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ReferralAdminTable = dynamic(() => import('@/components/admin/ReferralAdminTable'), { ssr: false });

const fetcher = (url: string) => fetch(url).then(r => r.json());

function ReferralSettingsForm() {
  const { data, mutate, isLoading } = useSWR('/api/admin/referral-settings', fetcher);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: true,
    rewardType: 'fixed' as 'fixed' | 'percent',
    rewardValue: 500,
    minOrderValue: 1000,
    maxReward: 0,
    referralLimit: 0,
    allowSelfReferral: false,
  });

  useEffect(() => {
    if (data) {
      setForm({
        enabled: data.enabled ?? true,
        rewardType: data.rewardType || 'fixed',
        rewardValue: data.rewardValue || 500,
        minOrderValue: data.minOrderValue || 0,
        maxReward: data.maxReward || 0,
        referralLimit: data.referralLimit || 0,
        allowSelfReferral: data.allowSelfReferral || false,
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Referral settings saved');
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-base-200 rounded-lg" />;

  return (
    <div className="card bg-base-100 border shadow-sm mb-8">
      <div className="card-body p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          ⚙️ Referral Program Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label"><span className="label-text">Program Status</span></label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={form.enabled}
                onChange={(e) => setForm(f => ({ ...f, enabled: e.target.checked }))}
              />
              <span className="text-sm">{form.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div>
            <label className="label"><span className="label-text">Reward Type</span></label>
            <select
              className="select select-bordered w-full"
              value={form.rewardType}
              onChange={(e) => setForm(f => ({ ...f, rewardType: e.target.value as 'fixed' | 'percent' }))}
            >
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="percent">Percentage of Order</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">
                Reward Value {form.rewardType === 'fixed' ? '(₹)' : '(%)'}
              </span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="0"
              value={form.rewardValue}
              onChange={(e) => setForm(f => ({ ...f, rewardValue: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Min. Order Value for Reward (₹)</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="0"
              value={form.minOrderValue}
              onChange={(e) => setForm(f => ({ ...f, minOrderValue: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          {form.rewardType === 'percent' && (
            <div>
              <label className="label"><span className="label-text">Max Reward Cap (₹)</span></label>
              <input
                type="number"
                className="input input-bordered w-full"
                min="0"
                placeholder="0 = no cap"
                value={form.maxReward}
                onChange={(e) => setForm(f => ({ ...f, maxReward: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          )}

          <div>
            <label className="label"><span className="label-text">Max Referrals per User</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              min="0"
              placeholder="0 = unlimited"
              value={form.referralLimit}
              onChange={(e) => setForm(f => ({ ...f, referralLimit: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="loading loading-spinner loading-xs" /> : null}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReferralPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Referral Program Management</h1>
      <ReferralSettingsForm />
      <ReferralAdminTable />
    </div>
  );
}
