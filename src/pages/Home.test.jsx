import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Home from './Home';

describe('Home Page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('fastor_token', 'mock-token');
    localStorage.setItem(
      'fastor_user',
      JSON.stringify({ user_name: 'Karan', user_id: '7208' })
    );
  });

  it('renders user name from auth and location header', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Current Locations')).toBeInTheDocument();
    expect(screen.getByText('Model Town, New Delhi')).toBeInTheDocument();
    expect(screen.getByText('Karan')).toBeInTheDocument();
  });

  it('renders Best Seller tiles, promo carousel and items', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Best Seller')).toBeInTheDocument();
    expect(screen.getByText('₹103.00')).toBeInTheDocument();
    expect(screen.getByText('₹50.00')).toBeInTheDocument();
    expect(screen.getByText('₹12.99')).toBeInTheDocument();
    expect(screen.getByText('₹8.20')).toBeInTheDocument();

    expect(screen.getByText('30% OFF')).toBeInTheDocument();
    expect(
      screen.getAllByText('Experience our delicious new dish').length
    ).toBeGreaterThan(0);
  });

  it('renders Popular Items and handles cancel order flow with confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Popular Items')).toBeInTheDocument();
    expect(screen.getByText('Strawberry Shake')).toBeInTheDocument();
    expect(screen.getByText('Chicken Burger')).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole('button', {
      name: /cancel order/i,
    });
    expect(cancelButtons.length).toBe(2);

    await user.click(cancelButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to cancel this order?'
    );
    expect(screen.getByText('Cancelled')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('shows track driver toast and wallet coming soon toast', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    );

    const trackButtons = screen.getAllByRole('button', {
      name: /track driver/i,
    });
    await user.click(trackButtons[0]);

    expect(
      screen.getByText("Driver tracking isn't available in this demo")
    ).toBeInTheDocument();

    const walletBtn = screen.getByRole('button', { name: /wallet/i });
    await user.click(walletBtn);

    expect(screen.getByText('Wallet coming soon')).toBeInTheDocument();
  });
});
