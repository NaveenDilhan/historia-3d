import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoadingScreen from './LoadingScreen';
import { useProgress } from '@react-three/drei';

// Mock @react-three/drei using Vitest (vi)
vi.mock('@react-three/drei', () => ({
  useProgress: vi.fn(),
}));

describe('LoadingScreen Component (UT-02: Asset Loader Diagnostics)', () => {
  const mockOnStart = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display progress bar when loading', () => {
    useProgress.mockReturnValue({ progress: 50, errors: [] });
    
    render(<LoadingScreen hasLoaded={false} onStart={mockOnStart} isRevealing={false} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Consulting the Archives...')).toBeInTheDocument();
  });

  it('should display diagnostic alerts on GLB loading errors', () => {
    useProgress.mockReturnValue({ 
      progress: 40, 
      errors: ['http://localhost/assets/TRex_Optimized.glb failed'] 
    });

    render(<LoadingScreen hasLoaded={false} onStart={mockOnStart} isRevealing={false} />);
    
    expect(screen.getByText(/Diagnostic Alerts/)).toBeInTheDocument();
    expect(screen.getByText(/Geometry Error: Check 3D model paths, compression, or export settings./)).toBeInTheDocument();
  });

  it('should display "Begin Journey" button when hasLoaded is true', () => {
    useProgress.mockReturnValue({ progress: 100, errors: [] });
    
    render(<LoadingScreen hasLoaded={true} onStart={mockOnStart} isRevealing={false} />);
    
    const startButton = screen.getByText('Begin Journey');
    expect(startButton).toBeInTheDocument();
    expect(screen.getByText('Environment Ready.')).toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});