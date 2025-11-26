import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: (string | number)[][];
    totals?: { label: string; value: string | number }[];
}

export function generatePDF(data: ReportData): Blob {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(data.title, 14, 22);

    if (data.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(data.subtitle, 14, 30);
    }

    // Table
    autoTable(doc, {
        head: [data.headers],
        body: data.rows,
        startY: data.subtitle ? 35 : 30,
        theme: 'grid',
        headStyles: {
            fillColor: [59, 130, 246], // blue-500
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251], // gray-50
        },
    });

    // Totals section
    if (data.totals && data.totals.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 30;

        doc.setFontSize(10);
        doc.setTextColor(40);

        let yPosition = finalY + 10;
        data.totals.forEach((total) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${total.label}:`, 14, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(String(total.value), 80, yPosition);
            yPosition += 7;
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            14,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function downloadPDF(data: ReportData, filename: string) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(data.title, 14, 22);

    if (data.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(data.subtitle, 14, 30);
    }

    // Table
    autoTable(doc, {
        head: [data.headers],
        body: data.rows,
        startY: data.subtitle ? 35 : 30,
        theme: 'grid',
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
    });

    // Totals section
    if (data.totals && data.totals.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 30;

        doc.setFontSize(10);
        doc.setTextColor(40);

        let yPosition = finalY + 10;
        data.totals.forEach((total) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${total.label}:`, 14, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(String(total.value), 80, yPosition);
            yPosition += 7;
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            14,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    // Use jsPDF's built-in save method
    doc.save(`${filename}.pdf`);
}
