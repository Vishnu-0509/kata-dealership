import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleList } from '../components/vehicles/VehicleList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../hooks/useVehicles', () => ({
  useDeleteVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useRestockVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  usePurchaseVehicle: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../components/common/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('VehicleList Empty State & Modal Rendering (TDD)', () => {
  it('renders the create vehicle modal even when vehicles array is empty', () => {
    const handleClose = vi.fn();
    const handleOpen = vi.fn();

    render(
      <VehicleList
        vehicles={[]}
        isAdmin={true}
        viewMode="grid"
        showCreate={true}
        onOpenCreate={handleOpen}
        onCloseCreate={handleClose}
      />,
      { wrapper }
    );

    // The modal title should be in the document despite 0 vehicles in inventory
    expect(screen.getByText('Add New Vehicle to Inventory')).toBeInTheDocument();
  });

  it('provides an Add Vehicle button in the empty inventory view for admins', () => {
    const handleOpen = vi.fn();

    render(
      <VehicleList
        vehicles={[]}
        isAdmin={true}
        viewMode="grid"
        showCreate={false}
        onOpenCreate={handleOpen}
        onCloseCreate={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.getByText(/no vehicles found/i)).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: /add (new|first) vehicle/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
