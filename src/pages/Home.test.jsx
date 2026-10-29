import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Home from './Home';

const mockRestaurantsResponse = {
  status: 'Success',
  status_code: 200,
  data: {
    results: [
      {
        restaurant_id: '75',
        restaurant_name: 'VYB Lounge',
        address_complete: 'MG Road, Connaught Place',
        logo: 'https://example.com/logo1.png',
      },
      {
        restaurant_id: '68',
        restaurant_name: 'Dream Carz Cafe',
        address_complete: 'null', // tests the "null" string fallback
        logo: 'https://example.com/logo2.png',
      },
    ],
    meta: {
      total_pages: 1,
      total_count: 2,
    },
  },
};

describe('Home Page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('fastor_token', 'mock-token');
    localStorage.setItem(
      'fastor_user',
      JSON.stringify({ user_name: 'Karan', user_id: '7208' })
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockRestaurantsResponse,
    });
  });

  it('renders user greeting and location header', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Connaught Place')).toBeInTheDocument();
    expect(screen.getByText('Karan')).toBeInTheDocument();
    expect(screen.getByText("Let's explore this evening")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('VYB Lounge').length).toBeGreaterThan(0);
    });
  });

  it('renders restaurant list and falls back gracefully when address is "null"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      // Should find VYB Lounge in both horizontal taste cards and popular ones list
      expect(screen.getAllByText('VYB Lounge').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dream Carz Cafe').length).toBeGreaterThan(0);
    });

    // Address for VYB
    expect(screen.getByText('MG Road, Connaught Place')).toBeInTheDocument();

    // Address for Dream Carz Cafe was string "null", so fallback address must be displayed
    expect(screen.getByText('Connaught Place, New Delhi')).toBeInTheDocument();

    // Placeholders like rating and cost must be displayed
    expect(screen.getAllByText('4.5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Popularity').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹200 Cost for two').length).toBeGreaterThan(0);
  });
});
