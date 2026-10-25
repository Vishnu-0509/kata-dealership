import { useState, useRef, useEffect } from 'react';

interface Props {
  className?: string;
}

const VIDEO_FEEDS = [
  {
    id: 'supercar-road',
    title: 'Alpine Supercar Run',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-road-4258-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'city-night',
    title: 'Metropolis Night Cruise',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-4228-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80',
  },
];

const PHOTO_ROTATION = [
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&q=80',
];

export function CarLiveBackground({ className = '' }: Props) {
  // Modes: 'video' | 'photo' | 'minimal'
  const [backdropMode, setBackdropMode] = useState<'video' | 'photo' | 'minimal'>(() => {
    return (localStorage.getItem('kata_backdrop_mode') as 'video' | 'photo' | 'minimal') || 'video';
  });
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rotate photos every 12 seconds if photo mode is selected
  useEffect(() => {
    if (backdropMode !== 'photo') return;
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % PHOTO_ROTATION.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [backdropMode]);

  // Persist mode
  const handleSetMode = (mode: 'video' | 'photo' | 'minimal') => {
    setBackdropMode(mode);
    localStorage.setItem('kata_backdrop_mode', mode);
  };

  const currentFeed = VIDEO_FEEDS[activeFeedIndex];

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const nextFeed = () => {
    setActiveFeedIndex((prev) => (prev + 1) % VIDEO_FEEDS.length);
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 1. Live Video Mode */}
      {backdropMode === 'video' && (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-25">
          <video
            ref={videoRef}
            key={currentFeed.videoUrl}
            src={currentFeed.videoUrl}
            poster={currentFeed.posterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-105"
            onLoadedData={() => {
              if (isPlaying) videoRef.current?.play().catch(() => {});
            }}
          />
        </div>
      )}

      {/* 2. Rotating Live Car Photography Mode */}
      {backdropMode === 'photo' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-20 filter brightness-95 scale-105"
          style={{ backgroundImage: `url(${PHOTO_ROTATION[activePhotoIndex]})` }}
        />
      )}

      {/* 3. Luminous Frosted White Glass Overlay Veil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-50/75 to-slate-100/90 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />

      {/* Interactive Floating Backdrop Controls Pill (Bottom Right) */}
      <div className="absolute bottom-5 right-5 pointer-events-auto z-30">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-lg text-xs text-slate-800">
          <button
            type="button"
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-slate-800 hover:bg-slate-100 transition-colors"
            title="Adjust Backdrop Settings"
          >
            <span>{backdropMode === 'video' ? '🎬' : backdropMode === 'photo' ? '📸' : '🌌'}</span>
            <span className="hidden sm:inline">
              {backdropMode === 'video' ? 'Live Video' : backdropMode === 'photo' ? 'Live Photos' : 'Minimal'}
            </span>
            <span className="text-[10px] text-slate-500">{isControlsOpen ? '▲' : '▼'}</span>
          </button>

          {backdropMode === 'video' && (
            <>
              <button
                type="button"
                onClick={togglePlayPause}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                title={isPlaying ? 'Pause Car Video' : 'Play Car Video'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                onClick={nextFeed}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                title="Next Cinematic Angle"
              >
                ⏭
              </button>
            </>
          )}
        </div>

        {/* Dropdown Menu */}
        {isControlsOpen && (
          <div className="absolute bottom-12 right-0 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 p-2 shadow-2xl space-y-1 text-xs animate-slide-up text-slate-800">
            <p className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Showroom Atmosphere
            </p>
            <button
              onClick={() => {
                handleSetMode('video');
                setIsControlsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                backdropMode === 'video'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🎬</span> Live Car Video
              </span>
              {backdropMode === 'video' && <span>✓</span>}
            </button>
            <button
              onClick={() => {
                handleSetMode('photo');
                setIsControlsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                backdropMode === 'photo'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>📸</span> Rotating Car Photos
              </span>
              {backdropMode === 'photo' && <span>✓</span>}
            </button>
            <button
              onClick={() => {
                handleSetMode('minimal');
                setIsControlsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                backdropMode === 'minimal'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🌌</span> Dark Minimalist Mode
              </span>
              {backdropMode === 'minimal' && <span>✓</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
