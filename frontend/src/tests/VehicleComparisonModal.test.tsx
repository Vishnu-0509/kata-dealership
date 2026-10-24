import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleComparisonModal } from '../components/vehicles/VehicleComparisonModal';
import { Vehicle } from '../api/client';

const mockVehicles: Vehicle[] = [
  {
    id: 'car-1',
    make: 'Porsche',
    model: '911 Carrera',
    category: 'Coupe',
    year: 2024,
    price: 114400,
    quantity: 2,
    bhp: 379,
    zeroToSixty: 3.8,
    topSpeed: 182,
    mileage: '18 City / 24 Hwy MPG',
    fuelCapacity: '16.9 Gallons',
    transmission: '8-Speed Dual-Clutch (PDK)',
    drivetrain: 'Rear-Wheel Drive (RWD)',
    seating: 4,
    engine: '3.0L Twin-Turbo Flat-6',
    curbWeight: '3,354 lbs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'car-2',
    make: 'BMW',
    model: 'M4 Competition',
    category: 'Coupe',
    year: 2024,
    price: 82200,
    quantity: 1,
    bhp: 503,
    zeroToSixty: 3.4,
    topSpeed: 180,
    mileage: '16 City / 23 Hwy MPG',
    fuelCapacity: '15.6 Gallons',
    transmission: '8-Speed M Steptronic',
    drivetrain: 'Rear-Wheel Drive (RWD)',
    seating: 4,
    engine: '3.0L Twin-Turbo Inline-6',
    curbWeight: '3,880 lbs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'car-3',
    make: 'Tesla',
    model: 'Model 3 Performance',
    category: 'Electric',
    year: 2024,
    price: 52990,
    quantity: 4,
    bhp: 510,
    zeroToSixty: 2.9,
    topSpeed: 163,
    mileage: '303 Miles Range',
    fuelCapacity: '82 kWh Lithium-Ion',
    transmission: 'Single-Speed Fixed Gear',
    drivetrain: 'Dual-Motor AWD',
    seating: 5,
    engine: 'Dual Electric Motors',
    curbWeight: '4,054 lbs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('VehicleComparisonModal', () => {
  it('renders side-by-side comparison matrix with vehicles and specifications', () => {
    const onPurchase = vi.fn();
    const onClose = vi.fn();

    render(
      <VehicleComparisonModal
        allVehicles={mockVehicles}
        initialSelectedIds={['car-1', 'car-2']}
        onClose={onClose}
        onPurchase={onPurchase}
      />
    );

    // Modal Title & Header
    expect(screen.getByText(/Vehicle Specifications & Comparison Matrix/i)).toBeInTheDocument();
    
    // Check cars are displayed
    expect(screen.getByText(/Porsche 911 Carrera/i)).toBeInTheDocument();
    expect(screen.getByText(/BMW M4 Competition/i)).toBeInTheDocument();

    // Check engineering specs rows
    expect(screen.getByText(/Horsepower \(BHP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/0 – 60 mph Acceleration/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Speed/i)).toBeInTheDocument();
    expect(screen.getByText(/Mileage \/ Range/i)).toBeInTheDocument();
    expect(screen.getByText(/Fuel \/ Battery Capacity/i)).toBeInTheDocument();

    // Values
    expect(screen.getByText(/379/)).toBeInTheDocument();
    expect(screen.getByText(/503/)).toBeInTheDocument();
    expect(screen.getByText(/18 City \/ 24 Hwy MPG/i)).toBeInTheDocument();
  });

  it('triggers onPurchase when clicking purchase vehicle button in comparison table', () => {
    const onPurchase = vi.fn();
    const onClose = vi.fn();

    render(
      <VehicleComparisonModal
        allVehicles={mockVehicles}
        initialSelectedIds={['car-1']}
        onClose={onClose}
        onPurchase={onPurchase}
      />
    );

    const purchaseButtons = screen.getAllByRole('button', { name: /purchase vehicle/i });
    expect(purchaseButtons.length).toBeGreaterThan(0);

    fireEvent.click(purchaseButtons[0]);
    expect(onPurchase).toHaveBeenCalledWith(mockVehicles[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('allows adding and removing vehicles from comparison matrix', () => {
    const onPurchase = vi.fn();
    const onClose = vi.fn();

    render(
      <VehicleComparisonModal
        allVehicles={mockVehicles}
        initialSelectedIds={['car-1', 'car-2']}
        onClose={onClose}
        onPurchase={onPurchase}
      />
    );

    // Remove car-2
    const removeButtons = screen.getAllByTitle('Remove from comparison');
    fireEvent.click(removeButtons[0]);

    // Add car-3
    const addCar3Button = screen.getByRole('button', { name: /\+.*Tesla Model 3/i });
    fireEvent.click(addCar3Button);

    expect(screen.getByText(/Tesla Model 3 Performance/i)).toBeInTheDocument();
  });
});
