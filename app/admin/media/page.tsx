'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  ImageIcon, 
  Film, 
  RefreshCw, 
  Check, 
  Folder,
  Layers,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaItem {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: 'image' | 'video';
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder?: string;
  secure_url: string;
  filename: string;
  tags?: string[];
  context?: Record<string, string>;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all');
  const [nextCursor, setNextCursor] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = useCallback(async (searchQuery = '', cursor = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media/search?q=${encodeURIComponent(searchQuery)}&next_cursor=${encodeURIComponent(cursor)}`
      );
      const data = await res.json();
      if (data.resources) {
        if (cursor) {
          setMedia(prev => [...prev, ...data.resources]);
        } else {
          setMedia(data.resources);
        }
        setNextCursor(data.next_cursor || '');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(query);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Media URL copied to clipboard!', { id: 'media-copy' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(item => {
    if (activeFilter === 'all') return true;
    return item.resource_type === activeFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#556B4E]/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4A1E30]/10 text-[#4A1E30]">
              <Sparkles className="w-3.5 h-3.5 text-[#556B4E]" />
              Cloudinary AI Hub
            </span>
            <span className="text-xs text-gray-400 font-mono">BeautyP Archive</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-[#4A1E30] tracking-tight">
            AI Media Library
          </h1>
          <p className="text-sm text-[#556B4E] mt-1 font-body">
            Browse, search and utilize media assets processed through the AI auto-tagging and transformation pipeline.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-[#556B4E]/20 shadow-sm text-center">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loaded</div>
            <div className="text-xl font-bold font-headline text-[#4A1E30]">{media.length}</div>
          </div>
          <button
            onClick={() => fetchMedia(query)}
            disabled={loading}
            className="p-3 rounded-xl bg-white/80 hover:bg-white text-[#556B4E] border border-[#556B4E]/20 transition-all hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50"
            title="Refresh assets"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl border border-[#556B4E]/20 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by AI tag (e.g. serum, bottle, floral) or filename..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A1E30]/20 focus:border-[#4A1E30] transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#4A1E30] text-white text-xs font-semibold hover:bg-[#381624] transition-all shadow-sm disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#4A1E30] text-white shadow-sm'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            All Media ({media.length})
          </button>
          <button
            onClick={() => setActiveFilter('image')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'image'
                ? 'bg-[#4A1E30] text-white shadow-sm'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Images
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'video'
                ? 'bg-[#4A1E30] text-white shadow-sm'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Videos
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading && media.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-3 border-[#556B4E]/20 border-t-[#4A1E30] rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Querying Cloudinary Search API...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-[#556B4E]/30 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#556B4E]/10 flex items-center justify-center text-[#556B4E]">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-headline font-bold text-gray-800">No media assets found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {query ? `No items matched your search query "${query}". Try searching for another tag or clear the filter.` : 'Upload images via products or the pipeline to see them indexed here.'}
          </p>
          {query && (
            <button
              onClick={() => { setQuery(''); fetchMedia(''); }}
              className="px-4 py-2 rounded-xl bg-[#556B4E] text-white text-xs font-semibold hover:bg-[#43553e] transition-all"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => {
            const isCopied = copiedId === item.asset_id;
            return (
              <div 
                key={item.asset_id}
                className="group relative bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-xl hover:border-[#556B4E]/40 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  {item.resource_type === 'image' ? (
                    <Image
                      src={item.secure_url}
                      alt={item.filename || 'Product Media'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <video
                      src={item.secure_url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  )}

                  {/* Top Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      {item.resource_type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                      {item.format}
                    </span>
                    <span className="text-[10px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {item.width && item.height ? `${item.width}×${item.height}` : formatFileSize(item.bytes)}
                    </span>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-[#4A1E30]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => copyToClipboard(item.secure_url, item.asset_id)}
                      className="p-3 rounded-full bg-white text-gray-800 hover:scale-110 active:scale-95 transition-all shadow-lg"
                      title="Copy Secure URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={item.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white text-gray-800 hover:scale-110 active:scale-95 transition-all shadow-lg"
                      title="Open full resolution"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 
                      className="text-xs font-semibold text-gray-900 truncate" 
                      title={item.filename || item.public_id}
                    >
                      {item.filename || item.public_id.split('/').pop()}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatFileSize(item.bytes)} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {item.tags && item.tags.length > 0 ? (
                        <>
                          {item.tags.slice(0, 3).map((tag, i) => (
                            <button
                              key={i}
                              onClick={() => { setQuery(tag); fetchMedia(tag); }}
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#556B4E]/10 text-[#556B4E] hover:bg-[#556B4E]/20 transition-colors"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </button>
                          ))}
                          {item.tags.length > 3 && (
                            <span 
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500" 
                              title={item.tags.slice(3).join(', ')}
                            >
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More */}
      {nextCursor && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => fetchMedia(query, nextCursor)}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-white border border-[#556B4E]/30 text-[#4A1E30] font-headline font-semibold text-sm hover:bg-[#4A1E30] hover:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#4A1E30]/20 border-t-[#4A1E30] rounded-full animate-spin"></div>
                Loading More...
              </>
            ) : (
              'Load More Media Assets'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
