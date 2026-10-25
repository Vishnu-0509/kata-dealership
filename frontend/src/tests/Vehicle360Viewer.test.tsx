import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Vehicle360Viewer } from '../components/vehicles/Vehicle360Viewer';

const sampleAngles = [
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?angle=0',
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?angle=45',
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?angle=90',
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?angle=135',
];

describe('Vehicle360Viewer Component (TDD Red)', () => {
  it('displays "360° view unavailable" and retains normal photograph when no angles exist', () => {
    render(
      <Vehicle360Viewer
        images={[]}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    expect(screen.getByText(/360° view unavailable/i)).toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-sample.jpg');
  });

  it('renders initial angle frame and angle indicators when sequence is provided', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', sampleAngles[0]);
    expect(screen.getByText(/angle 1 \/ 4/i)).toBeInTheDocument();
  });

  it('cycles through angles using previous and next angle buttons', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const nextBtn = screen.getByRole('button', { name: /next angle/i });
    const prevBtn = screen.getByRole('button', { name: /previous angle/i });
    const img = screen.getByRole('img');

    // Next angle -> frame 2
    fireEvent.click(nextBtn);
    expect(img).toHaveAttribute('src', sampleAngles[1]);
    expect(screen.getByText(/angle 2 \/ 4/i)).toBeInTheDocument();

    // Previous angle -> frame 1
    fireEvent.click(prevBtn);
    expect(img).toHaveAttribute('src', sampleAngles[0]);
  });

  it('rotates via keyboard ArrowLeft and ArrowRight navigation', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const container = screen.getByTestId('viewer-360-container');
    const img = screen.getByRole('img');

    fireEvent.keyDown(container, { key: 'ArrowRight' });
    expect(img).toHaveAttribute('src', sampleAngles[1]);

    fireEvent.keyDown(container, { key: 'ArrowLeft' });
    expect(img).toHaveAttribute('src', sampleAngles[0]);
  });

  it('rotates frames when mouse dragging horizontally', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const container = screen.getByTestId('viewer-360-container');
    const img = screen.getByRole('img');

    // Drag left (startX: 100, move to 70 -> delta -30 -> rotate forward)
    fireEvent.mouseDown(container, { clientX: 100 });
    fireEvent.mouseMove(container, { clientX: 70 });
    fireEvent.mouseUp(container);

    expect(img).toHaveAttribute('src', sampleAngles[1]);
  });

  it('resets rotation angle back to 0 when clicking reset button', () => {
    render(
      <Vehicle360Viewer
        images={sampleAngles}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const nextBtn = screen.getByRole('button', { name: /next angle/i });
    const resetBtn = screen.getByRole('button', { name: /reset angle/i });
    const img = screen.getByRole('img');

    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(img).toHaveAttribute('src', sampleAngles[2]);

    fireEvent.click(resetBtn);
    expect(img).toHaveAttribute('src', sampleAngles[0]);
    expect(screen.getByText(/angle 1 \/ 4/i)).toBeInTheDocument();
  });

  it('shows error state when frame fails to load', () => {
    render(
      <Vehicle360Viewer
        images={['https://invalid-broken-url.com/frame1.jpg']}
        fallbackImageUrl="https://images.unsplash.com/photo-sample.jpg"
        vehicleName="Porsche 911"
      />
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText(/unable to load 360° image/i)).toBeInTheDocument();
  });
});
