import { useState } from 'react';
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

  let parsedAngles: string[] = [];
  if (vehicle.images360) {
    try {
      parsedAngles = JSON.parse(vehicle.images360);
      if (!Array.isArray(parsedAngles)) parsedAngles = [];
    } catch {
      parsedAngles = [];
    }
  }

  const [activeTab, setActiveTab] = useState<'360' | 'photo'>(parsedAngles.length > 0 ? '360' : 'photo');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-slide-up">
      <div 
        className="glass-panel max-w-2xl w-full overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col max-h-[90vh]"
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
                  ? 'bg-cyan-500 text-white shadow-md'
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
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📷 Static Photo
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
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
          <div className="px-6 py-3 bg-slate-900/90 border-t border-b border-white/10 flex items-center justify-between">
            <div>
              <span className="badge-glass bg-cyan-500/20 text-cyan-300 border-cyan-500/40 mb-1 inline-block">
                {vehicle.year || 2024} · {vehicle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {vehicle.make} {vehicle.model}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Starting MSRP</p>
              <p className="text-xl sm:text-2xl font-black text-cyan-400">
                ${vehicle.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Exhaust Sound Feature */}
          <div className="glass-card p-4 bg-gradient-to-r from-slate-900/90 to-cyan-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-2xl transition-transform ${isRevving ? 'scale-125 animate-bounce' : ''}`}>
                🔊
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Exhaust Sound Simulator</span>
                  {isRevving && (
                    <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
                      REV ACTIVE • THROTTLE ENGAGED
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400">
                  Acoustic signature: <strong className="text-cyan-300">{getPowertrainBadge()}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleRev}
              disabled={isRevving}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-lg ${
                isRevving
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-rose-500/40'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-cyan-500/10'
              }`}
            >
              {isRevving ? '🔥 Revving...' : '⚡ Hear Real Exhaust Rev'}
            </button>
          </div>

          {/* Quick Vehicle Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Year</p>
              <p className="text-base font-bold text-slate-200">{vehicle.year || 2024}</p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Powertrain</p>
              <p className="text-xs font-bold text-slate-200 truncate">{vehicle.category}</p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Inventory Status</p>
              <p className={`text-base font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isOutOfStock ? 'Sold Out' : `${vehicle.quantity} In Stock`}
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">CPO Warranty</p>
              <p className="text-base font-bold text-slate-200">4 Yr / 50k Mi</p>
            </div>
          </div>

          {/* Detailed Engineering Telemetry Grid */}
          {(vehicle.bhp || vehicle.zeroToSixty || vehicle.topSpeed || vehicle.mileage || vehicle.fuelCapacity || vehicle.transmission) && (
            <div className="glass-card p-4 space-y-3 bg-slate-900/60 border-cyan-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>⚡</span> Factory Engineering Specifications
                </span>
                {vehicle.engine && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {vehicle.engine}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {vehicle.bhp && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Output</span>
                    <span className="font-bold text-white text-sm">{vehicle.bhp} <span className="text-cyan-400 text-xs">BHP</span></span>
                  </div>
                )}
                {vehicle.zeroToSixty && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">0 - 60 mph</span>
                    <span className="font-bold text-white text-sm">{vehicle.zeroToSixty} <span className="text-cyan-400 text-xs">sec</span></span>
                  </div>
                )}
                {vehicle.topSpeed && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">V-Max Speed</span>
                    <span className="font-bold text-white text-sm">{vehicle.topSpeed} <span className="text-cyan-400 text-xs">mph</span></span>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Efficiency / Range</span>
                    <span className="font-bold text-white truncate block">{vehicle.mileage}</span>
                  </div>
                )}
                {vehicle.fuelCapacity && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Capacity / Pack</span>
                    <span className="font-bold text-white truncate block">{vehicle.fuelCapacity}</span>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Transmission</span>
                    <span className="font-bold text-white truncate block">{vehicle.transmission}</span>
                  </div>
                )}
                {vehicle.drivetrain && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Drivetrain</span>
                    <span className="font-bold text-white truncate block">{vehicle.drivetrain}</span>
                  </div>
                )}
                {vehicle.seating && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Seating</span>
                    <span className="font-bold text-white">{vehicle.seating} Passengers</span>
                  </div>
                )}
                {vehicle.curbWeight && (
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Curb Weight</span>
                    <span className="font-bold text-white">{vehicle.curbWeight}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Concierge Hotline Prompt */}
          <div className="text-xs text-slate-400 flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span>Need assistance or financing guidance?</span>
            <a href="tel:+18005552739" className="text-cyan-400 hover:underline font-semibold">
              📞 +1 (800) 555-KATA
            </a>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
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
    </div>
  );
}
