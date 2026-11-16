import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { PasswordInput } from '../features/auth/components/PasswordInput';
import { PasswordStrengthIndicator } from '../features/auth/components/PasswordStrengthIndicator';
import { setAccessToken, getAccessToken } from '../services/apiClient';

describe('Frontend Authentication Architecture (Phase 2)', () => {
  beforeEach(() => {
    // Ensure browser storage is NOT used for auth tokens
    localStorage.clear();
    sessionStorage.clear();
    setAccessToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maintains access token strictly in application memory, never in localStorage or sessionStorage', () => {
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();

    setAccessToken('mock_in_memory_token_12345');
    expect(getAccessToken()).toBe('mock_in_memory_token_12345');

    // Verify localStorage and sessionStorage remain untouched
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();

    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('PasswordInput toggles between password and text when visibility button is clicked', () => {
    render(<PasswordInput label="Secret Key" placeholder="Enter key" />);

    const input = screen.getByPlaceholderText('Enter key') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Show password');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');

    const hideBtn = screen.getByLabelText('Hide password');
    fireEvent.click(hideBtn);
    expect(input.type).toBe('password');
  });

  it('PasswordStrengthIndicator calculates strength levels accurately', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="" />);
    expect(screen.queryByText(/Password strength/i)).toBeNull();

    rerender(<PasswordStrengthIndicator password="weak" />);
    expect(screen.getByText('Weak')).toBeDefined();

    rerender(<PasswordStrengthIndicator password="Password1" />);
    expect(screen.getByText('Medium')).toBeDefined();

    rerender(<PasswordStrengthIndicator password="Password123!#" />);
    expect(screen.getByText('Strong')).toBeDefined();
  });

  it('LoginPage renders essential input fields and submit button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/University \/ Personal Email/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDefined();
    expect(screen.getByText(/Create free student account/i)).toBeDefined();
  });

  it('RegisterPage renders all required registration fields and terms checkbox', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/First Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Last Name/i)).toBeDefined();
    expect(screen.getByLabelText(/University Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Create Strong Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeDefined();
    expect(screen.getByRole('checkbox')).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDefined();
  });
});
