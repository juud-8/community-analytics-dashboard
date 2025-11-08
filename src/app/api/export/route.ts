import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { generateCSV, generatePDF } from '@/lib/utils';
import type { ExportFormat } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, type, format = 'csv' } = body;

    if (!companyId || !type) {
      return NextResponse.json(
        { success: false, error: 'Company ID and type are required' },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let headers: string[] = [];
    let title = '';

    // Fetch data based on type
    switch (type) {
      case 'members':
        data = await db.members.getAll(companyId);
        headers = ['id', 'email', 'name', 'status', 'joined_at', 'lifetime_value'];
        title = 'Members Report';
        break;

      case 'revenue':
        const purchases = await db.purchases.getAll(companyId);
        data = purchases;
        headers = ['id', 'product_name', 'amount', 'currency', 'purchased_at'];
        title = 'Revenue Report';
        break;

      case 'engagement':
        const engagement = await db.engagement.getAll(companyId);
        data = engagement;
        headers = ['member_id', 'date', 'messages_sent', 'messages_received', 'interactions'];
        title = 'Engagement Report';
        break;

      case 'all':
        const [members, allPurchases, allEngagement] = await Promise.all([
          db.members.getAll(companyId),
          db.purchases.getAll(companyId),
          db.engagement.getAll(companyId),
        ]);

        if (format === 'json') {
          return NextResponse.json({
            success: true,
            json: {
              members,
              purchases: allPurchases,
              engagement: allEngagement,
            },
          });
        }

        if (format === 'pdf') {
          const pdfData = await generatePDF({
            title: 'Analytics Report',
            companyId,
            sections: [
              {
                title: 'Members',
                headers: ['id', 'email', 'name', 'status', 'joined_at', 'lifetime_value'],
                data: members,
              },
              {
                title: 'Revenue',
                headers: ['id', 'product_name', 'amount', 'currency', 'purchased_at'],
                data: allPurchases,
              },
              {
                title: 'Engagement',
                headers: ['member_id', 'date', 'messages_sent', 'messages_received', 'interactions'],
                data: allEngagement,
              },
            ],
          });

          const blob = new Blob([pdfData as BlobPart], { type: 'application/pdf' });

          return new NextResponse(blob, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`,
            },
          });
        }

        // For CSV, we'll return members data
        data = members;
        headers = ['id', 'email', 'name', 'status', 'joined_at', 'lifetime_value'];
        title = 'Complete Analytics Report';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        );
    }

    // Generate export based on format
    if (format === 'csv') {
      const csv = generateCSV(data, headers);
      return NextResponse.json({
        success: true,
        csv,
      });
    } else if (format === 'json') {
      return NextResponse.json({
        success: true,
        json: data,
      });
    } else if (format === 'pdf') {
      const pdfData = await generatePDF({
        title,
        companyId,
        sections: [
          {
            title: title,
            headers,
            data,
          },
        ],
      });

      const blob = new Blob([pdfData as BlobPart], { type: 'application/pdf' });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported export format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
