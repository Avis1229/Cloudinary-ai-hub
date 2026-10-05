'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    document.body.style.overflow = '';
  };

  const goTo = (idx: number) => {
    setLightboxIndex(idx);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const goPrev = () => goTo((lightboxIndex - 1 + images.length) % images.length);
  const goNext = () => goTo((lightboxIndex + 1) % images.length);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(z => {
      const newZ = Math.max(z - 0.5, 1);
      if (newZ === 1) setPan({ x: 0, y: 0 });
      return newZ;
    });
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom(z => {
      const newZ = Math.max(1, Math.min(z + delta, 4));
      if (newZ === 1) setPan({ x: 0, y: 0 });
      return newZ;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  return (
    <>
      <div className="lg:col-span-5 flex flex-col md:flex-row gap-4 relative">
        {/* Thumbnail Column */}
        <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onMouseEnter={() => setActiveImage(img)}
              onClick={() => setActiveImage(img)}
              className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 bg-surface-container rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === img ? 'ring-2 ring-primary opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              <Image 
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                width={80}
                height={96}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>

        {/* Main Hero Image */}
        <div className="order-1 md:order-2 flex-grow relative">
          <div
            className="rounded-lg overflow-hidden bg-surface-container-low aspect-[3/4] relative max-w-full cursor-zoom-in group"
            onClick={() => openLightbox(images.indexOf(activeImage))}
          >
            <Image 
              src={activeImage}
              alt="Product View"
              fill
              className="w-full h-full object-contain transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn size={18} />
            </div>
          </div>
          {/* Offset Caption (Editorial Rule) */}
          <div className="absolute -bottom-4 -right-4 md:-right-8 bg-surface-container-lowest p-6 max-w-[240px] shadow-2xl rounded-lg z-10 border border-outline-variant/10">
            <p className="font-headline italic text-primary text-sm leading-tight">
               The art of pure earth and elemental curation.
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
            <span className="text-white/60 text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white/50 text-xs font-mono min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors ml-2"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Main lightbox image */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in', touchAction: 'none' }}
          >
            <div
              className="relative w-full max-w-4xl aspect-[3/4] transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              }}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`Product image ${lightboxIndex + 1}`}
                fill
                className="object-contain select-none pointer-events-none"
                sizes="100vw"
                quality={95}
                draggable={false}
              />
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-xl">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); goTo(idx); }}
                  className={`w-12 h-14 rounded-lg overflow-hidden transition-all duration-200 ${idx === lightboxIndex ? 'ring-2 ring-white opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
                >
                  <Image src={img} alt="" width={48} height={56} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
