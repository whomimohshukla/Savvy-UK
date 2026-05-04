'use client';

import { useState } from 'react';
import { Bell, CheckCheck, X, ExternalLink, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { alertsApi } from '@/lib/api/client';
import { formatDate, formatCurrency, cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge, Card, EmptyState, AlertsSkeleton } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

type AlertType = 'BENEFIT_FOUND' | 'ENERGY_SAVING' | 'BROADBAND_SAVING' | 'PRICE_CAP_CHANGE' | 'MONTHLY_SCAN' | 'BENEFIT_DEADLINE';

const TYPE_CONFIG: Record<AlertType, { label: string; emoji: string; badgeVariant: 'green' | 'amber' | 'blue' | 'red' | 'purple' | 'gray' }> = {
  BENEFIT_FOUND:    { label: 'Benefit',      emoji: '💷', badgeVariant: 'green' },
  ENERGY_SAVING:    { label: 'Energy',        emoji: '⚡', badgeVariant: 'green' },
  BROADBAND_SAVING: { label: 'Broadband',     emoji: '📡', badgeVariant: 'green' },
  PRICE_CAP_CHANGE: { label: 'Price cap',     emoji: '📊', badgeVariant: 'green' },
  MONTHLY_SCAN:     { label: 'Monthly scan',  emoji: '🔄', badgeVariant: 'green' },
  BENEFIT_DEADLINE: { label: 'Deadline',      emoji: '⏰', badgeVariant: 'red'   },
};

const STATUS_FILTERS = [
  { value: '',         label: 'All' },
  { value: 'UNREAD',   label: 'Unread' },
  { value: 'READ',     label: 'Read' },
  { value: 'ACTED_ON', label: 'Acted on' },
];

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [actioning, setActioning]       = useState<string | null>(null);

  const { data, loading, refetch } = useApi(
    () => alertsApi.getAlerts(statusFilter || undefined) as any,
    [statusFilter]
  );
  const alerts      = (data as any)?.data?.alerts || [];
  const unreadCount = (data as any)?.data?.unreadCount || 0;

  const handleMarkRead = async (id: string) => {
    setActioning(id);
    await alertsApi.markRead(id).catch(() => {});
    await refetch();
    setActioning(null);
  };

  const handleMarkAllRead = async () => {
    await alertsApi.markAllRead();
    toast({ variant: 'success', title: 'All caught up!', description: 'All alerts have been marked as read.' });
    refetch();
  };

  const handleDismiss = async (id: string) => {
    await alertsApi.dismiss(id).catch(() => {});
    refetch();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-950 flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-500" />
            Alerts
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-green-600 text-sm mt-0.5">Personalised savings and benefit notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 p-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
              statusFilter === f.value
                ? 'bg-white text-green-900 shadow-sm border border-emerald-100'
                : 'text-green-600 hover:text-green-800',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <AlertsSkeleton />
      ) : alerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No alerts yet"
            description="Run a benefits check or upload a bill and we'll alert you to savings and opportunities"
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert: any) => {
            const typeConfig = TYPE_CONFIG[alert.type as AlertType] || { label: alert.type, emoji: '💡', badgeVariant: 'green' as const };
            const isUnread   = alert.status === 'UNREAD';
            const isLoading  = actioning === alert.id;

            return (
              <div
                key={alert.id}
                className={cn(
                  'group relative rounded-2xl border bg-white p-5 transition-all',
                  isUnread ? 'border-emerald-100 shadow-sm' : 'border-emerald-50 opacity-75 hover:opacity-100',
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji + unread dot */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      {typeConfig.emoji}
                    </div>
                    {isUnread && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant={typeConfig.badgeVariant}>{typeConfig.label}</Badge>
                      {alert.valueAmount && (
                        <span className="text-xs font-bold text-emerald-600 tabular-nums">
                          {formatCurrency(alert.valueAmount)}
                        </span>
                      )}
                      {isUnread && <span className="text-xs font-semibold text-emerald-600">New</span>}
                    </div>
                    <p className="text-sm font-semibold text-green-900 mb-0.5">{alert.title}</p>
                    <p className="text-sm text-green-600 leading-relaxed">{alert.message}</p>
                    <p className="mt-2 text-xs text-green-400">{formatDate(alert.createdAt)}</p>

                    {/* Action link */}
                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        onClick={() => handleMarkRead(alert.id)}
                      >
                        {alert.actionLabel || 'View details'}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        disabled={isLoading}
                        title="Mark as read"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-green-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-40"
                      >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      title="Dismiss"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-green-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
