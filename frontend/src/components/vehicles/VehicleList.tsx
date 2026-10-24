import { useState } from 'react';
import { Vehicle } from '../../api/client';
import { VehicleCard } from './VehicleCard';
import { VehicleForm } from './VehicleForm';
import { useDeleteVehicle, useUpdateVehicle, useRestockVehicle, useCreateVehicle } from '../../hooks/useVehicles';

interface Props {
  vehicles: Vehicle[];
  isAdmin: boolean;
}

/**
 * VehicleList — renders a grid of VehicleCards and handles admin CRUD modals.
 */
export function VehicleList({ vehicles, isAdmin }: Props) {
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [restockQty, setRestockQty] = useState('');

  const deleteVehicle = useDeleteVehicle();
  const updateVehicle = useUpdateVehicle();
  const restockMutation = useRestockVehicle();
  const createVehicle = useCreateVehicle();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle.mutate(id);
    }
  };

  const handleUpdate = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editVehicle) return;
    updateVehicle.mutate(
      { id: editVehicle.id, data },
      { onSuccess: () => setEditVehicle(null) }
    );
  };

  const handleRestock = () => {
    if (!restockVehicle) return;
    restockMutation.mutate(
      { id: restockVehicle.id, quantity: parseInt(restockQty, 10) },
      { onSuccess: () => { setRestockVehicle(null); setRestockQty(''); } }
    );
  };

  const handleCreate = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    createVehicle.mutate(data, { onSuccess: () => setShowCreate(false) });
  };

  return (
    <div>
      {/* Admin add button */}
      {isAdmin && (
        <div className="mb-6">
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + Add Vehicle
          </button>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🚘</div>
          <p className="text-lg">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isAdmin={isAdmin}
              onEdit={setEditVehicle}
              onDelete={handleDelete}
              onRestock={setRestockVehicle}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editVehicle && (
        <VehicleForm
          title="Edit Vehicle"
          initial={editVehicle}
          onSubmit={handleUpdate}
          onCancel={() => setEditVehicle(null)}
          loading={updateVehicle.isPending}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <VehicleForm
          title="Add New Vehicle"
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={createVehicle.isPending}
        />
      )}

      {/* Restock modal */}
      {restockVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-1">Restock Vehicle</h2>
            <p className="text-gray-500 text-sm mb-4">
              {restockVehicle.make} {restockVehicle.model} — current stock:{' '}
              <strong>{restockVehicle.quantity}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units to add
            </label>
            <input
              type="number"
              className="input-field mb-4"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="e.g. 10"
              min="1"
            />
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setRestockVehicle(null)}>
                Cancel
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleRestock}
                disabled={!restockQty || parseInt(restockQty) < 1 || restockMutation.isPending}
              >
                {restockMutation.isPending ? 'Restocking…' : 'Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
