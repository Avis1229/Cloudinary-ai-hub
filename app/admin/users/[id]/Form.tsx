'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function UserDetailForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/users/${userId}`, fetcher);

  const user = data?.user;
  const orders = data?.orders || [];
  const reviews = data?.reviews || [];

  const [tab, setTab] = useState<'overview' | 'orders' | 'reviews' | 'addresses'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<{
    name: string; email: string; phone: string; isAdmin: boolean;
  }>();

  useEffect(() => {
    if (!user) return;
    setValue('name', user.name || '');
    setValue('email', user.email || '');
    setValue('phone', user.phone || '');
    setValue('isAdmin', user.isAdmin || false);
  }, [user, setValue]);

  const { trigger: updateUser } = useSWRMutation(
    `/api/admin/users/${userId}`,
    async (url, { arg }: { arg: any }) => {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Update failed');
      return d;
    }
  );

  const { trigger: deleteUser, isMutating: deleting } = useSWRMutation(
    `/api/admin/users/${userId}`,
    async (url) => {
      const res = await fetch(url, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Delete failed');
      return d;
    }
  );

  const onSubmit = async (form: any) => {
    try {
      await updateUser(form);
      toast.success('User updated successfully');
      setIsEditing(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Permanently delete ${user?.name}? This cannot be undone.`)) return;
    try {
      await deleteUser();
      toast.success('User deleted');
      router.push('/admin/users');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    setDeletingReview(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted');
      mutate();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingReview(null);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-error font-bold">Failed to load user</p>
      <Link href="/admin/users" className="btn btn-sm btn-ghost mt-4">← Back to Users</Link>
    </div>
  );

  if (isLoading || !user) return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-8 bg-base-200 rounded w-48" />
      <div className="h-40 bg-base-200 rounded" />
      <div className="h-64 bg-base-200 rounded" />
    </div>
  );

  const initials = user.name?.charAt(0).toUpperCase() || 'U';
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const totalSpend = orders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'orders', label: `Orders (${orders.length})`, icon: '🛍️' },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: '⭐' },
    { id: 'addresses', label: `Addresses (${user.savedAddresses?.length || 0})`, icon: '📍' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/admin/users" className="btn btn-ghost btn-sm gap-2 self-start">
          ← Back to Users
        </Link>
        <div className="flex-1" />
        {!user.isAdmin && (
          <button
            onClick={handleDeleteUser}
            disabled={deleting}
            className="btn btn-error btn-sm gap-2"
          >
            {deleting && <span className="loading loading-spinner loading-xs" />}
            🗑 Delete User
          </button>
        )}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`btn btn-sm gap-2 ${isEditing ? 'btn-ghost' : 'btn-primary'}`}
        >
          {isEditing ? '✕ Cancel Edit' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Profile Hero Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="card-body pt-0 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-base-100 shadow-lg">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-base-100 shadow-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">{initials}</span>
                </div>
              )}
              {user.isAdmin && (
                <span className="absolute -top-2 -right-2 badge badge-primary badge-sm">Admin</span>
              )}
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-2xl font-bold truncate">{user.name}</h1>
              <p className="text-sm text-base-content/60">{user.email}</p>
              {user.phone && <p className="text-sm text-base-content/60 mt-0.5">📱 {user.phone}</p>}
              <p className="text-xs text-base-content/40 mt-1">Member since {joinedDate}</p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 sm:gap-6 pb-2 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wide">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">₹{totalSpend.toLocaleString('en-IN')}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wide">Total Spend</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{reviews.length}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wide">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{user.loyaltyPoints || 0}</p>
                <p className="text-xs text-base-content/50 uppercase tracking-wide">Loyalty Pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form (inline, collapsible) */}
      {isEditing && (
        <div className="card bg-base-100 border border-primary/30 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base mb-4">✏️ Edit User Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs uppercase tracking-wide font-bold">Name</span></label>
                <input {...register('name', { required: true })} className="input input-bordered input-sm" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs uppercase tracking-wide font-bold">Email</span></label>
                <input {...register('email', { required: true })} className="input input-bordered input-sm" type="email" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs uppercase tracking-wide font-bold">Phone</span></label>
                <input {...register('phone')} className="input input-bordered input-sm" placeholder="+91 XXXXXXXXXX" />
              </div>
              <div className="form-control justify-end">
                <label className="label cursor-pointer gap-3 justify-start">
                  <input type="checkbox" {...register('isAdmin')} className="toggle toggle-primary toggle-sm" />
                  <span className="label-text font-bold">Administrator</span>
                </label>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm gap-2">
                  {isSubmitting && <span className="loading loading-spinner loading-xs" />}
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-bordered gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`tab tab-bordered gap-2 whitespace-nowrap font-medium ${tab === t.id ? 'tab-active text-primary' : 'text-base-content/50'}`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-base-content/50">Account Info</h3>
              <InfoRow label="User ID" value={<span className="font-mono text-xs bg-base-200 px-2 py-1 rounded">{String(user._id)}</span>} />
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone || <span className="text-base-content/30 italic">Not provided</span>} />
              <InfoRow label="Role" value={
                <span className={`badge badge-sm ${user.isAdmin ? 'badge-primary' : 'badge-ghost'}`}>
                  {user.isAdmin ? '🛡 Admin' : '👤 Member'}
                </span>
              } />
              <InfoRow label="Loyalty Tier" value={<span className="badge badge-outline badge-sm">{user.loyaltyTier || 'Novice'}</span>} />
              <InfoRow label="Loyalty Points" value={`${user.loyaltyPoints || 0} pts`} />
              <InfoRow label="Joined" value={joinedDate} />
              {user.referralCode && <InfoRow label="Referral Code" value={<span className="font-mono text-xs">{user.referralCode}</span>} />}
              {user.referredBy && <InfoRow label="Referred By" value={<span className="font-mono text-xs">{user.referredBy}</span>} />}
              <InfoRow label="Referral Credits" value={`₹${user.referralCredits || 0}`} />
            </div>
          </div>

          {/* Latest Order */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-base-content/50">Latest Order</h3>
              {orders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {orders[0].orderItems?.[0]?.image && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-base-200">
                        <Image src={orders[0].orderItems[0].image} alt="" width={56} height={56} className="w-full h-full object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{orders[0].orderItems?.[0]?.name}</p>
                      {orders[0].orderItems?.length > 1 && (
                        <p className="text-xs text-base-content/50">+{orders[0].orderItems.length - 1} more item(s)</p>
                      )}
                      <p className="text-xs text-base-content/50 mt-1">{new Date(orders[0].createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge badge-sm ${orders[0].isPaid ? 'badge-success' : 'badge-error'}`}>
                      {orders[0].isPaid ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                    <span className={`badge badge-sm ${orders[0].isDelivered ? 'badge-success' : 'badge-warning'}`}>
                      {orders[0].isDelivered ? '✓ Delivered' : '⧗ Pending'}
                    </span>
                    <span className="badge badge-sm badge-outline">₹{orders[0].totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <Link href={`/admin/orders/${orders[0]._id}`} className="btn btn-xs btn-ghost">View Order →</Link>
                </div>
              ) : (
                <p className="text-sm text-base-content/40 italic">No orders yet</p>
              )}
            </div>
          </div>

          {/* Personalization Tags */}
          {(user.personalization?.tags?.length > 0 || user.personalization?.segments?.length > 0) && (
            <div className="card bg-base-100 border border-base-300 shadow-sm md:col-span-2">
              <div className="card-body gap-4">
                <h3 className="font-bold text-sm uppercase tracking-wide text-base-content/50">Personalization</h3>
                {user.personalization?.segments?.length > 0 && (
                  <div>
                    <p className="text-xs text-base-content/50 mb-2">Segments</p>
                    <div className="flex flex-wrap gap-2">
                      {user.personalization.segments.map((s: string) => (
                        <span key={s} className="badge badge-primary badge-outline badge-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user.personalization?.tags?.length > 0 && (
                  <div>
                    <p className="text-xs text-base-content/50 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {user.personalization.tags.map((t: string) => (
                        <span key={t} className="badge badge-ghost badge-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-base-content/40 border-2 border-dashed border-base-300 rounded-xl">
              <p className="text-3xl mb-3">🛍️</p>
              <p className="font-medium">No orders placed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-base-300">
              <table className="table table-sm">
                <thead className="bg-base-200/60">
                  <tr>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Delivery</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order._id} className="hover">
                      <td className="font-mono text-xs">{String(order._id).slice(-8).toUpperCase()}</td>
                      <td>
                        <div className="flex -space-x-2">
                          {order.orderItems?.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-base-100 bg-base-200 flex-shrink-0">
                              {item.image && <Image src={item.image} alt={item.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />}
                            </div>
                          ))}
                          {order.orderItems?.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-base-200 border-2 border-base-100 flex items-center justify-center text-[9px] font-bold">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-base-content/50 mt-1 max-w-[120px] truncate">{order.orderItems?.[0]?.name}</p>
                      </td>
                      <td className="text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="font-bold">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge badge-xs ${order.isPaid ? 'badge-success' : 'badge-error'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-xs ${order.isDelivered ? 'badge-success' : 'badge-warning'}`}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order._id}`} className="btn btn-ghost btn-xs">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-16 text-center text-base-content/40 border-2 border-dashed border-base-300 rounded-xl">
              <p className="text-3xl mb-3">⭐</p>
              <p className="font-medium">No reviews submitted yet</p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review._id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                <div className="card-body gap-3">
                  <div className="flex items-start justify-between gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                      {review.product?.images?.[0] && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-base-200">
                          <Image src={review.product.images[0]} alt={review.product.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                        </div>
                      )}
                      <div>
                        {review.product ? (
                          <Link href={`/product/${review.product.slug}`} target="_blank" className="font-semibold text-sm hover:text-primary transition-colors">
                            {review.product.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-sm text-base-content/40 italic">Product unavailable</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-base-content/50">{review.rating}/5</span>
                          {review.isVerifiedPurchase && (
                            <span className="badge badge-xs badge-success">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge badge-xs ${review.status === 'published' ? 'badge-success' : review.status === 'pending' ? 'badge-warning' : 'badge-ghost'}`}>
                        {review.status || 'published'}
                      </span>
                      <span className="text-xs text-base-content/40">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : ''}</span>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingReview === review._id}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      >
                        {deletingReview === review._id ? <span className="loading loading-spinner loading-xs" /> : '🗑'}
                      </button>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-base-content/70 leading-relaxed">{review.quote}</p>

                  {/* Media */}
                  {(review.images?.length > 0 || review.videos?.length > 0) && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {review.images?.map((src: string, i: number) => (
                        <div
                          key={i}
                          onClick={() => setSelectedMedia(src)}
                          className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-base-300"
                        >
                          <Image src={src} alt={`Review image ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </div>
                      ))}
                      {review.videos?.map((src: string, i: number) => (
                        <div
                          key={`v-${i}`}
                          onClick={() => setSelectedMedia(src)}
                          className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-base-300 relative bg-black"
                        >
                          <video src={src} className="w-full h-full object-cover opacity-70" muted playsInline preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-2xl">▶</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Addresses */}
      {tab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!user.savedAddresses || user.savedAddresses.length === 0) ? (
            <div className="sm:col-span-2 lg:col-span-3 py-16 text-center text-base-content/40 border-2 border-dashed border-base-300 rounded-xl">
              <p className="text-3xl mb-3">📍</p>
              <p className="font-medium">No saved addresses</p>
            </div>
          ) : (
            user.savedAddresses.map((addr: any, i: number) => (
              <div key={addr._id || i} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{addr.fullName}</h4>
                    {i === 0 && <span className="badge badge-primary badge-xs">Primary</span>}
                  </div>
                  <p className="text-sm text-base-content/70">{addr.address}</p>
                  <p className="text-sm text-base-content/70">{addr.city}{addr.postalCode ? ` - ${addr.postalCode}` : ''}</p>
                  {addr.country && <p className="text-sm text-base-content/70">{addr.country}</p>}
                  {addr.phone && <p className="text-xs text-base-content/50 mt-1">📱 {addr.phone}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Media Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-6 right-6 btn btn-circle btn-ghost text-white"
            onClick={() => setSelectedMedia(null)}
          >✕</button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl max-h-[85vh] flex items-center justify-center">
            {selectedMedia.match(/\.(mp4|webm|mov)/i) ? (
              <video src={selectedMedia} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
            ) : (
              <Image src={selectedMedia} alt="Review media" width={1200} height={900} className="max-w-full max-h-[85vh] object-contain rounded-lg" unoptimized />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-2 justify-between py-1.5 border-b border-base-200/60 last:border-0">
      <span className="text-xs text-base-content/50 uppercase tracking-wide font-bold flex-shrink-0">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}
