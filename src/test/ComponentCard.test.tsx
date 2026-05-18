import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComponentCard from '../components/ComponentCard';
import { Component } from '../lib/supabase';

// Mock the useComponents hook
vi.mock('../hooks/useComponents', () => ({
  useComponents: () => ({
    updateComponent: vi.fn(),
    deleteComponent: vi.fn()
  })
}));

const mockComponent: Component = {
  id: '1',
  user_id: 'user1',
  name: 'RTX 4070 Super',
  category: 'gpu',
  price: 3299.99,
  url: 'https://example.com',
  image_url: '',
  description: 'High-performance graphics card',
  priority: 3,
  purchased: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ComponentCard', () => {
  it('renders component information correctly', () => {
    render(<ComponentCard component={mockComponent} />);
    
    expect(screen.getByText('RTX 4070 Super')).toBeInTheDocument();
    expect(screen.getByText('R$ 3.299,99')).toBeInTheDocument();
    expect(screen.getByText('High-performance graphics card')).toBeInTheDocument();
  });

  it('shows purchased state correctly', () => {
    const purchasedComponent = { ...mockComponent, purchased: true };
    render(<ComponentCard component={purchasedComponent} />);
    
    const title = screen.getByText('RTX 4070 Super');
    expect(title).toHaveClass('line-through', 'text-green-400');
  });

  it('renders category icon', () => {
    render(<ComponentCard component={mockComponent} />);
    
    // GPU category should show gaming icon
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });
});