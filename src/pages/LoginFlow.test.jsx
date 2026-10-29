import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  });

  it('shows validation error if phone number is not 10 digits', async () => {
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

    const input = screen.getByPlaceholderText('Enter Mobile Number');
    const submitBtn = screen.getByRole('button', { name: /send code/i });

    // Enter only 5 digits
    await user.type(input, '98189');
    await user.click(submitBtn);

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

    const input = screen.getByPlaceholderText('Enter Mobile Number');
    const submitBtn = screen.getByRole('button', { name: /send code/i });

    await user.type(input, '9818979450');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('OTP Verification')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/pwa/user/register'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('displays error message when incorrect OTP is entered (handles HTTP 200 with Failed status)', async () => {
    const user = userEvent.setup();

    // Mock Fastor API's HTTP 200 with status: "Failed" response
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
        <MemoryRouter initialEntries={[{ pathname: '/otp', state: { phone: '9818979450' } }]}>
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

    const verifyBtn = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyBtn);

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
        <MemoryRouter initialEntries={[{ pathname: '/otp', state: { phone: '9818979450' } }]}>
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

    const verifyBtn = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText('Home Screen Authenticated')).toBeInTheDocument();
    });

    expect(localStorage.getItem('fastor_token')).toBe('mock-valid-jwt-token-xyz');
  });
});
