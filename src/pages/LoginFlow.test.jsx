import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';
import Otp from './Otp';

describe('Login & OTP Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders design copy, formats phone number while typing, and keeps Get OTP disabled until 10 digits', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Sign Up to Fastor')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Let us know your mobile number and we will send you an OTP for verification.'
      )
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('00000 00000');
    const submitBtn = screen.getByRole('button', { name: /get otp/i });

    expect(submitBtn).toBeDisabled();

    // Type 5 digits
    await user.type(input, '98189');
    expect(input).toHaveValue('98189');
    expect(submitBtn).toBeDisabled();

    // Type 5 more digits -> auto formats to 5 + space + 5
    await user.type(input, '79450');
    expect(input).toHaveValue('98189 79450');
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows validation error if submitted without a valid 10-digit phone number', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const form = screen
      .getByRole('button', { name: /get otp/i })
      .closest('form');
    fireEvent.submit(form);

    expect(
      screen.getByText('Please enter a valid 10-digit mobile number.')
    ).toBeInTheDocument();
  });

  it('successfully submits valid phone and navigates to OTP screen', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'Success', data: 'otp sent' }),
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<Otp />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const input = screen.getByPlaceholderText('00000 00000');
    const submitBtn = screen.getByRole('button', { name: /get otp/i });

    await user.type(input, '9818979450');
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('6-digit code')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/pwa/user/register'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('shows the entered number, counts down and lets you resend the code', async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'Success', data: 'otp resent' }),
    });

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: '/otp', state: { phone: '9818979450' } }]}
        >
          <Routes>
            <Route path="/otp" element={<Otp />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Formatted phone "+91 98189 79450"
    expect(screen.getByText(/\+91 98189 79450/)).toBeInTheDocument();

    // Initially shows countdown timer
    expect(screen.getByText(/\(00:30\)/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();

    // Fast-forward 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Countdown becomes Resend button
    const resendBtn = screen.getByRole('button', { name: /resend/i });
    expect(resendBtn).toBeInTheDocument();

    // Click Resend
    await act(async () => {
      resendBtn.click();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/pwa/user/register'),
      expect.objectContaining({
        method: 'POST',
      })
    );

    // Timer restarts to 30
    expect(screen.getByText(/\(00:30\)/)).toBeInTheDocument();
  });

  it('displays error message when incorrect OTP is entered (handles HTTP 200 with Failed status)', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'Failed',
        status_code: 500,
        error_message: 'Incorrect OTP',
      }),
    });

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: '/otp', state: { phone: '9818979450' } }]}
        >
          <Routes>
            <Route path="/otp" element={<Otp />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], '0');
    }

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText('Incorrect OTP')).toBeInTheDocument();
    });
  });

  it('successfully authenticates with correct OTP and saves token', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'Success',
        status_code: 200,
        data: {
          token: 'mock-valid-jwt-token-xyz',
          user_name: 'Karan',
          user_id: '7208',
        },
      }),
    });

    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[{ pathname: '/otp', state: { phone: '9818979450' } }]}
        >
          <Routes>
            <Route path="/otp" element={<Otp />} />
            <Route path="/" element={<div>Home Screen Authenticated</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText('Home Screen Authenticated')).toBeInTheDocument();
    });

    expect(localStorage.getItem('fastor_token')).toBe('mock-valid-jwt-token-xyz');
  });
});
