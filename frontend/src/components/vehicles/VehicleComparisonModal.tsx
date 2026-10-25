import { useState, useEffect } from 'react';
import { Vehicle } from '../../api/client';
import { exhaustSound } from '../../utils/exhaustAudio';

interface Props {
  allVehicles: Vehicle[];
  initialSelectedIds?: string[];
  onClose: () => void;
  onPurchase: (vehicle: Vehicle) => void;
  onSelectionChange?: (ids: string[]) => void;
}

export function VehicleComparisonModal({
  allVehicles,
  initialSelectedIds = [],
  onClose,
  onPurchase,
  onSelectionChange,
}: Props) {
  // Manual selection: strictly initialize with user's explicitly selected IDs (never auto-select)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return initialSelectedIds.slice(0, 4);
  });

  // Toggle open manual car picker catalog
  const [showCatalogSelector, setShowCatalogSelector] = useState<boolean>(() => {
    return initialSelectedIds.length < 2;
  });

  const [revvingId, setRevvingId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Notify parent on selection change
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

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

  const toggleSelectVehicle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 4) return;
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const removeVehicle = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const clearAllSelections = () => {
    setSelectedIds([]);
    setShowCatalogSelector(true);
  };

  const filteredCatalog = allVehicles.filter((v) => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  });

  const availableVehiclesToAdd = allVehicles.filter(
    (v) => !selectedIds.includes(v.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-slide-up">
      <div
        className="glass-panel w-full max-w-6xl border border-slate-200 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col bg-white text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-xl text-teal-600 shadow-sm">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Vehicle Specifications & Comparison Matrix
                </h2>
                <span
                  className={`badge-glass text-[11px] font-semibold ${
                    selectedVehicles.length >= 2
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedVehicles.length} of 4 Manually Selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manually select 2 to 4 vehicles from inventory to compare engineering telemetry side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedVehicles.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowCatalogSelector(!showCatalogSelector)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
                  showCatalogSelector
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                <span>🚘</span>
                <span>{showCatalogSelector ? 'Hide Selector' : 'Change Selected Cars'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg text-lg leading-none transition-colors"
              title="Close Comparison"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 1. Manual Vehicle Selector Drawer (Always visible when < 2 cars or toggled) */}
        {showCatalogSelector && (
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3 animate-slide-up max-h-72 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>📋</span> Manual Vehicle Selection Catalog
                </h3>
                <p className="text-[11px] text-slate-400">
                  Click on any vehicle card to add or remove it from your side-by-side comparison (2 to 4 cars).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter cars..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="glass-input text-xs py-1 px-3 w-40"
                />
                {selectedIds.length > 0 && (
                  <button
                    onClick={clearAllSelections}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline px-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredCatalog.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const isFull = selectedIds.length >= 4 && !isSelected;

                return (
                  <div
                    key={v.id}
                    onClick={() => !isFull && toggleSelectVehicle(v.id)}
                    className={`glass-card p-2.5 rounded-xl cursor-pointer border transition-all text-left flex flex-col justify-between group relative ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-md shadow-cyan-500/20'
                        : isFull
                        ? 'opacity-40 cursor-not-allowed border-white/5'
                        : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Top Selection Status Pill */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        {v.year || 2024} · {v.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : '+ Compare'}
                      </span>
                    </div>

                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={v.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'}
                        alt={v.model}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">
                          {v.make} {v.model}
                        </p>
                        <p className="text-[11px] font-semibold text-cyan-400">
                          ${v.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Mini Spec Badges */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      {v.bhp && <span>⚡ {v.bhp} HP</span>}
                      {v.zeroToSixty && <span>• 🚀 {v.zeroToSixty}s</span>}
                      {v.topSpeed && <span>• 🏁 {v.topSpeed}mph</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedVehicles.length >= 2 && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCatalogSelector(false)}
                  className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 shadow-cyan-500/20"
                >
                  <span>View Matrix ({selectedVehicles.length} Cars)</span> <span>➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Quick Add Bar when catalog drawer is closed and slots remain */}
        {!showCatalogSelector && selectedVehicles.length < 4 && availableVehiclesToAdd.length > 0 && (
          <div className="px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>➕</span> Add car to comparison ({4 - selectedVehicles.length} slot{4 - selectedVehicles.length > 1 ? 's' : ''} left):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {availableVehiclesToAdd.slice(0, 4).map((veh) => (
                <button
                  key={veh.id}
                  onClick={() => toggleSelectVehicle(veh.id)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-200 transition-all text-xs flex items-center gap-1.5"
                >
                  <span>+</span> {veh.year} {veh.make} {veh.model}
                </button>
              ))}
              <button
                onClick={() => setShowCatalogSelector(true)}
                className="text-cyan-400 hover:underline font-semibold ml-1 text-xs"
              >
                Browse all inventory...
              </button>
            </div>
          </div>
        )}

        {/* 3. Comparison Table / Matrix Area */}
        <div className="p-5 overflow-x-auto overflow-y-auto flex-1">
          {selectedVehicles.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-4xl block">⚖️</span>
              <p className="text-base font-bold text-white">No vehicles selected yet.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use the manual selection catalog above or click &quot;Compare&quot; on vehicle cards in the showroom to pick 2 to 4 cars to compare side-by-side.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowCatalogSelector(true)}
                  className="btn-primary text-xs px-5 py-2.5 font-bold"
                >
                  Select Cars from Catalog
                </button>
              </div>
            </div>
          ) : selectedVehicles.length === 1 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-4xl block">🚘</span>
              <p className="text-base font-bold text-white">
                1 car selected: <span className="text-cyan-400">{selectedVehicles[0].make} {selectedVehicles[0].model}</span>
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please manually select at least 1 more car to unlock the side-by-side specification comparison matrix.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowCatalogSelector(true)}
                  className="btn-primary text-xs px-5 py-2.5 font-bold"
                >
                  Select Additional Vehicle
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
                          <button
                            onClick={() => removeVehicle(veh.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition-colors shadow-md"
                            title="Remove from comparison"
                          >
                            ✕
                          </button>

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
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>💡</span> You have full manual control: select and deselect any vehicles above at any time.
          </div>
          <div className="flex items-center gap-2">
            {selectedVehicles.length > 0 && (
              <button
                onClick={clearAllSelections}
                className="btn-glass px-4 py-2 text-xs text-rose-300 hover:text-rose-200"
              >
                Clear Selections
              </button>
            )}
            <button onClick={onClose} className="btn-glass px-5 py-2 text-xs font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
