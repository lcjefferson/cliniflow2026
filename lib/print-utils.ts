export const generatePrescriptionHTML = (
    clinicName: string,
    patientName: string,
    medications: Array<{ name: string; dosage: string; instructions: string }>,
    notes: string | undefined,
    professionalName: string,
    professionalCro: string | undefined,
    date: string
) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receita - ${patientName}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .clinic-name { font-size: 24px; font-weight: bold; color: #111827; }
        .clinic-info { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 40px; text-transform: uppercase; color: #374151; }
        .patient-info { margin-bottom: 30px; font-size: 14px; }
        .label { font-weight: bold; color: #374151; }
        .medication-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
        .med-name { font-weight: bold; font-size: 16px; color: #1f2937; }
        .med-dosage { font-size: 14px; color: #374151; margin-left: 10px; }
        .med-instructions { display: block; margin-top: 5px; font-style: italic; color: #4b5563; }
        .notes-section { margin-top: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature-area { text-align: center; }
        .signature-line { width: 200px; border-top: 1px solid #000; margin-bottom: 5px; }
        .prof-name { font-weight: bold; font-size: 14px; }
        .prof-cro { font-size: 12px; color: #6b7280; }
        .date { font-size: 12px; color: #9ca3af; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="clinic-name">${clinicName}</div>
          <div class="clinic-info">Clínica Odontológica Especializada</div>
        </div>
      </div>

      <div class="title">Receituário</div>

      <div class="patient-info">
        <span class="label">Paciente:</span> ${patientName}
      </div>

      <div class="medications">
        ${medications.map((med, index) => `
          <div class="medication-item">
            <div>
              <span class="med-name">${index + 1}. ${med.name}</span>
              <span class="med-dosage">${med.dosage}</span>
            </div>
            <span class="med-instructions">${med.instructions}</span>
          </div>
        `).join('')}
      </div>

      ${notes ? `
        <div class="notes-section">
          <div class="label" style="margin-bottom: 5px;">Observações:</div>
          <div>${notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div class="date">${date}</div>
        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="prof-name">${professionalName}</div>
          ${professionalCro ? `<div class="prof-cro">${professionalCro}</div>` : ''}
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
};

export const generateCertificateHTML = (
    clinicName: string,
    patientName: string,
    description: string,
    days: number,
    startDate: string,
    notes: string | undefined,
    professionalName: string,
    professionalCro: string | undefined,
    date: string
) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Atestado - ${patientName}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .clinic-name { font-size: 24px; font-weight: bold; color: #111827; }
        .clinic-info { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 40px; text-transform: uppercase; color: #374151; }
        .content { font-size: 16px; line-height: 2; text-align: justify; margin-top: 40px; }
        .notes-section { margin-top: 40px; background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.5; }
        .label { font-weight: bold; color: #374151; }
        .footer { margin-top: 80px; border-top: 1px solid #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature-area { text-align: center; }
        .signature-line { width: 200px; border-top: 1px solid #000; margin-bottom: 5px; }
        .prof-name { font-weight: bold; font-size: 14px; }
        .prof-cro { font-size: 12px; color: #6b7280; }
        .date { font-size: 12px; color: #9ca3af; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="clinic-name">${clinicName}</div>
          <div class="clinic-info">Clínica Odontológica Especializada</div>
        </div>
      </div>

      <div class="title">Atestado Médico</div>

      <div class="content">
        Atesto para os devidos fins que o(a) Sr(a). <strong>${patientName}</strong> esteve sob meus cuidados profissionais no dia ${startDate}, necessitando de <strong>${days} (${days === 1 ? 'um' : days}) dias</strong> de afastamento de suas atividades laborais/escolares a partir desta data, por motivo de ${description}.
      </div>

      ${notes ? `
        <div class="notes-section">
          <div class="label" style="margin-bottom: 5px;">Observações:</div>
          <div>${notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div class="date">${date}</div>
        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="prof-name">${professionalName}</div>
          ${professionalCro ? `<div class="prof-cro">${professionalCro}</div>` : ''}
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
};
