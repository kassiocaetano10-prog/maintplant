import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders standard layout and dashboard', () => {
    render(<App />);
    expect(screen.getByText(/MAINTPLANT/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado por Zona/i)).toBeInTheDocument();
  });

  it('navigates between views using NavBar', () => {
    render(<App />);
    
    // Check navigation to Valves
    const valvesBtn = screen.getByRole('button', { name: /Válvulas/i });
    fireEvent.click(valvesBtn);
    expect(screen.getByPlaceholderText(/TAG, zona, kit, fabricante/i)).toBeInTheDocument();

    // Check navigation to Agenda
    const agendaBtn = screen.getByRole('button', { name: /Agenda/i });
    fireEvent.click(agendaBtn);
    expect(screen.getByText(/Ordens de Serviço/i)).toBeInTheDocument();

    // Check navigation to Panel
    const panelBtn = screen.getByRole('button', { name: /Painel/i });
    fireEvent.click(panelBtn);
    expect(screen.getByText(/Total cadastradas/i)).toBeInTheDocument();

    // Check navigation to Compras
    const comprasBtn = screen.getByRole('button', { name: /Compras/i });
    fireEvent.click(comprasBtn);
    expect(screen.getByText(/Kits agrupados por fabricante/i)).toBeInTheDocument();
  });

  it('filters valves by zone from Dashboard', () => {
    render(<App />);
    
    // Click on a zone card (e.g., '10')
    const zoneCard = screen.getByText('10', { selector: '.znm' });
    fireEvent.click(zoneCard);

    // Should switch to Valves view and set filter
    expect(screen.getByPlaceholderText(/TAG, zona, kit, fabricante/i)).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('10');
  });

  it('searches for a specific valve', () => {
    render(<App />);
    
    // Go to Valves view
    fireEvent.click(screen.getByRole('button', { name: /Válvulas/i }));

    const searchInput = screen.getByPlaceholderText(/TAG, zona, kit, fabricante/i);
    fireEvent.change(searchInput, { target: { value: '10.30.2.0' } });

    // Expect to see 10.30.2.0 and not others (assuming data exists)
    expect(screen.getByText('10.30.2.0')).toBeInTheDocument();
  });

  it('opens valve detail modal on click', () => {
    render(<App />);
    
    // Go to Valves view
    fireEvent.click(screen.getByRole('button', { name: /Válvulas/i }));

    // Click on a valve
    const valveItem = screen.getByText('10.30.2.0');
    fireEvent.click(valveItem);

    // Modal should appear
    expect(screen.getByText(/Dados técnicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Ref. Kit de Juntas/i)).toBeInTheDocument();
  });

  it('opens and closes the order form', () => {
    render(<App />);
    
    // Go to Agenda
    fireEvent.click(screen.getByRole('button', { name: /Agenda/i }));

    // Click 'Nova Ordem'
    fireEvent.click(screen.getByText(/Nova Ordem de Serviço/i));

    // Form should be visible
    expect(screen.getByText(/Técnico responsável/i)).toBeInTheDocument();

    // Click 'Cancelar'
    fireEvent.click(screen.getByText(/Cancelar/i));

    // Form should be gone
    expect(screen.queryByText(/Técnico responsável/i)).not.toBeInTheDocument();
  });
});
