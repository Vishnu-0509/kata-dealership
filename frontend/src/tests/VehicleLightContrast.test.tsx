import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VehicleComparisonModal } from '../components/vehicles/VehicleComparisonModal';
import { VehicleForm } from '../components/vehicles/VehicleForm';
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('Light Theme Contrast & Readability (TDD)', () => {
  it('renders comparison matrix vehicle names, prices, and telemetry in high-contrast dark text', () => {
    render(
      <VehicleComparisonModal
        allVehicles={mockVehicles}
        initialSelectedIds={['car-1', 'car-2']}
        onClose={() => {}}
        onPurchase={() => {}}
      />
    );

    // Heading for comparison card
    const porscheTitle = screen.getByRole('heading', { name: /2024 Porsche 911 Carrera/i });
    expect(porscheTitle.className).toMatch(/text-slate-900|text-slate-800/);
    expect(porscheTitle.className).not.toMatch(/\btext-white\b/);

    // Price must not be text-white
    const porschePrice = screen.getByText((content) => content.includes('14,400'));
    expect(porschePrice.className).not.toMatch(/\btext-white\b/);
    expect(porschePrice.className).toMatch(/text-slate-900|text-teal-600|text-slate-800/);

    // Mileage value must not be pale text-slate-200
    const mileageCell = screen.getByText(/18 City \/ 24 Hwy MPG/i);
    expect(mileageCell.className).not.toMatch(/\btext-slate-200\b/);
    expect(mileageCell.className).toMatch(/text-slate-700|text-slate-800|text-slate-900/);
  });

  it('renders VehicleForm field labels with readable dark high-contrast text', () => {
    render(
      <VehicleForm
        title="Add New Vehicle"
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );

    // Check Image URL label
    const imgLabel = screen.getByText(/Vehicle Image URL/i);
    expect(imgLabel.className).not.toMatch(/\btext-slate-300\b/);
    expect(imgLabel.className).toMatch(/text-slate-700|text-slate-800|text-slate-900/);

    // Expand specs
    const expandBtn = screen.getByRole('button', { name: /engineering specifications & telemetry/i });
    fireEvent.click(expandBtn);

    // Check BHP label
    const bhpLabel = screen.getByText(/BHP \(Horsepower\)/i);
    expect(bhpLabel.className).not.toMatch(/\btext-slate-300\b/);
    expect(bhpLabel.className).toMatch(/text-slate-700|text-slate-800|text-slate-900/);
  });
});
