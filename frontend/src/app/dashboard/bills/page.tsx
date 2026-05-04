'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { billsApi } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/useApi';
import { formatCurrency, formatDate, cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge, Card, CardHeader, CardBody, EmptyState, BillsSkeleton } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

const BILL_TYPES = [
  { value: 'ENERGY',       label: 'Energy',        emoji: '⚡' },
  { value: 'BROADBAND',    label: 'Broadband',      emoji: '📡' },
  { value: 'MOBILE',       label: 'Mobile',         emoji: '📱' },
  { value: 'WATER',        label: 'Water',          emoji: '💧' },
  { value: 'COUNCIL_TAX',  label: 'Council Tax',    emoji: '🏛️' },
  { value: 'TV_LICENCE',   label: 'TV Licence',     emoji: '📺' },
  { value: 'OTHER',        label: 'Other',          emoji: '📄' },
];

const TYPE_BADGE: Record<string, 'amber' | 'blue' | 'pink' | 'purple' | 'gray' | 'green'> = {
  ENERGY: 'amber', BROADBAND: 'blue', MOBILE: 'pink',
  WATER: 'blue', COUNCIL_TAX: 'purple', TV_LICENCE: 'gray', OTHER: 'gray',
};

export default function BillsPage() {
  const [uploading, setUploading]       = useState(false);
  const [selectedType, setSelectedType] = useState('ENERGY');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, loading, refetch } = useApi(() => billsApi.getBills() as any);
  const bills = (data as any)?.data || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast({ variant: 'error', title: 'Wrong file type', description: 'Only PDF files are accepted.' }); return; }
    if (file.size > 10 * 1024 * 1024)   { toast({ variant: 'error', title: 'File too large', description: 'File must be under 10MB.' }); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('bill', file);
    fd.append('type', selectedType);

    try {
      const res = await billsApi.upload(fd) as any;
      if (res.success) {
        const saving = res.data?.potentialSaving;
        const msg = saving && saving > 0
          ? `We found you could save ${formatCurrency(saving)}/year!`
          : 'Bill uploaded and analysed successfully.';
        toast({ variant: 'success', title: 'Bill analysed', description: msg });
        refetch();
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch (err: any) {
      toast({ variant: 'error', title: 'Upload failed', description: err?.message || 'Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await billsApi.deleteBill(id);
      toast({ variant: 'success', title: 'Bill deleted', description: 'The bill has been removed.' });
      refetch();
    } catch {
      toast({ variant: 'error', title: 'Delete failed', description: 'Could not delete bill. Try again.' });
    }
  };

  if (loading) return <BillsSkeleton />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-950 flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-500" />
          My Bills
        </h2>
        <p className="text-green-600 text-sm mt-1">Upload any bill as PDF — AI will extract details and find cheaper alternatives</p>
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader title="Upload a bill" subtitle="Supports energy, broadband, mobile, water and more" />
        <CardBody className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="form-label">Bill type</label>
            <div className="flex flex-wrap gap-2">
              {BILL_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedType(t.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                    selectedType === t.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-emerald-200 bg-white text-green-700 hover:border-emerald-300 hover:bg-emerald-50',
                  )}
                >
                  <span>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <label className={cn(
            'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all',
            uploading
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/30',
          )}>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium text-emerald-700">Analysing your bill with AI…</p>
                <p className="text-xs text-emerald-500">This usually takes 15–30 seconds</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 mb-1">
                  <Upload className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-sm font-medium text-green-800">Click to upload your bill</p>
                <p className="text-xs text-green-400">PDF only · Max 10MB · We never store your files</p>
              </div>
            )}
          </label>

        </CardBody>
      </Card>

      {/* Bills list */}
      {(
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-green-950">Your bills ({bills.length})</h3>
          </div>

          {bills.length === 0 ? (
            <Card>
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No bills uploaded yet"
                description="Upload your first bill above and AI will find savings opportunities for you"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {bills.map((bill: any) => (
                <Card key={bill.id} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                        {BILL_TYPES.find(t => t.value === bill.type)?.emoji || '📄'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant={TYPE_BADGE[bill.type] || 'gray'}>
                            {bill.type.replace('_', ' ')}
                          </Badge>
                          {bill.supplier && (
                            <span className="text-sm font-semibold text-green-950">{bill.supplier}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-green-400">
                          {bill.annualCost && <span>Annual: <span className="text-green-700 font-medium">{formatCurrency(bill.annualCost)}</span></span>}
                          {bill.monthlyAmount && <span>Monthly: <span className="text-green-700 font-medium">{formatCurrency(bill.monthlyAmount)}</span></span>}
                          <span>Uploaded {formatDate(bill.uploadedAt)}</span>
                        </div>
                      </div>

                      {/* Right: saving + actions */}
                      <div className="flex-shrink-0 flex items-start gap-2">
                        {bill.potentialSaving && bill.potentialSaving > 0 && (
                          <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 tabular-nums">
                              Save {formatCurrency(bill.potentialSaving)}/yr
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}
                          className="rounded-lg p-1.5 text-green-400 hover:bg-emerald-100 transition-colors"
                        >
                          <ChevronDown className={cn('h-4 w-4 transition-transform', expandedId === bill.id && 'rotate-180')} />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="rounded-lg p-1.5 text-green-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: AI analysis */}
                    {expandedId === bill.id && bill.aiAnalysis && (
                      <div className="mt-4 pt-4 border-t border-emerald-100 animate-fade-in">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">AI Analysis</p>
                        <p className="text-sm text-green-700 leading-relaxed">{bill.aiAnalysis}</p>
                        {bill.extractedData?.recommendations?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-green-600 mb-1.5">Recommendations:</p>
                            <ul className="space-y-1">
                              {bill.extractedData.recommendations.map((r: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-green-600">
                                  <span className="text-emerald-500 mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
