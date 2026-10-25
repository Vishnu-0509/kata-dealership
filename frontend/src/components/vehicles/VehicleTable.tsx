import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  vehicles: Vehicle[];
  isAdmin: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRestock: (vehicle: Vehicle) => void;
  onInspect: (vehicle: Vehicle) => void;
  onPurchaseRequest: (vehicle: Vehicle) => void;
  comparedIds?: string[];
  onToggleCompare?: (vehicle: Vehicle) => void;
  isDemo?: boolean;
}

export function VehicleTable({
  vehicles,
  isAdmin,
  onEdit,
  onDelete,
  onRestock,
  onInspect,
  onPurchaseRequest,
  comparedIds = [],
  onToggleCompare,
  isDemo,
}: Props) {
  const defaultCarPhoto =
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-4 px-4">Vehicle</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Year</th>
              <th className="py-4 px-4">Price</th>
              <th className="py-4 px-4">Stock</th>
              <th className="py-4 px-4">Exhaust</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {vehicles.map((v) => {
              const isOutOfStock = v.quantity === 0;
              return (
                <tr
                  key={v.id}
                  onClick={() => onInspect(v)}
                  className="hover:bg-cyan-500/5 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={v.imageUrl || defaultCarPhoto}
                      alt={v.model}
                      className="w-12 h-10 rounded-lg object-cover border border-white/10"
                    />
                    <div>
                      <span className="font-bold text-white group-hover:text-cyan-400">
                        {v.make} {v.model}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-glass bg-slate-900 text-cyan-300 border-white/10">
                      {v.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{v.year || 2024}</td>
                  <td className="py-3 px-4 font-extrabold text-cyan-400">
                    ${v.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`badge-glass ${
                        isOutOfStock
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : v.quantity < 3
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isOutOfStock ? '0 (Out)' : `${v.quantity} units`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exhaustSound.playVehicleExhaust({
                          make: v.make,
                          model: v.model,
                          category: v.category,
                          audioUrl: v.exhaustAudioUrl,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 text-xs"
                      title="Play Exhaust"
                    >
                      🔊 Rev
                    </button>
                  </td>
                  <td
                    className="py-3 px-4 text-right space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => onToggleCompare?.(v)}
                        className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          comparedIds.includes(v.id)
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                        title="Toggle Compare"
                      >
                        {comparedIds.includes(v.id) ? '✓ Comparing' : '⚖️ Compare'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onPurchaseRequest(v)}
                      disabled={isOutOfStock}
                      className="btn-primary py-1 px-3 text-xs"
                    >
                      {isOutOfStock ? 'Sold Out' : isDemo ? '🛒 Buy (Sign In)' : '🛒 Buy'}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(v)}
                          className="btn-glass py-1 px-2.5 text-xs"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestock(v)}
                          className="btn-glass py-1 px-2.5 text-xs text-cyan-300"
                          title="Restock"
                        >
                          📦
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(v.id)}
                          className="btn-danger-glass py-1 px-2.5 text-xs"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
