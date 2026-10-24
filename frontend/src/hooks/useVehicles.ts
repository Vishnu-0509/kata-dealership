import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi, VehicleFilters } from '../api/client';

/**
 * Hook for fetching all vehicles.
 */
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll().then((r) => r.data),
  });
}

/**
 * Hook for searching vehicles with filters.
 */
export function useVehicleSearch(filters: VehicleFilters) {
  const hasFilters = Object.values(filters).some((v) => v && v.trim() !== '');

  return useQuery({
    queryKey: ['vehicles', 'search', filters],
    queryFn: () => vehicleApi.search(filters).then((r) => r.data),
    enabled: hasFilters,
  });
}

/**
 * Hook to purchase a vehicle (decrement quantity).
 */
export function usePurchaseVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleApi.purchase(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

/**
 * Hook to create a new vehicle (Admin only).
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof vehicleApi.create>[0]) =>
      vehicleApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

/**
 * Hook to update a vehicle (Admin only).
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof vehicleApi.update>[1] }) =>
      vehicleApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

/**
 * Hook to delete a vehicle (Admin only).
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

/**
 * Hook to restock a vehicle (Admin only).
 */
export function useRestockVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      vehicleApi.restock(id, quantity).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
