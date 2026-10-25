import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../components/auth/LoginForm';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAdmin: false,
    isDemo: false,
  }),
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
};

describe('LoginForm Clearer Fields and Accessibility (TDD Red)', () => {
  it('renders visible labels for username or email and password', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders required empty-field placeholders and removes dot placeholder', () => {
    renderLoginForm();

    const identifierInput = screen.getByPlaceholderText('Enter username or email');
    const passwordInput = screen.getByPlaceholderText('Enter password');

    expect(identifierInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    // Verify old decorative dots placeholder is completely removed
    expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument();
  });

  it('provides an accessible Show/Hide password toggle button', () => {
    renderLoginForm();

    const passwordInput = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Find the toggle button
    const toggleBtn = screen.getByRole('button', { name: /show password|hide password/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to show password
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    // Click again to hide password
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('submits username or email and password correctly', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();

    const identifierInput = screen.getByPlaceholderText('Enter username or email');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: 'admin_user' } });
    fireEvent.change(passwordInput, { target: { value: 'secretpass' } });
    fireEvent.click(submitBtn);

    expect(mockLogin).toHaveBeenCalledWith('admin_user', 'secretpass');
  });
});
