import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Vehicle360Viewer } from '../components/vehicles/Vehicle360Viewer';
import { VehicleInspectModal } from '../components/vehicles/VehicleInspectModal';

const samplePorscheAngles = [
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550855909-c4f6798dd77f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
];

const mockPorscheWith360 = {
  id: 'porsche-360',
  make: 'Porsche',
  model: '911 Carrera',
  category: 'Coupe',
  year: 2024,
  price: 114400,
  quantity: 2,
  imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
  images360: JSON.stringify(samplePorscheAngles),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCarWithout360 = {
  id: 'car-no-360',
  make: 'Toyota',
  model: 'RAV4 Hybrid',
  category: 'SUV',
  year: 2024,
  price: 34500,
  quantity: 8,
  imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
  images360: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('360 Degree Viewer Enhancements & Preloading (TDD Red)', () => {
  it('renders interactive 360 studio by default when a product has 360 angles', () => {
    render(
      <VehicleInspectModal
        vehicle={mockPorscheWith360}
        onClose={() => {}}
        onPurchase={() => {}}
      />
    );

    // Should indicate the 360 studio with angle count
    expect(screen.getByText(/360° Studio \(5 Angles\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Angle 1 \/ 5/i)).toBeInTheDocument();
  });

  it('renders a disabled or clearly labeled unavailable badge on the 360 tab when a product lacks 360 angles', () => {
    render(
      <VehicleInspectModal
        vehicle={mockCarWithout360}
        onClose={() => {}}
        onPurchase={() => {}}
      />
    );

    // For single-image vehicles, 360 studio button should be disabled or marked unavailable
    const tab360 = screen.getByRole('button', { name: /360° Studio/i });
    expect(tab360).toBeDisabled();
    expect(tab360.textContent).toContain('Unavailable');
  });

  it('rotates angle smoothly using pointer events with touchAction none', () => {
    render(
      <Vehicle360Viewer
        images={samplePorscheAngles}
        fallbackImageUrl={samplePorscheAngles[0]}
        vehicleName="Porsche 911"
      />
    );

    const container = screen.getByTestId('viewer-360-container');
    expect(container.className).toContain('touch-none');

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', samplePorscheAngles[0]);

    // Drag forward via pointer events
    fireEvent.pointerDown(container, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(container, { clientX: 170, pointerId: 1 });
    fireEvent.pointerUp(container, { pointerId: 1 });

    expect(img).toHaveAttribute('src', samplePorscheAngles[1]);
  });
});
