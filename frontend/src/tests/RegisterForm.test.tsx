import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from '../components/auth/RegisterForm';
import { BrowserRouter } from 'react-router-dom';

const mockRegister = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    isAdmin: false,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RegisterForm', () => {
  it('renders registration form inputs', () => {
    renderWithRouter(<RegisterForm />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderWithRouter(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), {
      target: { value: 'mismatch123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits registration successfully when passwords match', async () => {
    mockRegister.mockResolvedValueOnce({ id: '2', email: 'valid@test.com', role: 'USER' });
    renderWithRouter(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'valid@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('valid@test.com', 'password123');
    });
  });
});
