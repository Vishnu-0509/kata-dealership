import { useState } from 'react';
import { Vehicle } from '../../api/client';
import { VehicleCard } from './VehicleCard';
import { VehicleTable } from './VehicleTable';
import { VehicleForm } from './VehicleForm';
import { VehicleInspectModal } from './VehicleInspectModal';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { useDeleteVehicle, useUpdateVehicle, useRestockVehicle, useCreateVehicle, usePurchaseVehicle } from '../../hooks/useVehicles';
import { useToast } from '../common/Toast';

interface Props {
  vehicles: Vehicle[];
  isAdmin: boolean;
  isDemo?: boolean;
  viewMode: 'grid' | 'table';
  onOpenCreate: () => void;
  showCreate: boolean;
  onCloseCreate: () => void;
  comparedIds?: string[];
  onToggleCompare?: (vehicle: Vehicle) => void;
}

export function VehicleList({
  vehicles,
  isAdmin,
  isDemo,
  viewMode,
  onOpenCreate,
  showCreate,
  onCloseCreate,
  comparedIds = [],
  onToggleCompare,
}: Props) {
  const { showToast } = useToast();
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  const [purchaseTarget, setPurchaseTarget] = useState<Vehicle | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDemoAuthModal, setShowDemoAuthModal] = useState(false);
  const [restockQty, setRestockQty] = useState('5');

  const deleteVehicle = useDeleteVehicle();
  const updateVehicle = useUpdateVehicle();
  const restockMutation = useRestockVehicle();
  const createVehicle = useCreateVehicle();
  const purchaseMutation = usePurchaseVehicle();

  // Handle Delete
  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteVehicle.mutate(deleteTargetId, {
      onSuccess: () => {
        showToast('success', 'Vehicle Deleted', 'The vehicle was removed from inventory.');
        setDeleteTargetId(null);
        if (inspectVehicle?.id === deleteTargetId) setInspectVehicle(null);
      },
      onError: () => {
        showToast('error', 'Delete Failed', 'Could not delete the vehicle.');
      },
    });
  };

  // Handle Update
  const handleUpdate = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editVehicle) return;
    updateVehicle.mutate(
      { id: editVehicle.id, data },
      {
        onSuccess: (updated) => {
          showToast('success', 'Vehicle Updated', `${updated.make} ${updated.model} details saved.`);
          setEditVehicle(null);
          if (inspectVehicle?.id === updated.id) setInspectVehicle(updated);
        },
        onError: () => {
          showToast('error', 'Update Failed', 'Failed to save changes.');
        },
      }
    );
  };

  // Handle Restock
  const handleRestock = () => {
    if (!restockVehicle) return;
    const qty = parseInt(restockQty, 10);
    restockMutation.mutate(
      { id: restockVehicle.id, quantity: qty },
      {
        onSuccess: (res) => {
          showToast('success', 'Stock Replenished', `Added ${qty} units to ${restockVehicle.make} ${restockVehicle.model}.`);
          setRestockVehicle(null);
          setRestockQty('5');
          if (inspectVehicle?.id === restockVehicle.id) setInspectVehicle(res.vehicle);
        },
        onError: () => {
          showToast('error', 'Restock Error', 'Could not restock vehicle.');
        },
      }
    );
  };

  // Handle Create
  const handleCreate = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    createVehicle.mutate(data, {
      onSuccess: (created) => {
        showToast('success', 'Vehicle Added', `${created.make} ${created.model} is now live in inventory.`);
        onCloseCreate();
      },
      onError: () => {
        showToast('error', 'Creation Error', 'Could not create new vehicle.');
      },
    });
  };

  // Handle Purchase Confirm
  const handleConfirmPurchase = () => {
    if (!purchaseTarget) return;
    if (isDemo) {
      setPurchaseTarget(null);
      setShowDemoAuthModal(true);
      return;
    }
    purchaseMutation.mutate(purchaseTarget.id, {
      onSuccess: (res) => {
        showToast('success', 'Purchase Complete!', `Order confirmed for ${res.vehicle.make} ${res.vehicle.model}. Remaining stock: ${res.vehicle.quantity}.`);
        setPurchaseTarget(null);
        if (inspectVehicle?.id === res.vehicle.id) setInspectVehicle(res.vehicle);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        showToast('error', 'Purchase Failed', msg || 'Vehicle might be out of stock.');
      },
    });
  };

  return (
    <div>
      {/* Empty State vs Inventory Content */}
      {vehicles.length === 0 ? (
        <div className="glass-card py-20 text-center border-dashed border-slate-300 bg-white">
          <div className="text-6xl mb-4 animate-pulse-subtle">🚘</div>
          <h3 className="text-xl font-bold text-slate-900">No vehicles found</h3>
          <p className="text-slate-600 text-sm mt-1 max-w-sm mx-auto">
            No inventory items matched your active search filters. Try clearing criteria or adding new inventory.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenCreate}
                className="btn-primary text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 shadow-md shadow-teal-500/20"
              >
                <span>+</span> Add New Vehicle
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isAdmin={isAdmin}
              isDemo={isDemo}
              onEdit={setEditVehicle}
              onDelete={setDeleteTargetId}
              onRestock={setRestockVehicle}
              onInspect={setInspectVehicle}
              onPurchaseRequest={setPurchaseTarget}
              isPurchasing={purchaseMutation.isPending && purchaseTarget?.id === v.id}
              isCompared={comparedIds.includes(v.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          isAdmin={isAdmin}
          isDemo={isDemo}
          onEdit={setEditVehicle}
          onDelete={setDeleteTargetId}
          onRestock={setRestockVehicle}
          onInspect={setInspectVehicle}
          onPurchaseRequest={setPurchaseTarget}
          comparedIds={comparedIds}
          onToggleCompare={onToggleCompare}
        />
      )}

      {/* Inspect & Rev Exhaust Modal */}
      {inspectVehicle && (
        <VehicleInspectModal
          vehicle={inspectVehicle}
          onClose={() => setInspectVehicle(null)}
          onPurchase={(v) => {
            setPurchaseTarget(v);
          }}
          isPurchasing={purchaseMutation.isPending && purchaseTarget?.id === inspectVehicle.id}
        />
      )}

      {/* Purchase Confirmation Modal */}
      {purchaseTarget && (
        <PurchaseConfirmModal
          vehicle={purchaseTarget}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setPurchaseTarget(null)}
          isProcessing={purchaseMutation.isPending}
        />
      )}

      {/* Edit Vehicle Modal */}
      {editVehicle && (
        <VehicleForm
          title="Edit Vehicle Specs & Media"
          initial={editVehicle}
          onSubmit={handleUpdate}
          onCancel={() => setEditVehicle(null)}
          loading={updateVehicle.isPending}
        />
      )}

      {/* Create Vehicle Modal */}
      {showCreate && (
        <VehicleForm
          title="Add New Vehicle to Inventory"
          onSubmit={handleCreate}
          onCancel={onCloseCreate}
          loading={createVehicle.isPending}
        />
      )}

      {/* Restock Inventory Modal */}
      {restockVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-slide-up">
          <div 
            className="glass-panel w-full max-w-sm p-6 border border-cyan-500/30 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📦</span> Restock Vehicle
              </h2>
              <button onClick={() => setRestockVehicle(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-slate-300 text-xs">
              Replenishing stock for{' '}
              <strong className="text-white font-semibold">
                {restockVehicle.make} {restockVehicle.model}
              </strong>
              . Current active inventory:{' '}
              <span className="text-cyan-400 font-bold">{restockVehicle.quantity} units</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Additional Units to Add
              </label>
              <input
                type="number"
                className="glass-input"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                min="1"
                placeholder="e.g. 5"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="btn-glass flex-1 py-2 text-xs"
                onClick={() => setRestockVehicle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1 py-2 text-xs font-bold"
                onClick={handleRestock}
                disabled={!restockQty || parseInt(restockQty, 10) < 1 || restockMutation.isPending}
              >
                {restockMutation.isPending ? 'Restocking…' : 'Confirm Restock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-slide-up">
          <div 
            className="glass-panel w-full max-w-sm p-6 border border-rose-500/40 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-2xl flex items-center justify-center mx-auto">
              🗑️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Vehicle</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently remove this vehicle from the inventory system? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="btn-glass flex-1 py-2 text-xs"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-glass flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                onClick={confirmDelete}
                disabled={deleteVehicle.isPending}
              >
                {deleteVehicle.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Client Purchase View-Only Modal */}
      {showDemoAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-slide-up">
          <div
            className="glass-panel w-full max-w-md p-6 border border-cyan-500/40 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-3xl flex items-center justify-center mx-auto">
              🔒
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sign In Required to Make Changes</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                You are currently exploring the showroom in <strong>Client Demo mode (view-only)</strong>. To purchase vehicles, reserve inventory, or perform account actions, please sign in with your customer account or create one.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="btn-glass flex-1 py-2.5 text-xs font-semibold"
                onClick={() => setShowDemoAuthModal(false)}
              >
                Continue Demo
              </button>
              <button
                type="button"
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Sign In to Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
