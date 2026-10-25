import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleInspectModal } from '../components/vehicles/VehicleInspectModal';

const mockVehicle = {
  id: 'v-101',
  make: 'Toyota',
  model: 'RAV4 Hybrid',
  category: 'SUV',
  year: 2024,
  price: 34500,
  quantity: 5,
  imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('VehicleInspectModal Popup and Close Button Accessibility (TDD Red)', () => {
  it('renders a prominent, high-contrast close button that calls onClose when clicked', () => {
    const handleClose = vi.fn();
    render(
      <VehicleInspectModal
        vehicle={mockVehicle}
        onClose={handleClose}
        onPurchase={vi.fn()}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toBeInTheDocument();
    
    // Must be high-contrast white with dark text so it is clearly visible over dark car images
    expect(closeButton.className).toContain('bg-white');
    expect(closeButton.className).toContain('text-slate-900');

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('dismisses the modal when clicking the backdrop outside the modal dialog', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <VehicleInspectModal
        vehicle={mockVehicle}
        onClose={handleClose}
        onPurchase={vi.fn()}
      />
    );

    // The backdrop overlay should have an onClick handler to close
    const backdrop = document.querySelector('[data-testid="inspect-modal-backdrop"]') || container.firstChild;
    expect(backdrop).toBeTruthy();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('dismisses the modal when pressing the Escape key', () => {
    const handleClose = vi.fn();
    render(
      <VehicleInspectModal
        vehicle={mockVehicle}
        onClose={handleClose}
        onPurchase={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders via React Portal to document.body with z-[60] so it overlays the top navbar', () => {
    const { container } = render(
      <div id="nested-main-container">
        <VehicleInspectModal
          vehicle={mockVehicle}
          onClose={vi.fn()}
          onPurchase={vi.fn()}
        />
      </div>
    );

    // Should NOT be rendered inside the nested parent div, but portaled to document.body
    expect(container.querySelector('[data-testid="inspect-modal-backdrop"]')).toBeNull();

    // Backdrop must exist directly under document.body with z-[60]
    const portalBackdrop = document.body.querySelector('[data-testid="inspect-modal-backdrop"]');
    expect(portalBackdrop).toBeTruthy();
    expect(portalBackdrop?.className).toContain('z-[60]');
  });
});
