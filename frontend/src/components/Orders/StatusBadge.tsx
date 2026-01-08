import React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type StatusTone = 'success' | 'progress' | 'warning' | 'danger' | 'info';

const STATUS_MAP: Record<StatusTone, { statuses: string[]; className: string }> = {
  success: {
    statuses: ['reparado', 'para entregar', 'retirado', 'informado', 'finalizado', 'entregado'],
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  progress: {
    statuses: ['a reparar', 'esp. repuesto', 'en central', 'rep. domic.', 'presup. en domicilio', 'reingresado'],
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  warning: {
    statuses: ['a presupuestar', 'presupuestado', 'a visitar', 'visitado', 'espera', 'controlar', 'verificar', 'ingresado', 'sin determinar'],
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  danger: {
    statuses: ['rechazado', 'rechazo presup.', 'fallo', 'sin solucion', 'cancelado'],
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  info: {
    statuses: [],
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const resolveTone = (status: string): { variant: BadgeVariant; className: string } => {
  const normalized = status.toLowerCase();
  const toneEntry = (Object.entries(STATUS_MAP) as [StatusTone, { statuses: string[]; className: string }][]).find(([, value]) =>
    value.statuses.includes(normalized)
  );

  if (!toneEntry) {
    return { variant: 'outline', className: STATUS_MAP.info.className };
  }

  const [tone, value] = toneEntry;
  const variant: BadgeVariant =
    tone === 'success'
      ? 'default'
      : tone === 'danger'
      ? 'destructive'
      : tone === 'progress'
      ? 'secondary'
      : 'outline';

  return { variant, className: value.className };
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { variant, className: resolvedClass } = resolveTone(status);

  return (
    <Badge
      variant={variant}
      className={cn('px-3 py-1 text-[0.7rem] font-semibold tracking-wide', resolvedClass, className)}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
