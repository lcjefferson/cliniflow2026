import * as XLSX from 'xlsx';

interface ReportData {
    title: string;
    headers: string[];
    rows: (string | number)[][];
    totals?: { label: string; value: string | number }[];
}

export function generateExcel(data: ReportData): Blob {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data with headers
    const wsData: (string | number)[][] = [
        [data.title],
        [],
        data.headers,
        ...data.rows,
    ];

    // Add totals if present
    if (data.totals && data.totals.length > 0) {
        wsData.push([]);
        data.totals.forEach((total) => {
            wsData.push([total.label, total.value]);
        });
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = data.headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Style the title (merge cells)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: data.headers.length - 1 },
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

export function downloadExcel(data: ReportData, filename: string) {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data with headers
    const wsData: (string | number)[][] = [
        [data.title],
        [],
        data.headers,
        ...data.rows,
    ];

    // Add totals if present
    if (data.totals && data.totals.length > 0) {
        wsData.push([]);
        data.totals.forEach((total) => {
            wsData.push([total.label, total.value]);
        });
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = data.headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Style the title (merge cells)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: data.headers.length - 1 },
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Use XLSX's built-in writeFile method
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
