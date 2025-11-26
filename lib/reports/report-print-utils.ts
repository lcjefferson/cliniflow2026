interface ReportData {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: (string | number)[][];
    totals?: { label: string; value: string | number }[];
}

export const generateReportHTML = (data: ReportData): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; color: #111827; }
        .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #3b82f6; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background-color: #f9fafb; }
        tr:hover { background-color: #f3f4f6; }
        .totals { margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
        .total-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .total-label { font-weight: bold; color: #374151; }
        .total-value { color: #111827; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${data.title}</div>
        ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            ${data.headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${data.totals && data.totals.length > 0 ? `
        <div class="totals">
          ${data.totals.map(total => `
            <div class="total-item">
              <span class="total-label">${total.label}:</span>
              <span class="total-value">${total.value}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="footer">
        Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
};

export const openReportPrintWindow = (data: ReportData) => {
    const html = generateReportHTML(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Por favor, permita pop-ups para imprimir o relatório.');
    }
};
