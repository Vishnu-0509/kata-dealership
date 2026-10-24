import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the purchase hook
vi.mock('../hooks/useVehicles', () => ({
  usePurchaseVehicle: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

const mockVehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  year: 2024,
  price: 25000,
  quantity: 3,
  imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('VehicleCard', () => {
  it('renders vehicle details correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin={false} />, { wrapper });
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText(/Sedan/i)).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument();
  });

  it('shows purchase button when in stock', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin={false} />, { wrapper });
    const btn = screen.getByRole('button', { name: /purchase/i });
    expect(btn).not.toBeDisabled();
  });

  it('disables purchase button when out of stock', () => {
    render(
      <VehicleCard vehicle={{ ...mockVehicle, quantity: 0 }} isAdmin={false} />,
      { wrapper }
    );
    const btn = screen.getByRole('button', { name: /unavailable/i });
    expect(btn).toBeDisabled();
  });

  it('shows admin controls for admin users', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin={true} />, { wrapper });
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+stock/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('hides admin controls for regular users', () => {
    render(<VehicleCard vehicle={mockVehicle} isAdmin={false} />, { wrapper });
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
