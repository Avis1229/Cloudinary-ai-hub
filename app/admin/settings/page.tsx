'use client';

import useSWR from 'swr';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminSettingsPage() {
  const { data, isLoading, mutate } = useSWR('/api/admin/settings', fetcher);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supportPhone: '',
    whatsappNumber: '',
    supportEmail: '',
    shopAddress: '',
    shippingPrice: 200,
    freeShippingThreshold: 2000,
    taxRate: 18,
  });

  useEffect(() => {
    if (data) {
      setForm({
        supportPhone: data.supportPhone || '',
        whatsappNumber: data.whatsappNumber || '',
        supportEmail: data.supportEmail || '',
        shopAddress: data.shopAddress || '',
        shippingPrice: data.shippingPrice ?? 200,
        freeShippingThreshold: data.freeShippingThreshold ?? 2000,
        taxRate: data.taxRate ?? 18,
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved successfully');
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-base-200 rounded animate-pulse" />
        <div className="h-64 bg-base-200 rounded animate-pulse" />
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-sm opacity-70 mt-1">
          Manage contact details displayed across the website including the floating widget, footer, contact page, and email templates.
        </p>
      </div>

      {/* Current Live Values */}
      <div className="card bg-base-100 border border-info/20 shadow-sm">
        <div className="card-body p-5 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">🔴 Currently Live on Website</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Phone Number</p>
              <p className="text-sm font-semibold break-all">{data?.supportPhone || '—'}</p>
              <p className="text-[10px] opacity-40 mt-1">Floating widget, footer, contact page</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">WhatsApp</p>
              <p className="text-sm font-semibold break-all">{data?.whatsappNumber || data?.supportPhone || '—'}</p>
              <p className="text-[10px] opacity-40 mt-1">Floating widget, footer, FAQ curator button</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Email</p>
              <p className="text-sm font-semibold break-all">{data?.supportEmail || '—'}</p>
              <p className="text-[10px] opacity-40 mt-1">Footer, contact page, email templates</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Address</p>
              <p className="text-sm font-semibold line-clamp-2">{data?.shopAddress || '—'}</p>
              <p className="text-[10px] opacity-40 mt-1">Footer, contact page</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Shipping Cost</p>
              <p className="text-sm font-semibold">₹{data?.shippingPrice ?? 200}</p>
              <p className="text-[10px] opacity-40 mt-1">Applied when order below free threshold</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Free Shipping Above</p>
              <p className="text-sm font-semibold">₹{data?.freeShippingThreshold ?? 2000}</p>
              <p className="text-[10px] opacity-40 mt-1">Orders above this get free shipping</p>
            </div>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Tax Rate</p>
              <p className="text-sm font-semibold">{data?.taxRate ?? 18}%</p>
              <p className="text-[10px] opacity-40 mt-1">Applied on items price</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border shadow-sm">
        <div className="card-body p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">📞 Contact Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">Support Phone Number</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="+91-9876543210"
                value={form.supportPhone}
                onChange={(e) => setForm((f) => ({ ...f, supportPhone: e.target.value }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Used for phone call links and display throughout the site
                </span>
              </label>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">WhatsApp Number</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="+919876543210 (leave empty to use phone number)"
                value={form.whatsappNumber}
                onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Used for the WhatsApp floating widget and wa.me links. Leave empty to default to the phone number above.
                </span>
              </label>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Support Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="support@aethravia.com"
                value={form.supportEmail}
                onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Displayed in footer, contact page, and email templates
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Shop Address</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Full shop/office address"
                value={form.shopAddress}
                onChange={(e) => setForm((f) => ({ ...f, shopAddress: e.target.value }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Displayed in footer and contact page
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Logistics */}
      <div className="card bg-base-100 border shadow-sm">
        <div className="card-body p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">💰 Pricing & Logistics</h2>
          <p className="text-sm opacity-60 -mt-3">
            Control shipping costs, free shipping threshold, and tax rate. Changes will apply to all new orders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-medium">Shipping Price (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="input input-bordered w-full"
                placeholder="200"
                value={form.shippingPrice}
                onChange={(e) => setForm((f) => ({ ...f, shippingPrice: Number(e.target.value) }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Flat shipping fee charged when order is below the free shipping threshold
                </span>
              </label>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Free Shipping Above (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="input input-bordered w-full"
                placeholder="2000"
                value={form.freeShippingThreshold}
                onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: Number(e.target.value) }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Orders above this amount get free shipping. Set to 0 to always charge shipping.
                </span>
              </label>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Tax Rate (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="input input-bordered w-full"
                placeholder="18"
                value={form.taxRate}
                onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
              />
              <label className="label">
                <span className="label-text-alt opacity-60">
                  Tax percentage applied on items price (e.g. 18 for GST 18%)
                </span>
              </label>
            </div>
          </div>

          <div className="alert alert-info py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs">Changes to pricing will apply to all new orders. Existing orders will not be affected.</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-xs" /> : null}
          Save All Settings
        </button>
      </div>
    </div>
  );
}
