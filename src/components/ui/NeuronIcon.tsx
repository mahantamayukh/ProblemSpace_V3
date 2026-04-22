import React from 'react';

interface NeuronIconProps {
  className?: string;
  size?: number | string;
}

export const NeuronIcon = ({ className = "w-4 h-4", size }: NeuronIconProps) => {
  const sizeStyle = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={sizeStyle}
      stroke="currentColor" 
      strokeWidth="5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Soma - Rounded Hexagonal Blob matching the organic shape in the reference */}
      <path 
        d="M50 30 L65 38 L70 55 L60 72 L40 72 L30 55 L35 38 Z" 
        fill="currentColor" 
        fillOpacity="0.15"
      />
      
      {/* Nucleus - Central focal point */}
      <circle cx="50" cy="55" r="7" fill="currentColor" fillOpacity="0.4" stroke="none" />
      
      {/* Dendrites - Forked branches matching the shared image's visual language */}
      
      {/* Top Branch */}
      <path d="M50 30 V15" />
      <path d="M42 12 A10 10 0 0 1 58 12" />
      
      {/* Top-Right Branch */}
      <path d="M65 38 L78 28" />
      <path d="M78 20 A10 10 0 0 1 88 32" />
      
      {/* Top-Left Branch */}
      <path d="M35 38 L22 28" />
      <path d="M12 32 A10 10 0 0 1 22 20" />
      
      {/* Bottom-Left Branch */}
      <path d="M30 55 L15 60" />
      <path d="M12 72 A10 10 0 0 1 8 55" />
      
      {/* Axon - Distinctive long transmission line with terminal arborization */}
      <path d="M68 58 C75 65 72 85 85 85" strokeWidth="7" />
      
      {/* Axon Terminal forks */}
      <path d="M85 85 V75" />
      <path d="M78 70 A8 8 0 0 1 92 70" />
      
      <path d="M85 85 V95" />
      <path d="M78 100 A8 8 0 0 0 92 100" />
      
    </svg>
  );
};

export default NeuronIcon;
