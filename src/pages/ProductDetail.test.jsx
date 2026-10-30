import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import ProductDetail from './ProductDetail';

function renderWithProviders(initialEntry = '/item/pizza') {
  return render(
    <ToastProvider>
      <CartProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/item/:id" element={<ProductDetail />} />
            <Route path="/" element={<div>Home Screen</div>} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </ToastProvider>
  );
}

describe('ProductDetail Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders item details, base unit price, and portion radio options', () => {
    renderWithProviders('/item/pizza');

    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
    expect(screen.getByText('₹14.00')).toBeInTheDocument();
    expect(screen.getByText('Personal portion')).toBeInTheDocument();
    expect(screen.getByText('Personal (4 Slices)')).toBeInTheDocument();
    expect(screen.getByText('Medium (8 Slices)')).toBeInTheDocument();
    expect(screen.getByText('Familiar (10 Slices)')).toBeInTheDocument();
    expect(screen.getByText('Jumbo (12 Slices)')).toBeInTheDocument();
  });

  it('enforces qty stepper bounds (min 1, max 20)', async () => {
    const user = userEvent.setup();
    renderWithProviders('/item/pizza');

    const decBtn = screen.getByRole('button', { name: /decrease quantity/i });
    const incBtn = screen.getByRole('button', { name: /increase quantity/i });

    // Starts at 1, so decrease is disabled
    expect(decBtn).toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Increment up to 3
    await user.click(incBtn);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(decBtn).not.toBeDisabled();

    await user.click(incBtn);
    expect(screen.getByText('3')).toBeInTheDocument();

    // Decrement back to 1
    await user.click(decBtn);
    await user.click(decBtn);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(decBtn).toBeDisabled();
  });

  it('portion selection and quantity changes update the running total price', async () => {
    const user = userEvent.setup();
    renderWithProviders('/item/pizza');

    // Pizza defaults to first portion (Personal, +0.00) and qty 1: (14 + 0) * 1 = 14
    expect(
      screen.getByRole('button', { name: /add to cart · ₹14\.00/i })
    ).toBeInTheDocument();

    // Select Jumbo portion (extra 10.00): (14 + 10) * 1 = 24
    const jumboOption = screen.getByText('Jumbo (12 Slices)');
    await user.click(jumboOption);

    expect(
      screen.getByRole('button', { name: /add to cart · ₹24\.00/i })
    ).toBeInTheDocument();

    // Increase quantity to 2: (14 + 10) * 2 = 48
    const incBtn = screen.getByRole('button', { name: /increase quantity/i });
    await user.click(incBtn);

    expect(
      screen.getByRole('button', { name: /add to cart · ₹48\.00/i })
    ).toBeInTheDocument();
  });

  it('adds item to cart context and persists in localStorage with toast feedback', async () => {
    const user = userEvent.setup();
    renderWithProviders('/item/pizza');

    const addBtn = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addBtn);

    // Toast notification should appear
    expect(screen.getByText(/added to cart · ₹14\.00/i)).toBeInTheDocument();

    // Persisted in localStorage
    const savedCart = JSON.parse(localStorage.getItem('fastor_cart'));
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0]).toMatchObject({
      id: 'pizza',
      name: 'Pepperoni Pizza',
      portion: 'personal',
      qty: 1,
      total: 14,
    });
  });

  it('renders not-found message and link to home for unknown item id', () => {
    renderWithProviders('/item/unknown-dish-xyz');

    expect(screen.getByText('Item not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
