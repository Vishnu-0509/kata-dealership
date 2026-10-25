import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

let mockAuth = {
  isAdmin: false,
  isDemo: false,
  user: { id: 'user-1', email: 'user@dealership.com', role: 'USER' },
  logout: vi.fn(),
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../hooks/useVehicles', () => ({
  useVehicles: () => ({
    data: [
      {
        id: 'v1',
        make: 'Porsche',
        model: '911 Carrera',
        category: 'Coupe',
        price: 114000,
        quantity: 2,
        year: 2024,
      },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  usePurchaseVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useRestockVehicle: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateVehicle: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../components/common/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const renderDashboard = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Portfolio & Financial Metrics Visibility (TDD)', () => {
  it('hides Portfolio Value from registered customer users', () => {
    mockAuth = {
      isAdmin: false,
      isDemo: false,
      user: { id: 'cust-1', email: 'customer@test.com', role: 'USER' },
      logout: vi.fn(),
    };

    renderDashboard();

    // Customers should NOT see dealership portfolio financial summaries
    expect(screen.queryByText(/portfolio value/i)).not.toBeInTheDocument();
  });

  it('hides Portfolio Value from demo client users', () => {
    mockAuth = {
      isAdmin: false,
      isDemo: true,
      user: { id: 'demo-1', email: 'demo@dealership.com', role: 'DEMO' },
      logout: vi.fn(),
    };

    renderDashboard();

    expect(screen.queryByText(/portfolio value/i)).not.toBeInTheDocument();
  });

  it('displays Portfolio Value to administrator users for dealership management', () => {
    mockAuth = {
      isAdmin: true,
      isDemo: false,
      user: { id: 'admin-1', email: 'admin@dealership.com', role: 'ADMIN' },
      logout: vi.fn(),
    };

    renderDashboard();

    expect(screen.getByText(/portfolio value/i)).toBeInTheDocument();
  });
});
