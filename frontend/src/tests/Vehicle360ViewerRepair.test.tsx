import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Vehicle360Viewer } from '../components/vehicles/Vehicle360Viewer';

describe('Vehicle360Viewer Repairs & Robustness (TDD)', () => {
  const sampleAngles = [
    'https://example.com/angle1.jpg',
    'https://example.com/angle2.jpg',
    'https://example.com/angle3.jpg',
  ];

  it('treats a single image as unavailable and falls back to standard photo', () => {
    render(
      <Vehicle360Viewer
        images={['https://example.com/single.jpg']}
        fallbackImageUrl="https://example.com/fallback.jpg"
        vehicleName="Porsche 911"
      />
    );

    // Single image cannot rotate in 360; must show unavailable fallback
    expect(screen.getByText(/360° view unavailable/i)).toBeInTheDocument();
    expect(screen.queryByTestId('viewer-360-container')).not.toBeInTheDocument();
  });

  it('allows navigation away from a failed frame', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://example.com/fallback.jpg"
        vehicleName="Porsche 911"
      />
    );

    const img = screen.getByRole('img');
    // Simulate image load error
    fireEvent.error(img);

    expect(screen.getByText(/unable to load 360° image/i)).toBeInTheDocument();

    // Navigation buttons must remain clickable and allow navigating away
    const nextBtn = screen.getByTitle(/next angle/i);
    fireEvent.click(nextBtn);

    // Navigating to next angle clears the error and loads next frame
    expect(screen.getByText(/angle 2 \/ 3/i)).toBeInTheDocument();
  });

  it('preserves current angle index across parent rerenders with identical images', () => {
    const { rerender } = render(
      <Vehicle360Viewer
        images={[...sampleAngles]}
        fallbackImageUrl="https://example.com/fallback.jpg"
        vehicleName="Porsche 911"
      />
    );

    // Rotate to angle 2
    const nextBtn = screen.getByTitle(/next angle/i);
    fireEvent.click(nextBtn);
    expect(screen.getByText(/angle 2 \/ 3/i)).toBeInTheDocument();

    // Rerender with a new array reference containing identical URLs (e.g. parent sound played)
    rerender(
      <Vehicle360Viewer
        images={[...sampleAngles]}
        fallbackImageUrl="https://example.com/fallback.jpg"
        vehicleName="Porsche 911"
      />
    );

    // Angle must remain at angle 2, NOT reset to 1
    expect(screen.getByText(/angle 2 \/ 3/i)).toBeInTheDocument();
  });
});
