import React, { ReactNode } from 'react';

interface CompactButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  color?: string;
  className?: string;
  hideLabel?: boolean;
}

/**
 * Compact button component for header actions
 * - Small rounded button with icon + label
 * - Used for primary actions like "New", "Generate", etc.
 * - Color customizable via props (default: accent)
 */
export const CompactButton: React.FC<CompactButtonProps> = ({ 
  onClick,
  icon,
  label,
  disabled = false,
  color = 'var(--accent)',
  className = '',
  hideLabel = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ 
        backgroundColor: disabled ? 'var(--disabled)' : color,
        color: 'var(--text-primary)'
      }}
    >
      {icon}
      {!hideLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
};
