'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { downloadFile, generateCSV } from '@/lib/utils';
import type { ExportFormat } from '@/types';

interface ExportButtonProps {
  companyId: string;
  type: 'members' | 'revenue' | 'engagement' | 'all';
  format?: ExportFormat;
  label?: string;
}

export function ExportButton({
  companyId,
  type,
  format = 'csv',
  label = 'Export Data',
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
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

      const data = await response.json();

      if (format === 'csv' && data.csv) {
        const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        downloadFile(data.csv, filename, 'text/csv');
      } else if (format === 'json' && data.json) {
        const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
        const jsonString = JSON.stringify(data.json, null, 2);
        downloadFile(jsonString, filename, 'application/json');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      <DownloadIcon className="h-4 w-4 mr-2" />
      {isLoading ? 'Exporting...' : label}
    </Button>
  );
}
