/**
 * Global Machine Monitor - Design Selector
 * 
 * A simple selector to switch between different map designs
 * Allows easy comparison of different visual themes
 */

import React, { useState } from 'react';
import styled from 'styled-components';

// Import all the different map designs
import App from './App';
import AppDark from './AppDark';
import AppMinimal from './AppMinimal';
import AppIndustrial from './AppIndustrial';
import AppModern from './AppModern';

const SelectorContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SelectorTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
`;

const DesignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const DesignOption = styled.button`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$isSelected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.$isSelected ? '#dbeafe' : '#ffffff'};
  color: ${props => props.$isSelected ? '#1e40af' : '#64748b'};
  font-weight: ${props => props.$isSelected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    color: #1e40af;
  }
`;

const DesignName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const DesignDescription = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const designs = [
  {
    id: 'original',
    name: 'Original Design',
    description: 'Clean, professional look with subtle colors',
    component: App
  },
  {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Dark background with neon glow effects',
    component: AppDark
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    description: 'Clean, minimal design with subtle colors',
    component: AppMinimal
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Bold, technical theme with metallic colors',
    component: AppIndustrial
  },
  {
    id: 'modern',
    name: 'Modern Flat',
    description: 'Vibrant colors with smooth animations',
    component: AppModern
  }
];

function AppSelector() {
  const [selectedDesign, setSelectedDesign] = useState('original');

  const SelectedComponent = designs.find(d => d.id === selectedDesign)?.component || App;

  return (
    <>
      <SelectorContainer>
        <SelectorTitle>🎨 Map Design Selector</SelectorTitle>
        <DesignGrid>
          {designs.map(design => (
            <DesignOption
              key={design.id}
              $isSelected={selectedDesign === design.id}
              onClick={() => setSelectedDesign(design.id)}
            >
              <DesignName>{design.name}</DesignName>
              <DesignDescription>{design.description}</DesignDescription>
            </DesignOption>
          ))}
        </DesignGrid>
      </SelectorContainer>
      <SelectedComponent />
    </>
  );
}

export default AppSelector;
