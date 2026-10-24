interface Props {
  onClose: () => void;
  onOpenContact?: () => void;
}

export function AboutModal({ onClose, onOpenContact }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-slide-up">
      <div 
        className="glass-panel max-w-2xl w-full border border-cyan-500/30 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl text-white">
              🏎️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">About KATA MOTORS</h2>
              <p className="text-xs text-slate-400">Pioneering the Next Generation of Automotive Acquisition</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Mission Statement */}
          <div className="glass-card p-5 bg-gradient-to-r from-slate-900 to-cyan-950/30 border-cyan-500/20">
            <span className="badge-glass bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] mb-2">
              ✦ Certified Heritage Since 2012
            </span>
            <h3 className="text-base font-bold text-white mb-1">
              Engineered for Drivers. Curated for Enthusiasts.
            </h3>
            <p className="text-xs text-slate-300">
              KATA MOTORS is a modern digital dealership that bridges high-performance sports heritage, zero-emission electric hypercars, and family luxury vehicles. We offer an uncompromising, transparent automotive purchasing experience backed by real-time inventory tracking and digital certification.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="glass-card p-4">
              <span className="text-2xl mb-1 block">🔍</span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">150-Point Inspection</h4>
              <p className="text-[11px] text-slate-400 mt-1">Every car undergo mechanical, diagnostic, and chassis certification.</p>
            </div>
            <div className="glass-card p-4">
              <span className="text-2xl mb-1 block">🛡️</span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Comprehensive Warranty</h4>
              <p className="text-[11px] text-slate-400 mt-1">4-Year / 50,000-mile bumper-to-bumper and battery powertrain protection.</p>
            </div>
            <div className="glass-card p-4">
              <span className="text-2xl mb-1 block">🚚</span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-1">Enclosed white-glove transport directly to your driveway with 7-day money-back guarantee.</p>
            </div>
          </div>

          {/* Transparent Terms & Policies */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Acquisition Terms & Customer Commitments
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>
                • <strong>No Haggle Pricing:</strong> All listed prices reflect actual vehicle acquisition costs excluding local sales taxes, documentation, and licensing.
              </p>
              <p>
                • <strong>Instant Inventory Decrement:</strong> Purchases digitally secure your vehicle immediately, adjusting real-time warehouse availability.
              </p>
              <p>
                • <strong>Full Clean Title Guarantee:</strong> Every vehicle carries a verified CarFax clean title history free from structural or salvage records.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenContact?.();
              }}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold underline"
            >
              Need personalized support? Contact our concierge →
            </button>
            <button onClick={onClose} className="btn-primary py-2 px-6 text-xs font-bold">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
