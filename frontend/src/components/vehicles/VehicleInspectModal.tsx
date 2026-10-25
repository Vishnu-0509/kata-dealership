import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';
import { Vehicle360Viewer } from './Vehicle360Viewer';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onPurchase: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

export function VehicleInspectModal({ vehicle, onClose, onPurchase, isPurchasing }: Props) {
  const [isRevving, setIsRevving] = useState(false);

  // Keyboard shortcut: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const parsedAngles = useMemo<string[]>(() => {
    if (!vehicle.images360) return [];
    try {
      const parsed = JSON.parse(vehicle.images360);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [vehicle.images360]);

  const [activeTab, setActiveTab] = useState<'360' | 'photo'>(parsedAngles.length >= 2 ? '360' : 'photo');

  const handleRev = () => {
    setIsRevving(true);
    exhaustSound.playVehicleExhaust({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      audioUrl: vehicle.exhaustAudioUrl,
    });
    setTimeout(() => setIsRevving(false), 2000);
  };

  const isOutOfStock = vehicle.quantity === 0;

  // Model-specific acoustic description
  const getPowertrainBadge = () => {
    const s = `${vehicle.make} ${vehicle.model}`.toLowerCase();
    if (s.includes('911') || s.includes('porsche')) return '3.0L Twin-Turbo Flat-6 Boxer';
    if (s.includes('m4') || s.includes('bmw')) return '3.0L S58 Twin-Turbo Inline-6';
    if (s.includes('f-150') || s.includes('coyote')) return '5.0L Coyote V8 Powerplant';
    if (s.includes('civic') || s.includes('honda')) return '1.5L Turbo VTEC Tuner';
    if (s.includes('tesla')) return 'Dual-Motor High Voltage AWD';
    if (s.includes('rivian')) return 'Quad-Motor Torque Vectoring';
    if (s.includes('rav4')) return '2.5L Dynamic Force Hybrid';
    if (s.includes('buzz')) return 'Electric Rear Stator Drive';
    return `${vehicle.category} Tuned Exhaust`;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-testid="inspect-modal-backdrop"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-slide-up overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="glass-panel max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] bg-white text-slate-900 my-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Header with Tab Switcher */}
        <div className="relative w-full bg-slate-950 flex flex-col">
          {/* Media Mode Pill Selector */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab('360')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === '360'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🔄 360° Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'photo'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📷 Static Photo
            </button>
          </div>

          {/* Close Button: prominent, high-contrast white button with dark icon, visible on all car photos */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            title="Close modal (Esc)"
            className="absolute top-4 right-4 z-40 bg-white hover:bg-slate-100 text-slate-900 hover:text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-2xl border-2 border-white ring-2 ring-slate-900/25 transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/50"
          >
            ✕
          </button>

          {/* Media Display Area */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
            {activeTab === '360' ? (
              <Vehicle360Viewer
                images={parsedAngles}
                fallbackImageUrl={vehicle.imageUrl}
                vehicleName={`${vehicle.make} ${vehicle.model}`}
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={
                    vehicle.imageUrl ||
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
            )}
          </div>

          {/* Vehicle Identity Header Banner */}
          <div className="px-6 py-3 bg-slate-50 border-t border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="badge-glass bg-teal-50 text-teal-700 border-teal-200 mb-1 inline-block font-semibold">
                {vehicle.year || 2024} · {vehicle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Starting MSRP</p>
              <p className="text-xl sm:text-2xl font-black text-teal-600">
                ${vehicle.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Exhaust Sound Feature */}
          <div className="glass-card p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-teal-50 border border-teal-200 text-2xl transition-transform ${isRevving ? 'scale-125 animate-bounce' : ''}`}>
                🔊
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Exhaust Sound Simulator</span>
                  {isRevving && (
                    <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase animate-pulse">
                      REV ACTIVE • THROTTLE ENGAGED
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  Acoustic signature: <strong className="text-teal-700">{getPowertrainBadge()}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleRev}
              disabled={isRevving}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-md ${
                isRevving
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-rose-500/40'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/20'
              }`}
            >
              {isRevving ? '🔥 Revving...' : '⚡ Hear Real Exhaust Rev'}
            </button>
          </div>

          {/* Quick Vehicle Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="glass-card p-3 border-slate-200 bg-white">
              <p className="text-xs text-slate-500">Year</p>
              <p className="text-base font-bold text-slate-900">{vehicle.year || 2024}</p>
            </div>
            <div className="glass-card p-3 border-slate-200 bg-white">
              <p className="text-xs text-slate-500">Powertrain</p>
              <p className="text-xs font-bold text-slate-900 truncate">{vehicle.category}</p>
            </div>
            <div className="glass-card p-3 border-slate-200 bg-white">
              <p className="text-xs text-slate-500">Inventory Status</p>
              <p className={`text-base font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} In Stock`}
              </p>
            </div>
            <div className="glass-card p-3 border-slate-200 bg-white">
              <p className="text-xs text-slate-500">CPO Warranty</p>
              <p className="text-base font-bold text-slate-900">4 Yr / 50k Mi</p>
            </div>
          </div>

          {/* Detailed Engineering Telemetry Grid */}
          {(vehicle.bhp || vehicle.zeroToSixty || vehicle.topSpeed || vehicle.mileage || vehicle.fuelCapacity || vehicle.transmission) && (
            <div className="glass-card p-4 space-y-3 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  <span>⚡</span> Factory Engineering Specifications
                </span>
                {vehicle.engine && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    {vehicle.engine}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {vehicle.bhp && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Output</span>
                    <span className="font-bold text-slate-900 text-sm">{vehicle.bhp} <span className="text-teal-600 text-xs">BHP</span></span>
                  </div>
                )}
                {vehicle.zeroToSixty && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">0 - 60 mph</span>
                    <span className="font-bold text-slate-900 text-sm">{vehicle.zeroToSixty} <span className="text-teal-600 text-xs">sec</span></span>
                  </div>
                )}
                {vehicle.topSpeed && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">V-Max Speed</span>
                    <span className="font-bold text-slate-900 text-sm">{vehicle.topSpeed} <span className="text-teal-600 text-xs">mph</span></span>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Efficiency / Range</span>
                    <span className="font-bold text-slate-900 truncate block">{vehicle.mileage}</span>
                  </div>
                )}
                {vehicle.fuelCapacity && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Capacity / Pack</span>
                    <span className="font-bold text-slate-900 truncate block">{vehicle.fuelCapacity}</span>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Transmission</span>
                    <span className="font-bold text-slate-900 truncate block">{vehicle.transmission}</span>
                  </div>
                )}
                {vehicle.drivetrain && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Drivetrain</span>
                    <span className="font-bold text-slate-900 truncate block">{vehicle.drivetrain}</span>
                  </div>
                )}
                {vehicle.seating && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Seating</span>
                    <span className="font-bold text-slate-900">{vehicle.seating} Passengers</span>
                  </div>
                )}
                {vehicle.curbWeight && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block uppercase">Curb Weight</span>
                    <span className="font-bold text-slate-900">{vehicle.curbWeight}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Concierge Hotline Prompt */}
          <div className="text-xs text-slate-600 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span>Need assistance or financing guidance?</span>
            <a href="tel:+18005552739" className="text-teal-600 hover:underline font-semibold">
              📞 +1 (800) 555-KATA
            </a>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="btn-glass px-6 py-2.5"
            >
              Close
            </button>

            <button
              onClick={() => onPurchase(vehicle)}
              disabled={isOutOfStock || isPurchasing}
              className="btn-primary flex-1 py-3 text-base font-bold flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <>⏳ Completing Purchase...</>
              ) : isOutOfStock ? (
                <>🚫 Currently Unavailable</>
              ) : (
                <>🛒 Secure Purchase • ${vehicle.price.toLocaleString()}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
