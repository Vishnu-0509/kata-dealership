import { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { VehicleList } from '../components/vehicles/VehicleList';
import { ContactSupportModal } from '../components/support/ContactSupportModal';
import { AboutModal } from '../components/about/AboutModal';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const { data: allVehicles = [], isLoading, isError, refetch } = useVehicles();

  const categories = ['All', 'Coupe', 'Electric', 'SUV', 'Sedan', 'Truck', 'Van'];

  // Calculate live fleet metrics
  const metrics = useMemo(() => {
    const totalVehicles = allVehicles.reduce((acc, v) => acc + v.quantity, 0);
    const totalValue = allVehicles.reduce((acc, v) => acc + v.price * v.quantity, 0);
    const outOfStockCount = allVehicles.filter((v) => v.quantity === 0).length;
    const modelCount = allVehicles.length;

    return { totalVehicles, totalValue, outOfStockCount, modelCount };
  }, [allVehicles]);

  // Instant client-side filtering and sorting
  const filteredVehicles = useMemo(() => {
    return allVehicles
      .filter((v) => {
        // Search term (Make or Model)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchMake = v.make.toLowerCase().includes(q);
          const matchModel = v.model.toLowerCase().includes(q);
          if (!matchMake && !matchModel) return false;
        }

        // Category pill
        if (selectedCategory !== 'All' && v.category !== selectedCategory) {
          return false;
        }

        // Price boundaries
        if (minPrice && v.price < parseFloat(minPrice)) return false;
        if (maxPrice && v.price > parseFloat(maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-desc') return b.quantity - a.quantity;
        if (sortBy === 'make-asc') return a.make.localeCompare(b.make);
        return 0; // featured (default)
      });
  }, [allVehicles, searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'featured';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative flex flex-col justify-between">
      {/* Ambient Lighting & Glow */}
      <div className="ambient-glow" />

      <div>
        <Navbar
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenContact={() => setShowContactModal(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
          {/* Hero Section with Live Backdrop Vibe */}
          <div className="glass-panel p-6 sm:p-8 relative overflow-hidden border border-cyan-500/20 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <span className="badge-glass bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-bold tracking-wider uppercase">
                  ✦ Precision Engineering Showcase
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Curated Automotive Inventory
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Explore high-performance sports cars, luxury electric vehicles, and rugged SUVs. Listen to realistic exhaust acoustics and complete transparent purchases online.
                </p>

                {/* Quick Contact & Hotline Banner */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <a
                    href="tel:+18005552739"
                    className="badge-glass bg-white/5 hover:bg-cyan-500/10 text-cyan-300 border-white/10 transition-colors"
                  >
                    📞 Call Sales: +1 (800) 555-KATA
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(true)}
                    className="badge-glass bg-white/5 hover:bg-cyan-500/10 text-slate-300 border-white/10 transition-colors"
                  >
                    ✉️ Concierge Support Desk
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAboutModal(true)}
                    className="badge-glass bg-white/5 hover:bg-cyan-500/10 text-slate-300 border-white/10 transition-colors"
                  >
                    🛡️ 150-Point Inspection Warranty
                  </button>
                </div>
              </div>

              {/* Quick Action Button for Admin */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-cyan-500/30"
                  >
                    <span>✨</span> Add New Vehicle
                  </button>
                </div>
              )}
            </div>

            {/* Real-time Fleet Metrics Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 border-white/5 bg-slate-950/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fleet Units</p>
                <p className="text-2xl font-black text-white mt-1">{metrics.totalVehicles}</p>
              </div>
              <div className="glass-card p-4 border-white/5 bg-slate-950/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Portfolio Value</p>
                <p className="text-2xl font-black text-cyan-400 mt-1">${(metrics.totalValue / 1000).toFixed(1)}k</p>
              </div>
              <div className="glass-card p-4 border-white/5 bg-slate-950/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available Models</p>
                <p className="text-2xl font-black text-slate-200 mt-1">{metrics.modelCount}</p>
              </div>
              <div className="glass-card p-4 border-white/5 bg-slate-950/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
                <p className={`text-2xl font-black mt-1 ${metrics.outOfStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {metrics.outOfStockCount}
                </p>
              </div>
            </div>
          </div>

          {/* Category Pills Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 backdrop-blur-md border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {cat === 'All' ? '🚘 All Fleet' : cat}
                </button>
              );
            })}
          </div>

          {/* Comprehensive Filter & Controls Bar */}
          <div className="glass-panel p-5 border border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Live Search Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 text-xs">🔍</span>
                <input
                  className="glass-input pl-9"
                  placeholder="Search make or model (e.g. Porsche, Tesla)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Min Price */}
              <div>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="Min Price ($ USD)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
              </div>

              {/* Max Price */}
              <div>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="Max Price ($ USD)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>

              {/* Sorting Dropdown */}
              <div>
                <select
                  className="glass-input bg-slate-950 text-slate-200"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured" className="bg-slate-900">Sort: Featured</option>
                  <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
                  <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
                  <option value="stock-desc" className="bg-slate-900">Stock: Most Available</option>
                  <option value="make-asc" className="bg-slate-900">Make: A to Z</option>
                </select>
              </div>
            </div>

            {/* View Mode & Filter Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong className="text-white font-bold">{filteredVehicles.length}</strong> of{' '}
                  {allVehicles.length} models
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>▦</span> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'table'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>☰</span> Table
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="glass-card py-24 text-center">
              <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-400">Connecting to showroom inventory...</p>
            </div>
          ) : isError ? (
            <div className="glass-card py-16 text-center border-rose-500/30">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white">Connection Error</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">Could not retrieve live inventory from backend.</p>
              <button onClick={() => refetch()} className="btn-primary py-2 px-5 text-xs">
                Retry Connection
              </button>
            </div>
          ) : (
            <VehicleList
              vehicles={filteredVehicles}
              isAdmin={isAdmin}
              viewMode={viewMode}
              onOpenCreate={() => setShowCreateModal(true)}
              showCreate={showCreateModal}
              onCloseCreate={() => setShowCreateModal(false)}
            />
          )}
        </main>
      </div>

      {/* Footer with Contact, Mail, Phone, About Links */}
      <Footer
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenContact={() => setShowContactModal(true)}
      />

      {/* Contact Support Modal */}
      {showContactModal && (
        <ContactSupportModal onClose={() => setShowContactModal(false)} />
      )}

      {/* About Heritage Modal */}
      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
          onOpenContact={() => setShowContactModal(true)}
        />
      )}
    </div>
  );
}
