import React, { ReactNode } from 'react';

interface StatBoxProps {
  value: ReactNode;
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Composant StatBox pour afficher des statistiques
 * - Utilise les couleurs du thème
 * - Hiérarchie de couleurs cohérente
 */
export const StatBox: React.FC<StatBoxProps> = ({ 
  value,
  label,
  icon,
  className = ''
}) => {
  return (
    <div 
      className={`p-4 rounded-lg border text-right ${className}`}
      style={{
        backgroundColor: 'var(--elevated)',
        borderColor: 'var(--border)'
      }}
    >
      {icon && <div className="mb-2" style={{ color: 'var(--accent)' }}>{icon}</div>}
      <div className="text-3xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div 
        className="text-[10px] uppercase tracking-wider font-bold text-center mt-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </div>
    </div>
  );
};
