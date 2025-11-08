import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import type { DateRange, DateRangeFilter } from '@/types';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get date range based on preset
 */
export function getDateRange(range: DateRange): DateRangeFilter {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (range) {
    case '7d':
      startDate = startOfDay(subDays(endDate, 7));
      break;
    case '30d':
      startDate = startOfDay(subDays(endDate, 30));
      break;
    case '90d':
      startDate = startOfDay(subDays(endDate, 90));
      break;
    case '1y':
      startDate = startOfDay(subYears(endDate, 1));
      break;
    case 'all':
      startDate = startOfDay(subYears(endDate, 10));
      break;
    default:
      startDate = startOfDay(subDays(endDate, 30));
  }

  return { startDate, endDate };
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatString: string = 'MMM d, yyyy'): string {
  return format(new Date(date), formatString);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate churn rate
 */
export function calculateChurnRate(churned: number, total: number): number {
  if (total === 0) return 0;
  return (churned / total) * 100;
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  return calculatePercentageChange(current, previous);
}

/**
 * Generate CSV from data
 */
export function generateCSV(data: any[], headers: string[]): string {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download file in browser
 */
export function downloadFile(content: string, filename: string, type: string = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Group array by key or callback
 */
export function groupBy<T>(
  array: T[],
  keyOrFn: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = typeof keyOrFn === 'function' ? keyOrFn(item) : String(item[keyOrFn]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate average
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate sum
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Safe parse float
 */
export function safeParseFloat(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe parse int
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Generate PDF from data
 */
export async function generatePDF(config: {
  title: string;
  companyId: string;
  sections: Array<{
    title: string;
    headers: string[];
    data: any[];
  }>;
}): Promise<Uint8Array> {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add title
  doc.setFontSize(20);
  doc.text(config.title, pageWidth / 2, 20, { align: 'center' });

  // Add company ID
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Company ID: ${config.companyId}`, pageWidth / 2, 28, { align: 'center' });

  // Add generation date
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, pageWidth / 2, 34, { align: 'center' });

  let yPosition = 45;

  // Add each section
  for (const section of config.sections) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Add section title
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(section.title, 14, yPosition);
    yPosition += 10;

    // Prepare table data
    const tableData = section.data.slice(0, 100).map(row =>
      section.headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value.toLocaleString();
        return String(value);
      })
    );

    // Add table
    autoTable(doc, {
      head: [section.headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 34, 47],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: any) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Add summary footer on last page
  if (config.sections.length > 1) {
    const totalRecords = config.sections.reduce((sum, section) => sum + section.data.length, 0);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Total Records: ${totalRecords.toLocaleString()}`,
      pageWidth / 2,
      yPosition + 10,
      { align: 'center' }
    );
  }

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer as ArrayBuffer);
}
