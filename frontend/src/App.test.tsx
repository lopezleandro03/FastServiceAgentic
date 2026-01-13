import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /FastService/i });
  expect(titleElement).toBeInTheDocument();
  const loginButton = screen.getByRole('button', { name: /ingresar/i });
  expect(loginButton).toBeInTheDocument();
});
