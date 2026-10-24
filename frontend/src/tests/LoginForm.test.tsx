import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../components/auth/LoginForm';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAdmin: false,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('LoginForm', () => {
  it('renders login form inputs and submit button', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits form with entered email and password', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@dealership.com', role: 'USER' });
    renderWithRouter(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@dealership.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@dealership.com', 'secret123');
    });
  });

  it('displays error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unauthorized'));
    renderWithRouter(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'wrong@dealership.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
