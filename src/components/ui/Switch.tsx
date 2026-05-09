import type { InputHTMLAttributes } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label className={`switch ${className ?? ''}`} style={{ gap: label ? '0.5rem' : undefined }}>
      <input type="checkbox" {...props} />
      <span className="switch-track" />
      {label && (
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)', userSelect: 'none' }}>
          {label}
        </span>
      )}
    </label>
  );
}
