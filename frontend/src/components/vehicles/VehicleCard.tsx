import { useState } from 'react';
import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onInspect?: (vehicle: Vehicle) => void;
  onPurchaseRequest?: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  isAdmin,
  onEdit,
  onDelete,
  onRestock,
  onInspect,
  onPurchaseRequest,
  isPurchasing,
  isCompared,
  onToggleCompare,
}: Props) {
  const [isRevving, setIsRevving] = useState(false);

  const isOutOfStock = vehicle.quantity === 0;

  const stockBadge = isOutOfStock
    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    : vehicle.quantity < 3
    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';

  const handleQuickRev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevving(true);
    exhaustSound.playVehicleExhaust({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      audioUrl: vehicle.exhaustAudioUrl,
    });
    setTimeout(() => setIsRevving(false), 1600);
  };

  const defaultCarPhoto =
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onInspect?.(vehicle)}
      className="glass-card glass-card-hover group cursor-pointer flex flex-col overflow-hidden relative"
    >
      {/* Top Visual Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={vehicle.imageUrl || defaultCarPhoto}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultCarPhoto;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="badge-glass bg-slate-950/70 text-cyan-300 border-white/10 text-[11px]">
            {vehicle.year || 2024} · {vehicle.category}
          </span>
          <span className={`badge-glass text-[11px] ${stockBadge}`}>
            {isOutOfStock ? '● Out of Stock' : `● ${vehicle.quantity} in stock`}
          </span>
        </div>

        {/* Quick Exhaust Rev Trigger on Image */}
        <button
          type="button"
          onClick={handleQuickRev}
          title="Rev Exhaust Note"
          className={`absolute bottom-3 right-3 z-10 p-2 rounded-xl backdrop-blur-xl border border-white/20 text-sm transition-all shadow-lg ${
            isRevving
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white scale-110 shadow-rose-500/50'
              : 'bg-black/60 hover:bg-cyan-500/30 text-white hover:text-cyan-200'
          }`}
        >
          {isRevving ? '🔥' : '🔊'}
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            ${vehicle.price.toLocaleString()}
          </p>

          {/* Quick Specifications Pill */}
          {(vehicle.bhp || vehicle.zeroToSixty || vehicle.drivetrain) && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1.5">
              {vehicle.bhp && <span className="text-slate-300">⚡ {vehicle.bhp} HP</span>}
              {vehicle.zeroToSixty && <span>• 🚀 {vehicle.zeroToSixty}s (0-60)</span>}
              {vehicle.drivetrain && <span>• {vehicle.drivetrain.split(' ')[0]}</span>}
            </div>
          )}
        </div>

        {/* Actions Container */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onPurchaseRequest?.(vehicle);
            }}
            disabled={isOutOfStock || isPurchasing}
          >
            {isPurchasing ? (
              'Processing…'
            ) : isOutOfStock ? (
              'Unavailable'
            ) : (
              <>🛒 Purchase Now</>
            )}
          </button>

          {/* Compare & Inspect Secondary Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare?.(vehicle);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isCompared
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
              }`}
            >
              <span>{isCompared ? '✓' : '⚖️'}</span>
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspect?.(vehicle);
              }}
              className="btn-glass flex-1 py-1.5 text-xs text-slate-300"
            >
              🔍 Full Specs
            </button>
          </div>

          {/* Admin Management Controls */}
          {isAdmin && (
            <div
              className="flex items-center gap-1.5 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn-glass flex-1 py-1 text-xs text-slate-300 hover:text-white"
                onClick={() => onEdit?.(vehicle)}
                title="Edit Details"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="btn-glass flex-1 py-1 text-xs text-cyan-300 hover:text-cyan-200"
                onClick={() => onRestock?.(vehicle)}
                title="Restock Inventory"
              >
                📦 +Stock
              </button>
              <button
                type="button"
                className="btn-danger-glass flex-1 py-1 text-xs"
                onClick={() => onDelete?.(vehicle.id)}
                title="Delete Vehicle"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
