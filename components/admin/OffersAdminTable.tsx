"use client";
import useSWR from 'swr';
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';

const DISCOUNT_TYPES = [
  { value: '', label: 'None (Display Only)' },
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'flat', label: 'Flat ₹ Off' },
  { value: 'combo', label: 'Combo Deal' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'freebie', label: 'Free Product' },
];

const OFFER_TYPES = [
  { value: 'productOffer', label: 'Product Offer' },
  { value: 'banner', label: 'Banner' },
  { value: 'flashSale', label: 'Flash Sale' },
  { value: 'popup', label: 'Popup' },
];

const emptyForm = {
  title: '',
  description: '',
  shortDescription: '',
  type: 'productOffer',
  startDate: '',
  endDate: '',
  isActive: true,
  imageUrl: '',
  priority: 1,
  discountType: '',
  discountValue: '',
  minimumOrderAmount: '',
  minimumQuantity: '1',
  maxDiscount: '',
  comboPrice: '',
  applicableProducts: [] as string[],
  applicableCategories: '',
  freeProductId: '',
  couponCode: '',
  badge: '',
};

type FormState = typeof emptyForm;

export default function OffersAdminTable() {
  const { data, error, mutate } = useSWR('/api/admin/offers');
  const { data: productsData } = useSWR('/api/admin/products?limit=100');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const products = useMemo(() => {
    const items = productsData?.products || productsData || [];
    return Array.isArray(items) ? items : [];
  }, [productsData]);

  if (error) return <div className="text-error text-sm">Failed to load offers.</div>;
  if (!data) return <div className="text-xs opacity-70 animate-pulse">Loading offers…</div>;

  const offers = data.offers || data;

  const filteredOffers = filter === 'all'
    ? offers
    : offers.filter((o: any) => o.type === filter);

  const resetForm = () => setForm({ ...emptyForm });

  const handleEdit = (offer: any) => {
    setEditing(offer._id);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      shortDescription: offer.shortDescription || '',
      type: offer.type || 'productOffer',
      startDate: offer.startDate?.slice(0, 10) || '',
      endDate: offer.endDate?.slice(0, 10) || '',
      isActive: offer.isActive ?? true,
      imageUrl: offer.imageUrl || '',
      priority: offer.priority || 1,
      discountType: offer.discountType || '',
      discountValue: offer.discountValue?.toString() || '',
      minimumOrderAmount: offer.minimumOrderAmount?.toString() || '',
      minimumQuantity: offer.minimumQuantity?.toString() || '1',
      maxDiscount: offer.maxDiscount?.toString() || '',
      comboPrice: offer.comboPrice?.toString() || '',
      applicableProducts: (offer.applicableProducts || []).map((p: any) =>
        typeof p === 'string' ? p : p._id
      ),
      applicableCategories: (offer.applicableCategories || []).join(', '),
      freeProductId: typeof offer.freeProductId === 'string'
        ? offer.freeProductId
        : offer.freeProductId?._id || '',
      couponCode: offer.couponCode || '',
      badge: offer.badge || '',
    });
    // Scroll to form
    document.getElementById('offer-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSave = async (offerId?: string) => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.startDate || !form.endDate) return toast.error('Start and end dates are required');

    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        isActive: form.isActive,
        imageUrl: form.imageUrl,
        priority: parseInt(String(form.priority)) || 1,
        badge: form.badge,
        couponCode: form.couponCode.trim() || undefined,
      };

      if (form.discountType) {
        payload.discountType = form.discountType;
        payload.discountValue = parseFloat(form.discountValue) || 0;
        payload.minimumOrderAmount = parseFloat(form.minimumOrderAmount) || 0;
        payload.minimumQuantity = parseInt(form.minimumQuantity) || 1;
        if (form.maxDiscount) payload.maxDiscount = parseFloat(form.maxDiscount);
        if (form.comboPrice) payload.comboPrice = parseFloat(form.comboPrice);
      }

      if (form.applicableProducts.length > 0) {
        payload.applicableProducts = form.applicableProducts;
      }
      if (form.applicableCategories.trim()) {
        payload.applicableCategories = form.applicableCategories.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (form.freeProductId) {
        payload.freeProductId = form.freeProductId;
      }

      const method = offerId ? 'PUT' : 'POST';
      const body = offerId ? { offerId, ...payload } : payload;

      const res = await fetch('/api/admin/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success(offerId ? 'Offer updated' : 'Offer created');
      setEditing(null);
      resetForm();
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Delete this offer and its linked coupon?')) return;
    await fetch('/api/admin/offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),
    });
    toast.success('Offer deleted');
    mutate();
  };

  const toggleProduct = (productId: string) => {
    setForm((f) => ({
      ...f,
      applicableProducts: f.applicableProducts.includes(productId)
        ? f.applicableProducts.filter((id) => id !== productId)
        : [...f.applicableProducts, productId],
    }));
  };

  // Discount type label helper
  const discountLabel = (offer: any) => {
    if (!offer.discountType) return '—';
    switch (offer.discountType) {
      case 'percentage': return `${offer.discountValue}% off`;
      case 'flat': return `₹${offer.discountValue} off`;
      case 'combo': return `${offer.minimumQuantity} for ₹${offer.comboPrice}`;
      case 'bogo': return 'Buy 1 Get 1';
      case 'freebie': return 'Free product';
      default: return offer.discountType;
    }
  };

  return (
    <div className="mt-4" id="offer-form">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          className={`btn btn-xs ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}
        >All ({offers.length})</button>
        {OFFER_TYPES.map((t) => {
          const count = offers.filter((o: any) => o.type === t.value).length;
          return (
            <button
              key={t.value}
              className={`btn btn-xs ${filter === t.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(t.value)}
            >{t.label} ({count})</button>
          );
        })}
      </div>

      {/* Offers Table */}
      <div className="overflow-x-auto rounded-lg border bg-base-100 mb-8">
        <table className="table table-xs sm:table-sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Coupon</th>
              <th>Active</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.map((offer: any) => (
              <tr key={offer._id} className="hover">
                <td className="max-w-[200px]">
                  <div className="font-medium truncate" title={offer.title}>{offer.title}</div>
                  {offer.badge && (
                    <span className="badge badge-xs badge-warning mt-1">{offer.badge}</span>
                  )}
                </td>
                <td>
                  <span className={`badge badge-sm ${
                    offer.type === 'productOffer' ? 'badge-primary' :
                    offer.type === 'banner' ? 'badge-warning' :
                    offer.type === 'flashSale' ? 'badge-error' : 'badge-info'
                  }`}>{offer.type}</span>
                </td>
                <td className="text-xs whitespace-nowrap">{discountLabel(offer)}</td>
                <td className="text-xs font-mono">{offer.couponCode || '—'}</td>
                <td>
                  <span className={`badge badge-sm ${offer.isActive ? 'badge-success' : 'badge-ghost'}`}>
                    {offer.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="text-xs whitespace-nowrap">
                  {offer.startDate?.slice(5, 10)} → {offer.endDate?.slice(5, 10)}
                </td>
                <td className="flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(offer)}>Edit</button>
                  <button className="btn btn-error btn-xs" onClick={() => handleDelete(offer._id)}>Del</button>
                </td>
              </tr>
            ))}
            {filteredOffers.length === 0 && (
              <tr><td colSpan={7} className="text-center text-xs opacity-60 py-6">No offers</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Form */}
      <div className="card bg-base-100 shadow-sm border">
        <div className="card-body p-5 space-y-5">
          <h3 className="font-semibold text-base">{editing ? '✏️ Edit Offer' : '➕ Create New Offer'}</h3>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(editing || undefined); }}
            className="space-y-5"
          >
            {/* Row 1: Title, Type, Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label"><span className="label-text">Title *</span></label>
                <input
                  className="input input-bordered w-full"
                  placeholder="e.g., 15% Off Face Wash"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Offer Type *</span></label>
                <select
                  className="select select-bordered w-full"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {OFFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text">Priority (1-10)</span></label>
                <input
                  className="input input-bordered w-full"
                  type="number" min="1" max="10"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Row 2: Discount Config */}
            <div className="bg-base-200/50 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                💰 Discount Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label"><span className="label-text">Discount Type</span></label>
                  <select
                    className="select select-bordered w-full"
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                  >
                    {DISCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {(form.discountType === 'percentage' || form.discountType === 'flat') && (
                  <div>
                    <label className="label">
                      <span className="label-text">
                        {form.discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                      </span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      type="number" min="0"
                      max={form.discountType === 'percentage' ? '100' : undefined}
                      placeholder={form.discountType === 'percentage' ? 'e.g., 15' : 'e.g., 100'}
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    />
                  </div>
                )}

                {form.discountType === 'percentage' && (
                  <div>
                    <label className="label"><span className="label-text">Max Discount Cap (₹)</span></label>
                    <input
                      className="input input-bordered w-full"
                      type="number" min="0"
                      placeholder="e.g., 200"
                      value={form.maxDiscount}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    />
                  </div>
                )}

                {form.discountType === 'combo' && (
                  <>
                    <div>
                      <label className="label"><span className="label-text">Min. Quantity</span></label>
                      <input
                        className="input input-bordered w-full"
                        type="number" min="2"
                        placeholder="e.g., 2"
                        value={form.minimumQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label"><span className="label-text">Combo Price (₹)</span></label>
                      <input
                        className="input input-bordered w-full"
                        type="number" min="0"
                        placeholder="e.g., 699"
                        value={form.comboPrice}
                        onChange={(e) => setForm((f) => ({ ...f, comboPrice: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {(form.discountType === 'bogo' || form.discountType === 'freebie') && (
                  <div>
                    <label className="label"><span className="label-text">Free Product</span></label>
                    <select
                      className="select select-bordered w-full"
                      value={form.freeProductId}
                      onChange={(e) => setForm((f) => ({ ...f, freeProductId: e.target.value }))}
                    >
                      <option value="">Select product…</option>
                      {products.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {form.discountType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label"><span className="label-text">Min. Order Amount (₹)</span></label>
                    <input
                      className="input input-bordered w-full"
                      type="number" min="0"
                      placeholder="0"
                      value={form.minimumOrderAmount}
                      onChange={(e) => setForm((f) => ({ ...f, minimumOrderAmount: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Row 3: Coupon & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label"><span className="label-text">Coupon Code</span></label>
                <input
                  className="input input-bordered w-full font-mono uppercase"
                  placeholder="e.g., GLOW15"
                  value={form.couponCode}
                  onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                />
                <label className="label"><span className="label-text-alt opacity-60">Auto-creates a matching coupon</span></label>
              </div>
              <div>
                <label className="label"><span className="label-text">Badge Label</span></label>
                <input
                  className="input input-bordered w-full"
                  placeholder="e.g., FRESH, BUNDLE"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Short Description</span></label>
                <input
                  className="input input-bordered w-full"
                  placeholder="One-liner for offer card"
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 4: Product Targeting */}
            <div className="bg-base-200/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold">🎯 Product Targeting</h4>
              <div className="flex flex-wrap gap-2">
                {products.map((p: any) => (
                  <label key={p._id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={form.applicableProducts.includes(p._id)}
                      onChange={() => toggleProduct(p._id)}
                    />
                    <span className="text-xs">{p.name}</span>
                  </label>
                ))}
                {products.length === 0 && <span className="text-xs opacity-60">Loading products…</span>}
              </div>
              <div>
                <label className="label"><span className="label-text text-xs">Categories (comma-separated)</span></label>
                <input
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., skincare, bodycare"
                  value={form.applicableCategories}
                  onChange={(e) => setForm((f) => ({ ...f, applicableCategories: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 5: Dates & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text">Start Date *</span></label>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label"><span className="label-text">End Date *</span></label>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label"><span className="label-text">Description</span></label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Full description of the offer"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Row 6: Active + Submit */}
            <div className="flex items-center gap-6 pt-2">
              <label className="label cursor-pointer gap-2">
                <span className="label-text">Active</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
              </label>

              <div className="flex gap-2 ml-auto">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-xs" /> : null}
                  {editing ? 'Update Offer' : 'Create Offer'}
                </button>
                {editing && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => { setEditing(null); resetForm(); }}
                  >Cancel</button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
