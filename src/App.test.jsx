import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders standard layout', () => {
    render(<App />);
    expect(screen.getByText(/MAINTPLANT/i)).toBeInTheDocument();
  });

  it('shows dashboard by default', () => {
    render(<App />);
    expect(screen.getByText(/Estado por Zona/i)).toBeInTheDocument();
  });
});
