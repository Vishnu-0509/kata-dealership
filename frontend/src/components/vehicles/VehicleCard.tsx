import { Vehicle } from '../../api/client';
import { usePurchaseVehicle } from '../../hooks/useVehicles';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (vehicle: Vehicle) => void;
}

/**
 * VehicleCard — displays a single vehicle's details with purchase/admin actions.
 */
export function VehicleCard({ vehicle, isAdmin, onEdit, onDelete, onRestock }: Props) {
  const purchase = usePurchaseVehicle();

  const handlePurchase = () => {
    purchase.mutate(vehicle.id);
  };

  const stockColor =
    vehicle.quantity === 0
      ? 'text-red-600 bg-red-50'
      : vehicle.quantity < 3
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-green-600 bg-green-50';

  return (
    <div className="card flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {vehicle.category}
          </span>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stockColor}`}>
          {vehicle.quantity === 0 ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      {/* Price */}
      <div className="text-2xl font-bold text-blue-700">
        ${vehicle.price.toLocaleString()}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          className="btn-primary w-full"
          onClick={handlePurchase}
          disabled={vehicle.quantity === 0 || purchase.isPending}
        >
          {purchase.isPending ? 'Processing…' : vehicle.quantity === 0 ? 'Unavailable' : '🛒 Purchase'}
        </button>

        {purchase.isError && (
          <p className="text-red-500 text-xs text-center">Purchase failed. Try again.</p>
        )}
        {purchase.isSuccess && (
          <p className="text-green-600 text-xs text-center">✓ Purchased successfully!</p>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <button
              className="btn-secondary flex-1 text-sm"
              onClick={() => onEdit?.(vehicle)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn-secondary flex-1 text-sm"
              onClick={() => onRestock?.(vehicle)}
            >
              📦 Restock
            </button>
            <button
              className="btn-danger flex-1 text-sm"
              onClick={() => onDelete?.(vehicle.id)}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
