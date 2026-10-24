import { useState } from 'react';
import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onPurchase: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

export function VehicleInspectModal({ vehicle, onClose, onPurchase, isPurchasing }: Props) {
  const [isRevving, setIsRevving] = useState(false);

  const handleRev = () => {
    setIsRevving(true);
    exhaustSound.playExhaustRev(vehicle.category, `${vehicle.make} ${vehicle.model}`);
    setTimeout(() => setIsRevving(false), 1800);
  };

  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-slide-up">
      <div 
        className="glass-panel max-w-2xl w-full overflow-hidden shadow-2xl border border-cyan-500/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image with Gradient Overlay */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
          <img
            src={
              vehicle.imageUrl ||
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
            }
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
          >
            ✕
          </button>

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="badge-glass bg-cyan-500/20 text-cyan-300 border-cyan-500/40 mb-2">
                {vehicle.year || 2024} · {vehicle.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {vehicle.make} {vehicle.model}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Starting MSRP</p>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
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
                  Exhaust Sound Simulator
                  {isRevving && (
                    <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
                      REV ACTIVE • 6,500 RPM
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400">
                  Synthesized acoustic signature for this {vehicle.category.toLowerCase()} powertrain.
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
              {isRevving ? '🔥 Revving Engine...' : '⚡ Hear Exhaust Rev'}
            </button>
          </div>

          {/* Quick Vehicle Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Year</p>
              <p className="text-base font-bold text-slate-200">{vehicle.year || 2024}</p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Category</p>
              <p className="text-base font-bold text-slate-200">{vehicle.category}</p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Inventory</p>
              <p className={`text-base font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} Units`}
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-slate-400">Warranty</p>
              <p className="text-base font-bold text-slate-200">4 Yr / 50k Mi</p>
            </div>
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
