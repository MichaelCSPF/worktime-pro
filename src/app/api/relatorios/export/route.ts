import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { GenerateReportUseCase } from '@/modules/payroll/application/GenerateReportUseCase';
import { SupabaseTimeEntryRepository } from '@/modules/time-tracking/infrastructure/SupabaseTimeEntryRepository';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || '');
  const year = parseInt(searchParams.get('year') || '');
  const format = searchParams.get('format') || 'pdf';

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Instanciar dependências
  const timeRepo = new SupabaseTimeEntryRepository();
  const useCase = new GenerateReportUseCase(timeRepo);


  const result = await useCase.execute({ userId: user.id, month, year });

  if (result.isFailure()) {
    return NextResponse.json({ error: result.getError()?.message }, { status: 500 });
  }

  const data = result.getValue();

  if (format === 'csv') {
    const csv = Papa.unparse(data.rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=relatorio-${month}-${year}.csv`,
      },
    });
  }

  // Gerar PDF
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('WorkTime PRO - Relatório Mensal', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Colaborador: ${data.userName}`, 14, 30);
  doc.text(`Período: ${data.monthYear}`, 14, 35);

  // Tabela
  const tableData = data.rows.map(row => [
    row.date,
    row.companyName,
    row.entry,
    row.lunch,
    row.exit,
    row.totalHours,
    row.earnings
  ]);

  (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
    startY: 45,
    head: [['Data', 'Empresa', 'Entrada', 'Almoço', 'Saída', 'Total', 'Ganhos']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] }, // var(--color-primary)
  });

  // Totais
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total de Horas: ${data.totals.hours}`, 14, finalY);
  doc.text(`Total Estimado: ${data.totals.earnings}`, 14, finalY + 7);

  const pdfOutput = doc.output('arraybuffer');

  return new NextResponse(pdfOutput, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=relatorio-${month}-${year}.pdf`,
    },
  });
}
