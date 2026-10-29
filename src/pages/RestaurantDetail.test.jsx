import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import RestaurantDetail from './RestaurantDetail';

const mockRestaurant = {
  restaurant_id: '75',
  restaurant_name: 'VYB Club',
  address_complete: 'Connaught Place, New Delhi',
  logo: 'https://example.com/mock-logo.png',
};

describe('RestaurantDetail Page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('fastor_token', 'mock-token');
  });

  it('renders restaurant information from router state', () => {
    render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/restaurant/75',
              state: { restaurant: mockRestaurant },
            },
          ]}
        >
          <Routes>
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('VYB Club')).toBeInTheDocument();
    expect(screen.getByText('Connaught Place, New Delhi')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4 Offers trending')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-logo')).toBeInTheDocument();
  });
});
