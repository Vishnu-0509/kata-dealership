import { useState, useRef, useEffect, MouseEvent, TouchEvent, KeyboardEvent } from 'react';

interface Props {
  images?: string[] | null;
  fallbackImageUrl?: string | null;
  vehicleName: string;
}

export function Vehicle360Viewer({ images, fallbackImageUrl, vehicleName }: Props) {
  const angleList = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasAngles = angleList.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to initial index when images prop changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [images]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleReset();
    }
  };

  const handleNext = () => {
    if (!hasAngles) return;
    setCurrentIndex((prev) => (prev + 1) % angleList.length);
  };

  const handlePrev = () => {
    if (!hasAngles) return;
    setCurrentIndex((prev) => (prev - 1 + angleList.length) % angleList.length);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !hasAngles) return;
    const deltaX = e.clientX - dragStartX;
    const threshold = 18; // Drag sensitivity in px
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        // Dragging left rotates forward
        handleNext();
      } else {
        // Dragging right rotates backward
        handlePrev();
      }
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!hasAngles || e.touches.length === 0) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !hasAngles || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX;
    const threshold = 18;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setDragStartX(currentX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Fallback state when no 360 angles are provided
  if (!hasAngles) {
    return (
      <div className="relative w-full h-full min-h-[260px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center select-none">
        <img
          src={fallbackImageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
          alt={vehicleName}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Unavailable Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          <span className="text-amber-400 text-xs">⚠️</span>
          <span className="text-[11px] font-semibold text-slate-300">360° view unavailable</span>
        </div>
      </div>
    );
  }

  const currentImage = angleList[currentIndex];
  const angleDegrees = Math.round((currentIndex / angleList.length) * 360);

  return (
    <div
      ref={containerRef}
      data-testid="viewer-360-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing focus:outline-none rounded-xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6'
          : 'h-64 sm:h-80 bg-slate-950 border border-cyan-500/20 shadow-inner'
      }`}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-semibold text-cyan-300">Loading 360° frame...</span>
        </div>
      )}

      {/* Error State */}
      {hasError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="text-sm font-bold text-rose-300">Unable to load 360° image</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Failed to fetch angle photograph from source server.</p>
          <button
            type="button"
            onClick={() => { setHasError(false); setIsLoading(true); }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <img
          src={currentImage}
          alt={`${vehicleName} at ${angleDegrees}° angle`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          className={`w-full h-full object-contain object-center transition-opacity duration-150 ${
            isLoading ? 'opacity-30' : 'opacity-100'
          }`}
          draggable={false}
        />
      )}

      {/* Top Overlay Indicators */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 shadow-lg">
          <span className="text-cyan-400 text-xs">🔄</span>
          <span className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase">
            Angle {currentIndex + 1} / {angleList.length} ({angleDegrees}°)
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            aria-label="Reset angle"
            title="Reset angle to 0° (Home key)"
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 backdrop-blur-md transition-colors"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            aria-label="Toggle fullscreen"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-lg text-xs font-semibold border border-white/10 backdrop-blur-md transition-colors"
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>

      {/* Drag & Swipe Helper Banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-slate-300 pointer-events-none z-10 flex items-center gap-1.5">
        <span>↔ Drag or swipe to rotate · Arrow keys</span>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        aria-label="Previous angle"
        title="Previous angle (ArrowLeft)"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-cyan-500/30 text-white border border-white/10 hover:border-cyan-400/50 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-lg active:scale-95"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next angle"
        title="Next angle (ArrowRight)"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-cyan-500/30 text-white border border-white/10 hover:border-cyan-400/50 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-lg active:scale-95"
      >
        ›
      </button>
    </div>
  );
}
