import { useState } from 'react';
import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  allVehicles: Vehicle[];
  initialSelectedIds?: string[];
  onClose: () => void;
  onPurchase: (vehicle: Vehicle) => void;
}

export function VehicleComparisonModal({
  allVehicles,
  initialSelectedIds = [],
  onClose,
  onPurchase,
}: Props) {
  // Store up to 4 vehicle IDs for side-by-side comparison
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds.length > 0) {
      return initialSelectedIds.slice(0, 4);
    }
    // Default to the first 2 vehicles if none selected
    return allVehicles.slice(0, 2).map((v) => v.id);
  });

  const [revvingId, setRevvingId] = useState<string | null>(null);

  const selectedVehicles = selectedIds
    .map((id) => allVehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  // Determine "Best in Class" leaders for key specs
  const maxBhp = Math.max(...selectedVehicles.map((v) => v.bhp || 0));
  const minZeroToSixty = Math.min(...selectedVehicles.map((v) => v.zeroToSixty || 999));
  const maxTopSpeed = Math.max(...selectedVehicles.map((v) => v.topSpeed || 0));
  const minPrice = Math.min(...selectedVehicles.map((v) => v.price || 9999999));

  const handleRevExhaust = (vehicle: Vehicle) => {
    setRevvingId(vehicle.id);
    exhaustSound.playVehicleExhaust({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      audioUrl: vehicle.exhaustAudioUrl,
    });
    setTimeout(() => {
      setRevvingId(null);
    }, 2800);
  };

  const removeVehicle = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const addVehicle = (id: string) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const availableVehiclesToAdd = allVehicles.filter(
    (v) => !selectedIds.includes(v.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-slide-up">
      <div
        className="glass-panel w-full max-w-6xl border border-cyan-500/30 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400 shadow-md">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Vehicle Specifications & Comparison Matrix
                </h2>
                <span className="badge-glass bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[11px]">
                  {selectedVehicles.length} of 4 Selected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compare engineering telemetry, acceleration, horsepower, range, and pricing side-by-side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg text-lg leading-none transition-colors"
            title="Close Comparison"
          >
            ✕
          </button>
        </div>

        {/* Add Car Dropdown Bar */}
        {selectedVehicles.length < 4 && availableVehiclesToAdd.length > 0 && (
          <div className="px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>➕</span> Add car to compare ({4 - selectedVehicles.length} slot{4 - selectedVehicles.length > 1 ? 's' : ''} left):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {availableVehiclesToAdd.slice(0, 4).map((veh) => (
                <button
                  key={veh.id}
                  onClick={() => addVehicle(veh.id)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-200 transition-all text-xs flex items-center gap-1.5"
                >
                  <span>+</span> {veh.year} {veh.make} {veh.model}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table / Matrix */}
        <div className="p-5 overflow-x-auto overflow-y-auto flex-1">
          {selectedVehicles.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-4xl block">🏎️</span>
              <p className="text-base font-bold text-white">No vehicles selected for comparison.</p>
              <p className="text-xs text-slate-400">Select at least 2 vehicles from inventory to view side-by-side specs.</p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedIds(allVehicles.slice(0, 3).map((v) => v.id))}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Compare Top 3 Showroom Vehicles
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-[700px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 w-44 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 sticky left-0 z-10">
                      Vehicle & Model
                    </th>
                    {selectedVehicles.map((veh) => (
                      <th key={veh.id} className="p-3 align-top min-w-[200px]">
                        <div className="glass-card p-3 relative group border-white/10 flex flex-col justify-between h-full">
                          {selectedVehicles.length > 1 && (
                            <button
                              onClick={() => removeVehicle(veh.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800/80 hover:bg-rose-600/80 text-white flex items-center justify-center text-xs transition-colors"
                              title="Remove from comparison"
                            >
                              ✕
                            </button>
                          )}

                          {/* Image */}
                          <div className="h-28 rounded-lg overflow-hidden mb-2 bg-slate-950 relative">
                            <img
                              src={veh.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
                              alt={`${veh.make} ${veh.model}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 badge-glass bg-black/60 text-cyan-300 text-[10px] px-1.5 py-0.5">
                              {veh.category}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white leading-tight">
                            {veh.year || 2024} {veh.make} {veh.model}
                          </h3>

                          {/* Exhaust Rev Button */}
                          <button
                            onClick={() => handleRevExhaust(veh)}
                            className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              revvingId === veh.id
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                                : 'bg-white/5 hover:bg-cyan-500/10 text-cyan-300 border border-white/10'
                            }`}
                          >
                            <span>{revvingId === veh.id ? '🔊' : '🎵'}</span>
                            <span>{revvingId === veh.id ? 'Revving...' : 'Rev Exhaust'}</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {/* Price */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Showroom Price
                    </td>
                    {selectedVehicles.map((veh) => {
                      const isBest = veh.price === minPrice && selectedVehicles.length > 1;
                      return (
                        <td key={veh.id} className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base font-black text-white">
                              ${veh.price.toLocaleString()}
                            </span>
                            {isBest && (
                              <span className="badge-glass bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] py-0.5">
                                ★ Best Value
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* BHP / Power */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Horsepower (BHP)
                    </td>
                    {selectedVehicles.map((veh) => {
                      const isLeader = veh.bhp && veh.bhp === maxBhp && maxBhp > 0 && selectedVehicles.length > 1;
                      return (
                        <td key={veh.id} className="p-3">
                          {veh.bhp ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm">
                                {veh.bhp} <span className="text-cyan-400 text-xs">hp</span>
                              </span>
                              {isLeader && (
                                <span className="badge-glass bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] py-0.5">
                                  ⚡ Highest Power
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* 0-60 mph Acceleration */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      0 – 60 mph Acceleration
                    </td>
                    {selectedVehicles.map((veh) => {
                      const isQuickest =
                        veh.zeroToSixty &&
                        veh.zeroToSixty === minZeroToSixty &&
                        minZeroToSixty < 999 &&
                        selectedVehicles.length > 1;
                      return (
                        <td key={veh.id} className="p-3">
                          {veh.zeroToSixty ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm">
                                {veh.zeroToSixty} <span className="text-cyan-400 text-xs">sec</span>
                              </span>
                              {isQuickest && (
                                <span className="badge-glass bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] py-0.5">
                                  🚀 Quickest
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Speed */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Top Speed
                    </td>
                    {selectedVehicles.map((veh) => {
                      const isFastest =
                        veh.topSpeed && veh.topSpeed === maxTopSpeed && maxTopSpeed > 0 && selectedVehicles.length > 1;
                      return (
                        <td key={veh.id} className="p-3">
                          {veh.topSpeed ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-sm">
                                {veh.topSpeed} <span className="text-cyan-400 text-xs">mph</span>
                              </span>
                              {isFastest && (
                                <span className="badge-glass bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] py-0.5">
                                  🏁 Highest V-Max
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Efficiency / Range */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Mileage / Range
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 font-medium text-slate-200">
                        {veh.mileage || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Fuel / Battery Capacity */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Fuel / Battery Capacity
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 font-medium text-slate-200">
                        {veh.fuelCapacity || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Transmission */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Transmission
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 text-slate-300">
                        {veh.transmission || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Drivetrain */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Drivetrain
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 text-slate-300">
                        {veh.drivetrain || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Engine / Motor Setup */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Powertrain Architecture
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 text-slate-300">
                        {veh.engine || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Seating */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Seating Capacity
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 text-slate-300">
                        {veh.seating ? `${veh.seating} Passengers` : <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Curb Weight */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Curb Weight
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3 text-slate-300">
                        {veh.curbWeight || <span className="text-slate-500 italic">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Inventory Availability */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Inventory Status
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3">
                        {veh.quantity === 0 ? (
                          <span className="badge-glass bg-rose-500/20 text-rose-400 border-rose-500/40 text-[10px]">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="badge-glass bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                            {veh.quantity} Available
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Purchase CTA Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 sticky left-0">
                      Order / Purchase
                    </td>
                    {selectedVehicles.map((veh) => (
                      <td key={veh.id} className="p-3">
                        <button
                          onClick={() => {
                            onPurchase(veh);
                            onClose();
                          }}
                          disabled={veh.quantity === 0}
                          className="btn-primary w-full py-2 text-xs font-bold"
                        >
                          {veh.quantity === 0 ? 'Sold Out' : 'Purchase Vehicle'}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>💡</span> Tip: Click &quot;Rev Exhaust&quot; on any car to evaluate acoustic timbre before ordering.
          </div>
          <button onClick={onClose} className="btn-glass px-5 py-2 text-xs font-semibold">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
