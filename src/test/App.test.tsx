import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  })
}));

describe('App', () => {
  it('renders auth component when user is not logged in', () => {
    render(<App />);
    
    expect(screen.getByText('Setup do Faber')).toBeInTheDocument();
    expect(screen.getByText('Gerencie seu setup dos sonhos')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    // Re-mock for this specific test
    vi.doMock('../hooks/useAuth', () => ({
      useAuth: () => ({
        user: null,
        loading: true,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
    }));

    render(<App />);
    
    // Should show loading state
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});