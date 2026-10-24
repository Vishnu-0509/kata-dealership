import { useState, FormEvent } from 'react';
import { Vehicle } from '../../api/client';

interface Props {
  initial?: Partial<Vehicle>;
  onSubmit: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
  title: string;
}

/**
 * VehicleForm — reusable form for creating and editing vehicles.
 */
export function VehicleForm({ initial, onSubmit, onCancel, loading, title }: Props) {
  const [make, setMake] = useState(initial?.make || '');
  const [model, setModel] = useState(initial?.model || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [price, setPrice] = useState(String(initial?.price || ''));
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      make,
      model,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    });
  };

  const categories = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Convertible', 'Electric'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                className="input-field"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                className="input-field"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Corolla"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                className="input-field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="5"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
