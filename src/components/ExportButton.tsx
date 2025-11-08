'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DownloadIcon, FileText, FileSpreadsheet, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { downloadFile } from '@/lib/utils';
import type { ExportFormat } from '@/types';

interface ExportButtonProps {
  companyId: string;
  type: 'members' | 'revenue' | 'engagement' | 'all';
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({
  companyId,
  type,
  label = 'Export Data',
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          type,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'pdf') {
        // For PDF, we expect a blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();

        if (format === 'csv' && data.csv) {
          const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
          downloadFile(data.csv, filename, 'text/csv');
        } else if (format === 'json' && data.json) {
          const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
          const jsonString = JSON.stringify(data.json, null, 2);
          downloadFile(jsonString, filename, 'application/json');
        }
      }

      showToast('success', `Successfully exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading}
            variant={variant}
            size={size}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isLoading}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('json')} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
