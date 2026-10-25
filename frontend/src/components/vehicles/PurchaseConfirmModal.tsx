import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle } from '../../api/client';

interface Props {
  vehicle: Vehicle;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function PurchaseConfirmModal({ vehicle, onConfirm, onCancel, isProcessing }: Props) {
  const estDocFee = 495;
  const totalPrice = vehicle.price + estDocFee;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isProcessing]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-slide-up"
      onClick={onCancel}
    >
      <div 
        className="glass-panel max-w-md w-full p-6 border border-teal-500/30 shadow-2xl space-y-5 bg-slate-900 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <h3 className="text-lg font-bold text-white">Confirm Purchase Order</h3>
              <p className="text-xs text-slate-400">Review your acquisition breakdown</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Selected Car Capsule */}
        <div className="glass-card p-4 flex items-center gap-4 border border-white/5 bg-slate-950/40">
          {vehicle.imageUrl && (
            <img 
              src={vehicle.imageUrl} 
              alt={vehicle.model} 
              className="w-16 h-16 rounded-xl object-cover border border-white/10" 
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
              {vehicle.category}
            </span>
            <h4 className="text-base font-bold text-white truncate">
              {vehicle.year || 2024} {vehicle.make} {vehicle.model}
            </h4>
            <p className="text-xs text-slate-400">Remaining stock: {vehicle.quantity} units</p>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Vehicle Base Price</span>
            <span className="font-semibold">${vehicle.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-xs">
            <span>Dealer Processing & Title</span>
            <span>${estDocFee}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-cyan-400">
            <span>Total Payable</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-glass flex-1 py-2.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="btn-primary flex-1 py-2.5 font-bold"
          >
            {isProcessing ? 'Processing Order...' : 'Authorize Purchase'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
