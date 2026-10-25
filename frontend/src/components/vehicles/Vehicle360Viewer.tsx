import { useState, useRef, useEffect, useMemo, MouseEvent, TouchEvent, PointerEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  images?: string[] | null;
  fallbackImageUrl?: string | null;
  vehicleName: string;
}

export function Vehicle360Viewer({ images, fallbackImageUrl, vehicleName }: Props) {
  const angleList = useMemo(() => {
    return Array.isArray(images) ? images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0) : [];
  }, [images]);

  // A genuine 360° interactive view requires at least 2 distinct angle photographs to rotate
  const hasAngles = angleList.length >= 2;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [preloadedSet, setPreloadedSet] = useState<Record<number, boolean>>({});

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenBtnRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Track serialized sequence and vehicle name so unrelated parent rerenders preserve current angle
  const imagesKey = angleList.join('|');
  const prevKeyRef = useRef(imagesKey);
  const prevVehicleRef = useRef(vehicleName);

  useEffect(() => {
    if (prevKeyRef.current !== imagesKey || prevVehicleRef.current !== vehicleName) {
      prevKeyRef.current = imagesKey;
      prevVehicleRef.current = vehicleName;
      setCurrentIndex(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [imagesKey, vehicleName]);

  // Preload angle images into memory for instant frame transitions without latency
  useEffect(() => {
    if (!hasAngles) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    angleList.forEach((url, idx) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (!isMounted) return;
        setPreloadedSet((prev) => ({ ...prev, [idx]: true }));
        if (idx === currentIndex) {
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        if (!isMounted) return;
        if (idx === currentIndex) {
          setIsLoading(false);
          setHasError(true);
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [angleList, hasAngles]);

  // Check cached image completion on index change
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [currentIndex]);

  // Handle ESC key to exit fullscreen and restore focus
  useEffect(() => {
    if (!isFullscreen) return;

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsFullscreen(false);
        fullscreenBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFullscreen]);

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
    const nextIdx = (currentIndex + 1) % angleList.length;
    setHasError(false);
    if (!preloadedSet[nextIdx]) {
      setIsLoading(true);
    }
    setCurrentIndex(nextIdx);
  };

  const handlePrev = () => {
    if (!hasAngles) return;
    const prevIdx = (currentIndex - 1 + angleList.length) % angleList.length;
    setHasError(false);
    if (!preloadedSet[prevIdx]) {
      setIsLoading(true);
    }
    setCurrentIndex(prevIdx);
  };

  const handleReset = () => {
    setHasError(false);
    setIsLoading(true);
    setCurrentIndex(0);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      imgRef.current.src = currentSrc;
    }
  };

  // Pointer drag handlers (smooth, unified pointer capture across mouse and touch)
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !hasAngles) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const threshold = 15; // Smooth rotation sensitivity
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      dragStartXRef.current = e.clientX;
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Mouse drag fallback handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !hasAngles) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const threshold = 15;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      dragStartXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch swipe handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!hasAngles) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !hasAngles) return;
    const deltaX = e.touches[0].clientX - dragStartXRef.current;
    const threshold = 15;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      dragStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (!next) {
        setTimeout(() => fullscreenBtnRef.current?.focus(), 50);
      }
      return next;
    });
  };

  // Fallback state when no or insufficient 360 angles are provided (< 2 images)
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
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          <span className="text-amber-400 text-xs">⚠️</span>
          <span className="text-[11px] font-semibold text-slate-200">360° view unavailable</span>
        </div>
      </div>
    );
  }

  const currentImage = angleList[currentIndex];
  const angleDegrees = Math.round((currentIndex / angleList.length) * 360);

  // Render viewer content
  const renderViewerCore = (inFullscreen = false) => (
    <div
      ref={containerRef}
      data-testid="viewer-360-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing focus:outline-none transition-all ${
        inFullscreen
          ? 'w-full h-full max-w-6xl max-h-[90vh] bg-slate-950 rounded-2xl border border-teal-500/30 flex items-center justify-center'
          : 'h-64 sm:h-80 bg-slate-950 rounded-xl border border-teal-500/20 shadow-inner'
      }`}
    >
      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-semibold text-teal-300">Loading 360° frame...</span>
        </div>
      )}

      {/* Error State with working retry */}
      {hasError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="text-sm font-bold text-rose-300">Unable to load 360° image</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Failed to fetch angle photograph. Navigate or retry.</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRetry();
            }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentImage}
          alt={`${vehicleName} at ${angleDegrees}° angle`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-contain object-center transition-opacity duration-150 ${
            isLoading ? 'opacity-30' : 'opacity-100'
          }`}
          draggable={false}
        />
      )}

      {/* Top Overlay Controls (spaced with right-14 to never overlap modal close button) */}
      <div className={`absolute top-3 left-3 ${inFullscreen ? 'right-3' : 'right-14'} flex items-center justify-between pointer-events-none z-30`}>
        <div className="bg-slate-900/85 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 shadow-lg">
          <span className="text-teal-400 text-xs">🔄</span>
          <span className="text-[11px] font-bold text-teal-300 tracking-wider uppercase">
            Angle {currentIndex + 1} / {angleList.length} ({angleDegrees}°)
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            aria-label="Reset angle"
            title="Reset angle to 0° (Home key)"
            className="bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/15 backdrop-blur-md transition-colors"
          >
            ↺ Reset
          </button>
          <button
            ref={fullscreenBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            aria-label={inFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'}
            title={inFullscreen ? 'Exit Fullscreen (Esc)' : 'View Fullscreen'}
            className="bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white p-1.5 rounded-lg text-xs font-semibold border border-white/15 backdrop-blur-md transition-colors"
          >
            {inFullscreen ? '✕ Exit' : '⤢'}
          </button>
        </div>
      </div>

      {/* Drag & Swipe Helper Banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-slate-300 pointer-events-none z-30 flex items-center gap-1.5 shadow-md">
        <span>↔ Drag or swipe to rotate · Arrow keys</span>
      </div>

      {/* Navigation Arrows with z-30 to remain above loading/error overlays */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label="Previous angle"
        title="Previous angle (ArrowLeft)"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/85 hover:bg-teal-600 text-white border border-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-lg active:scale-95"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next angle"
        title="Next angle (ArrowRight)"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/85 hover:bg-teal-600 text-white border border-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-lg active:scale-95"
      >
        ›
      </button>
    </div>
  );

  return (
    <>
      {renderViewerCore(false)}

      {/* Fullscreen Portal rendered at document.body level to avoid modal clipping & transform traps */}
      {isFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
            onClick={toggleFullscreen}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full h-full max-w-5xl flex items-center justify-center">
              {renderViewerCore(true)}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
