import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { VehicleList } from '../components/vehicles/VehicleList';
import { useVehicles, useVehicleSearch } from '../hooks/useVehicles';
import { useAuth } from '../hooks/useAuth';
import { VehicleFilters } from '../api/client';

/**
 * DashboardPage — main inventory view with search/filter controls.
 */
export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [searchInput, setSearchInput] = useState({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });

  const hasFilters = Object.values(filters).some((v) => v && v.trim() !== '');

  const allVehicles = useVehicles();
  const searchResults = useVehicleSearch(filters);

  const vehicles = hasFilters ? (searchResults.data ?? []) : (allVehicles.data ?? []);
  const isLoading = hasFilters ? searchResults.isLoading : allVehicles.isLoading;
  const isError = hasFilters ? searchResults.isError : allVehicles.isError;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const active: VehicleFilters = {};
    if (searchInput.make) active.make = searchInput.make;
    if (searchInput.model) active.model = searchInput.model;
    if (searchInput.category) active.category = searchInput.category;
    if (searchInput.minPrice) active.minPrice = searchInput.minPrice;
    if (searchInput.maxPrice) active.maxPrice = searchInput.maxPrice;
    setFilters(active);
  };

  const handleClear = () => {
    setSearchInput({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });
    setFilters({});
  };

  const categories = ['', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Convertible', 'Electric'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inventory</h1>
          <p className="text-gray-500 mt-1">Browse and purchase available vehicles</p>
        </div>

        {/* Search & Filter Panel */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Make</label>
              <input
                className="input-field"
                placeholder="Toyota…"
                value={searchInput.make}
                onChange={(e) => setSearchInput((s) => ({ ...s, make: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
              <input
                className="input-field"
                placeholder="Corolla…"
                value={searchInput.model}
                onChange={(e) => setSearchInput((s) => ({ ...s, model: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                className="input-field"
                value={searchInput.category}
                onChange={(e) => setSearchInput((s) => ({ ...s, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c || 'All categories'}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={searchInput.minPrice}
                onChange={(e) => setSearchInput((s) => ({ ...s, minPrice: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                className="input-field"
                placeholder="∞"
                value={searchInput.maxPrice}
                onChange={(e) => setSearchInput((s) => ({ ...s, maxPrice: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">🔍 Search</button>
              {hasFilters && (
                <button type="button" className="btn-secondary" onClick={handleClear}>✕ Clear</button>
              )}
            </div>
          </form>

          {hasFilters && (
            <p className="text-sm text-gray-500 mt-3">
              Showing {vehicles.length} result{vehicles.length !== 1 ? 's' : ''} for active filters
            </p>
          )}
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-spin">⚙️</div>
            <p>Loading vehicles…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400">
            <div className="text-4xl mb-3">⚠️</div>
            <p>Failed to load vehicles. Please try again.</p>
          </div>
        ) : (
          <VehicleList vehicles={vehicles} isAdmin={isAdmin} />
        )}
      </main>
    </div>
  );
}
