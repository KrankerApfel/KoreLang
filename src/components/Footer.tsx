import React from "react";

interface FooterProps {
  project: {
    projectName: string;
    lexicon: any[];
    settings?: {
      enableAI?: boolean;
    };
  };
}

export const Footer: React.FC<FooterProps> = ({ project }) => {
  return (
    <footer className="h-6 bg-[var(--surface)] border-t border-neutral-700 flex items-center px-4 text-xs gap-4 shrink-0 z-50 relative" style={{ color: 'var(--text-secondary)' }}>
      <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--accent)' }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></span>
        Auto-Saved
      </span>
      <span style={{ color: 'var(--text-secondary)' }}>{project.projectName}</span>
      <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>v1.1</span>
      <span className="ml-auto">Ln 1, Col 1</span>
      <span>{project.lexicon?.length || 0} Words</span>
      <span>AI: {project.settings?.enableAI ? "READY" : "OFF"}</span>
    </footer>
  );
};
