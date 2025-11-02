interface SeverityBadgeProps {
  severity: 'baja' | 'media' | 'alta';
  size?: 'sm' | 'md' | 'lg';
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const styles = {
    baja: 'badge-success',
    media: 'badge-warning',
    alta: 'badge-danger',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const labels = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
  };

  return (
    <span className={`${styles[severity]} ${sizeClasses[size]}`}>
      {labels[severity]}
    </span>
  );
}
