import { useState, FormEvent } from 'react';
import { Vehicle } from '../../api/client';
import { VEHICLE_CATEGORIES } from '../../constants/categories';

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
  title: string;
}

interface AngleItem {
  id: string;
  url: string;
}

export function VehicleForm({ initial, onSubmit, onCancel, loading, title }: Props) {
  const [make, setMake] = useState(initial?.make || '');
  const [model, setModel] = useState(initial?.model || '');
  const [category, setCategory] = useState(initial?.category || 'Sedan');
  const [year, setYear] = useState(String(initial?.year ?? 2024));
  const [price, setPrice] = useState(String(initial?.price || ''));
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [exhaustAudioUrl, setExhaustAudioUrl] = useState(initial?.exhaustAudioUrl || '');

  // 360 Interactive Viewer Angle Sequence with stable row IDs
  const [angleItems, setAngleItems] = useState<AngleItem[]>(() => {
    if (initial?.images360) {
      try {
        const parsed = JSON.parse(initial.images360);
        if (Array.isArray(parsed)) {
          return parsed.map((url, i) => ({
            id: `angle-init-${i}-${Math.random().toString(36).slice(2, 7)}`,
            url: typeof url === 'string' ? url : String(url),
          }));
        }
      } catch {
        return [];
      }
    }
    return [];
  });
  const [newAngleUrl, setNewAngleUrl] = useState('');
  
  // Engineering Specifications
  const [bhp, setBhp] = useState(initial?.bhp ? String(initial.bhp) : '');
  const [zeroToSixty, setZeroToSixty] = useState(initial?.zeroToSixty ? String(initial.zeroToSixty) : '');
  const [topSpeed, setTopSpeed] = useState(initial?.topSpeed ? String(initial.topSpeed) : '');
  const [mileage, setMileage] = useState(initial?.mileage || '');
  const [fuelCapacity, setFuelCapacity] = useState(initial?.fuelCapacity || '');
  const [transmission, setTransmission] = useState(initial?.transmission || '');
  const [drivetrain, setDrivetrain] = useState(initial?.drivetrain || '');
  const [seating, setSeating] = useState(initial?.seating ? String(initial.seating) : '5');
  const [engine, setEngine] = useState(initial?.engine || '');
  const [curbWeight, setCurbWeight] = useState(initial?.curbWeight || '');
  const [showSpecsSection, setShowSpecsSection] = useState(Boolean(initial?.bhp || initial?.zeroToSixty || initial?.transmission));

  const addAngleImage = () => {
    const trimmed = newAngleUrl.trim();
    if (!trimmed) return;
    setAngleItems((prev) => [
      ...prev,
      { id: `angle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, url: trimmed },
    ]);
    setNewAngleUrl('');
  };

  const removeAngleImage = (id: string) => {
    setAngleItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveAngleImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= angleItems.length) return;
    const nextList = [...angleItems];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, moved);
    setAngleItems(nextList);
  };

  const updateAngleUrl = (id: string, url: string) => {
    setAngleItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url } : item))
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanAngles = angleItems.map((item) => item.url.trim()).filter(Boolean);
    onSubmit({
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      year: year ? parseInt(year, 10) : 2024,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      imageUrl: imageUrl.trim() || null,
      images360: cleanAngles.length > 0 ? JSON.stringify(cleanAngles) : null,
      exhaustAudioUrl: exhaustAudioUrl.trim() || null,
      bhp: bhp ? parseInt(bhp, 10) : null,
      zeroToSixty: zeroToSixty ? parseFloat(zeroToSixty) : null,
      topSpeed: topSpeed ? parseInt(topSpeed, 10) : null,
      mileage: mileage.trim() || null,
      fuelCapacity: fuelCapacity.trim() || null,
      transmission: transmission.trim() || null,
      drivetrain: drivetrain.trim() || null,
      seating: seating ? parseInt(seating, 10) : null,
      engine: engine.trim() || null,
      curbWeight: curbWeight.trim() || null,
    });
  };

  const categories = VEHICLE_CATEGORIES;

  const quickSamples = [
    { label: 'Porsche 911', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80' },
    { label: 'BMW M4', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tesla EV', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80' },
    { label: 'SUV', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-slide-up">
      <div 
        className="glass-panel w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🚘</span> {title}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Make</label>
              <input
                className="glass-input"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Porsche"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
              <input
                className="glass-input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 911 Carrera"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                className="glass-input bg-white text-slate-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                className="glass-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                min="1980"
                max="2030"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($ USD)</label>
              <input
                type="number"
                className="glass-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="85000"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                className="glass-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="3"
                min="0"
                required
              />
            </div>
          </div>

          {/* Vehicle Image URL & Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Vehicle Image URL</label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Remove picture
                </button>
              )}
            </div>
            <input
              type="url"
              className="glass-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />

            {/* Quick Sample Image Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-600 font-medium mr-1 self-center">Presets:</span>
              {quickSamples.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setImageUrl(sample.url)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-medium"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Live Photo Preview */}
            {imageUrl && (
              <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white">
                  Image Preview
                </span>
              </div>
            )}
          </div>

          {/* Interactive 360° Studio Photography Angles (Ordered Sequence) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🔄</span> 360° Interactive Angle Sequence ({angleItems.length} angles)
                </label>
                <p className="text-[11px] text-slate-600 font-medium">
                  Sequential photographs of this vehicle from surrounding angles.
                </p>
              </div>
              {angleItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAngleItems([])}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Clear All Angles
                </button>
              )}
            </div>

            {/* Input to add angle */}
            <div className="flex gap-2">
              <input
                type="url"
                className="glass-input flex-1 text-xs bg-white text-slate-900 border-slate-200"
                value={newAngleUrl}
                onChange={(e) => setNewAngleUrl(e.target.value)}
                placeholder="https://.../angle_01.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAngleImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={addAngleImage}
                disabled={!newAngleUrl.trim()}
                className="btn-glass bg-white px-3 py-1.5 text-xs text-teal-700 border-teal-300 hover:bg-teal-50 disabled:opacity-40 font-semibold"
              >
                + Add Angle
              </button>
            </div>

            {/* List of Ordered Angles */}
            {angleItems.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {angleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs shadow-sm"
                  >
                    <span className="w-6 text-center font-bold text-teal-600 text-[11px]">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.url}
                      alt={`Angle ${idx + 1}`}
                      className="w-10 h-8 object-cover rounded bg-slate-100 border border-slate-200"
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => updateAngleUrl(item.id, e.target.value)}
                      className="glass-input bg-white text-slate-900 border-slate-200 flex-1 py-1 px-2 text-[11px]"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveAngleImage(idx, 'up')}
                        title="Move Up"
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === angleItems.length - 1}
                        onClick={() => moveAngleImage(idx, 'down')}
                        title="Move Down"
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAngleImage(item.id)}
                        title="Remove"
                        className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                No 360° angle photos configured. The vehicle details will show &ldquo;360° view unavailable&rdquo; and display the primary photograph.
              </p>
            )}
          </div>

          {/* Custom Exhaust Audio URL (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Custom Real Exhaust Audio URL <span className="text-slate-500 font-normal">(Optional MP3/WAV)</span>
              </label>
              {exhaustAudioUrl && (
                <button
                  type="button"
                  onClick={() => setExhaustAudioUrl('')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Clear Audio
                </button>
              )}
            </div>
            <input
              type="url"
              className="glass-input"
              value={exhaustAudioUrl}
              onChange={(e) => setExhaustAudioUrl(e.target.value)}
              placeholder="https://example.com/exhaust.mp3 (leave empty for procedural synthesis)"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              If left blank, our custom engine simulator generates the exact acoustic profile for this model automatically.
            </p>
          </div>

          {/* Engineering Specifications & Performance Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowSpecsSection(!showSpecsSection)}
              className="flex items-center justify-between w-full py-2 text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              <span className="flex items-center gap-1.5">
                <span>⚙️</span> Engineering Specifications & Telemetry
              </span>
              <span className="text-slate-500">{showSpecsSection ? '▲ Hide Specs' : '▼ Expand Specs'}</span>
            </button>

            {showSpecsSection && (
              <div className="space-y-4 pt-3 pb-2 animate-slide-up">
                {/* BHP & 0-60 & Top Speed */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">BHP (Horsepower)</label>
                    <input
                      type="number"
                      className="glass-input text-xs"
                      value={bhp}
                      onChange={(e) => setBhp(e.target.value)}
                      placeholder="e.g. 503"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">0-60 mph (sec)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="glass-input text-xs"
                      value={zeroToSixty}
                      onChange={(e) => setZeroToSixty(e.target.value)}
                      placeholder="e.g. 3.4"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Top Speed (mph)</label>
                    <input
                      type="number"
                      className="glass-input text-xs"
                      value={topSpeed}
                      onChange={(e) => setTopSpeed(e.target.value)}
                      placeholder="e.g. 180"
                    />
                  </div>
                </div>

                {/* Mileage/Range & Fuel/Battery Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mileage / Range</label>
                    <input
                      className="glass-input text-xs"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="e.g. 24 MPG or 315 Mi Range"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fuel / Battery Pack</label>
                    <input
                      className="glass-input text-xs"
                      value={fuelCapacity}
                      onChange={(e) => setFuelCapacity(e.target.value)}
                      placeholder="e.g. 16.9 Gal or 82 kWh"
                    />
                  </div>
                </div>

                {/* Transmission & Drivetrain */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transmission</label>
                    <input
                      className="glass-input text-xs"
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      placeholder="e.g. 8-Speed PDK / Single-Speed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Drivetrain</label>
                    <input
                      className="glass-input text-xs"
                      value={drivetrain}
                      onChange={(e) => setDrivetrain(e.target.value)}
                      placeholder="e.g. AWD, RWD, FWD"
                    />
                  </div>
                </div>

                {/* Engine Type, Curb Weight & Seating */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seating</label>
                    <input
                      type="number"
                      className="glass-input text-xs"
                      value={seating}
                      onChange={(e) => setSeating(e.target.value)}
                      placeholder="e.g. 5"
                      min="1"
                      max="12"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Curb Weight</label>
                    <input
                      className="glass-input text-xs"
                      value={curbWeight}
                      onChange={(e) => setCurbWeight(e.target.value)}
                      placeholder="e.g. 3,880 lbs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Engine / Motor Architecture</label>
                  <input
                    className="glass-input text-xs"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder="e.g. 3.0L Twin-Turbo Flat-6 / Dual Permanent Magnet"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-200">
            <button type="button" className="btn-glass bg-white flex-1 py-2.5 border-slate-200 text-slate-700" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 py-2.5 font-bold" disabled={loading}>
              {loading ? 'Saving Vehicle...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
