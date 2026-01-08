import React from 'react';
import { cn } from '../../lib/utils';

interface CompactFieldProps {
  label: string;
  value?: string | number | null;
  className?: string;
  valueClassName?: string;
  mono?: boolean;
  truncate?: boolean;
}

/**
 * Compact field component for displaying labeled values in a dense grid layout.
 * Label appears on top, value below - designed for form-style display.
 */
const CompactField: React.FC<CompactFieldProps> = ({
  label,
  value,
  className,
  valueClassName,
  mono = false,
  truncate = false,
}) => {
  const displayValue = value ?? '-';

  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          'text-sm',
          mono && 'font-mono',
          truncate && 'truncate',
          valueClassName
        )}
        title={truncate && typeof displayValue === 'string' ? displayValue : undefined}
      >
        {displayValue}
      </p>
    </div>
  );
};

export default CompactField;
