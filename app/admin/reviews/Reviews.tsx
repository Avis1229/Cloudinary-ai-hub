'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ReviewUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
};

type ReviewProduct = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

type Review = {
  _id: string;
  name: string;
  quote: string;
  rating?: number;
  role?: string;
  city?: string;
  published?: boolean;
  order?: number;
  images?: string[];
  videos?: string[];
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string | null;
  productId?: string | null;
  user?: ReviewUser | null;
  product?: ReviewProduct | null;
};

type ProductOption = {
  _id: string;
  name: string;
  slug: string;
};

type SortKey = 'name' | 'rating' | 'published' | 'createdAt';
type ViewMode = 'table' | 'cards';

function useAdminEvents(eventTypes: string[], onAny: () => void) {
  useEffect(() => {
    const es = new EventSource('/api/admin/realtime');
    const handler = (e: MessageEvent) => {
      try {
        const evt = JSON.parse(e.data);
        if (evt && eventTypes.includes(evt.type)) onAny();
      } catch {}
    };
    (es as any).addEventListener('admin', handler);
    return () => {
      (es as any).removeEventListener('admin', handler);
      es.close();
    };
  }, [eventTypes, onAny]);
}

export default function Reviews() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const apiUrl = selectedProduct
    ? `/api/admin/reviews?productId=${selectedProduct}`
    : '/api/admin/reviews';
  const { data, error, mutate, isLoading } = useSWR<{
    reviews: Review[];
    products: ProductOption[];
  }>(apiUrl);

  const router = useRouter();
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'
  );
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 250);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const stableMutate = useCallback(() => mutate(), [mutate]);
  useAdminEvents(['review.updated', 'review.deleted', 'testimonial.updated', 'testimonial.created', 'testimonial.deleted'], stableMutate);

  const { trigger: deleteReview } = useSWRMutation(
    apiUrl,
    async (_url, { arg }: { arg: { id: string } }) => {
      const toastId = toast.loading('Deleting review...');
      const res = await fetch(`/api/admin/reviews/${arg.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.message || 'Failed to delete', { id: toastId });
      } else {
        toast.success('Review deleted', { id: toastId });
        mutate();
      }
    }
  );

  const reviews = data?.reviews || [];
  const products = data?.products || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews
      .filter((r) => {
        if (q) {
          const hit =
            r.name.toLowerCase().includes(q) ||
            r.quote.toLowerCase().includes(q) ||
            (r.user?.name?.toLowerCase() || '').includes(q) ||
            (r.user?.email?.toLowerCase() || '').includes(q) ||
            (r.product?.name?.toLowerCase() || '').includes(q);
          if (!hit) return false;
        }
        if (publishedFilter !== 'all' && (publishedFilter === 'published' ? !r.published : r.published))
          return false;
        if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        let av: any, bv: any;
        if (sortKey === 'createdAt') {
          av = new Date(a.createdAt || 0).getTime();
          bv = new Date(b.createdAt || 0).getTime();
        } else if (sortKey === 'rating') {
          av = a.rating || 0;
          bv = b.rating || 0;
        } else if (sortKey === 'published') {
          av = a.published ? 1 : 0;
          bv = b.published ? 1 : 0;
        } else {
          av = (a[sortKey] || '').toLowerCase();
          bv = (b[sortKey] || '').toLowerCase();
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reviews, search, publishedFilter, ratingFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const published = reviews.filter((r) => r.published).length;
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = reviews.length ? +(totalRating / reviews.length).toFixed(1) : 0;
    const withMedia = reviews.filter(
      (r) => (r.images && r.images.length > 0) || (r.videos && r.videos.length > 0)
    ).length;
    return { total: reviews.length, published, avgRating, withMedia };
  }, [reviews]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir(['name'].includes(k) ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

  if (error) return <div className="text-error">Failed to load reviews.</div>;
  if (isLoading || !data)
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-40 bg-base-200 rounded" />
        <div className="h-48 bg-base-200 rounded" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Reviews</h1>
          <p className="text-sm opacity-70">Manage reviews for all products. Edit, moderate, and view customer details.</p>
        </div>
        <Link href="/admin/reviews/new" className="btn btn-primary btn-sm gap-2 mt-2 sm:mt-0">
          <span className="material-symbols-outlined text-sm">add</span> Add Review
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
          <div className="stat-desc">reviews</div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Published</div>
          <div className="stat-value text-2xl text-success">{stats.published}</div>
          <div className="stat-desc">
            {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% visible
          </div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">Avg Rating</div>
          <div className="stat-value text-2xl text-warning">{stats.avgRating}</div>
          <div className="stat-desc">out of 5 stars</div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-lg shadow-sm p-4">
          <div className="stat-title text-xs">With Media</div>
          <div className="stat-value text-2xl text-info">{stats.withMedia}</div>
          <div className="stat-desc">photos/videos</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end flex-wrap">
            {/* Product filter */}
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="select select-sm select-bordered w-60"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Search</label>
              <input
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                placeholder="Name, quote, user, product..."
                className="input input-sm input-bordered w-72"
              />
            </div>

            {/* Status filter */}
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Status</label>
              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className="select select-sm select-bordered w-32"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>

            {/* Rating filter */}
            <div>
              <label className="label p-0 mb-1 text-xs uppercase">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="select select-sm select-bordered w-24"
              >
                <option value="all">All</option>
                <option value="5">5★</option>
                <option value="4">4★</option>
                <option value="3">3★</option>
                <option value="2">2★</option>
                <option value="1">1★</option>
              </select>
            </div>

            <div className="flex gap-2 flex-wrap items-end">
              <div className="join">
                <button
                  onClick={() => setView('table')}
                  className={`btn btn-xs join-item ${view === 'table' ? 'btn-primary' : ''}`}
                >
                  Table
                </button>
                <button
                  onClick={() => setView('cards')}
                  className={`btn btn-xs join-item ${view === 'cards' ? 'btn-primary' : ''}`}
                >
                  Cards
                </button>
              </div>
              <button className="btn btn-xs" onClick={() => mutate()}>
                Refresh
              </button>
            </div>

            <div className="text-xs opacity-70 lg:ml-auto">
              <strong>{filtered.length}</strong> of <strong>{stats.total}</strong> reviews
            </div>
          </div>
        </div>
      </div>

      {/* Empty */}
      {!filtered.length && (
        <div className="p-10 border border-dashed border-base-300 rounded text-center text-sm">
          No matching reviews.
        </div>
      )}

      {/* Table view */}
      {filtered.length > 0 && view === 'table' && (
        <div className="overflow-x-auto border border-base-300 rounded">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/70">
                <th className="cursor-pointer" onClick={() => toggleSort('name')}>
                  Reviewer
                  <SortIcon k="name" />
                </th>
                <th>Product</th>
                <th className="max-w-xs">Review</th>
                <th>Media</th>
                <th className="cursor-pointer text-center" onClick={() => toggleSort('rating')}>
                  Rating
                  <SortIcon k="rating" />
                </th>
                <th className="cursor-pointer text-center" onClick={() => toggleSort('published')}>
                  Status
                  <SortIcon k="published" />
                </th>
                <th className="cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  Date
                  <SortIcon k="createdAt" />
                </th>
                <th className="w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="hover:bg-base-50">
                  {/* Reviewer */}
                  <td>
                    <div className="flex items-center gap-2">
                      {r.user?.avatar ? (
                        <img
                          src={r.user.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {r.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{r.name}</div>
                        {r.user && (
                          <div className="text-[11px] opacity-60">{r.user.email}</div>
                        )}
                        {r.isVerifiedPurchase && (
                          <span className="badge badge-xs badge-success">Verified</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td>
                    {r.product ? (
                      <div className="flex items-center gap-2">
                        {r.product.image && (
                          <img
                            src={r.product.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-xs font-medium max-w-[120px] truncate block">
                          {r.product.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs opacity-40">General</span>
                    )}
                  </td>

                  {/* Quote */}
                  <td className="max-w-xs">
                    <div className="truncate text-sm" title={r.quote}>
                      &ldquo;{r.quote}&rdquo;
                    </div>
                  </td>

                  {/* Media */}
                  <td>
                    <div className="flex items-center gap-1">
                      {r.images && r.images.length > 0 && (
                        <div className="flex -space-x-1">
                          {r.images.slice(0, 3).map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="w-7 h-7 rounded border-2 border-base-100 object-cover"
                            />
                          ))}
                          {r.images.length > 3 && (
                            <span className="w-7 h-7 rounded bg-base-200 border-2 border-base-100 flex items-center justify-center text-[10px] font-bold">
                              +{r.images.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {r.videos && r.videos.length > 0 && (
                        <span className="badge badge-xs badge-info gap-1">
                          <span className="material-symbols-outlined text-[10px]">videocam</span>
                          {r.videos.length}
                        </span>
                      )}
                      {(!r.images || r.images.length === 0) &&
                        (!r.videos || r.videos.length === 0) && (
                          <span className="text-xs opacity-30">—</span>
                        )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="text-center">
                    {r.rating ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-warning">★</span>
                        <span className="text-sm">{r.rating}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Status */}
                  <td className="text-center">
                    <div
                      className={`badge badge-sm ${r.published ? 'badge-success' : 'badge-ghost'}`}
                    >
                      {r.published ? 'Published' : 'Draft'}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="text-xs opacity-70">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '-'}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <Link
                        href={`/admin/reviews/${r._id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </Link>
                      {r.userId && (
                        <Link
                          href={`/admin/users/${r.userId}`}
                          className="btn btn-ghost btn-xs text-info"
                          title="View user profile"
                        >
                          User
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this review?')) deleteReview({ id: r._id });
                        }}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {filtered.length > 0 && view === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="card-body p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {r.user?.avatar ? (
                      <img
                        src={r.user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {r.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{r.name}</div>
                      {r.user && (
                        <div className="text-[11px] opacity-60">{r.user.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                      ⋮
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-50"
                    >
                      <li>
                        <Link href={`/admin/reviews/${r._id}`}>Edit Review</Link>
                      </li>
                      {r.userId && (
                        <li>
                          <Link href={`/admin/users/${r.userId}`}>View User</Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => {
                            if (confirm('Delete?')) deleteReview({ id: r._id });
                          }}
                          className="text-error"
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Product badge */}
                {r.product && (
                  <div className="flex items-center gap-2">
                    {r.product.image && (
                      <img
                        src={r.product.image}
                        alt=""
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span className="text-xs font-medium opacity-70 truncate">
                      {r.product.name}
                    </span>
                  </div>
                )}

                {/* Quote */}
                <div className="text-sm italic line-clamp-3">&ldquo;{r.quote}&rdquo;</div>

                {/* Media */}
                {((r.images && r.images.length > 0) || (r.videos && r.videos.length > 0)) && (
                  <div className="flex gap-2 flex-wrap">
                    {r.images?.slice(0, 3).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-base-300"
                      />
                    ))}
                    {r.videos?.slice(0, 2).map((src, i) => (
                      <div
                        key={`v-${i}`}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-base-300 bg-black relative"
                      >
                        <video
                          src={src}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm drop-shadow">
                            play_circle
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-base-200">
                  <div className="flex items-center gap-2">
                    {r.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-warning text-sm">★</span>
                        <span className="text-sm">{r.rating}</span>
                      </div>
                    )}
                    <div
                      className={`badge badge-xs ${r.published ? 'badge-success' : 'badge-ghost'}`}
                    >
                      {r.published ? 'Published' : 'Draft'}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="badge badge-xs badge-accent">Verified</span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-50">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
