import { CalculationResult, EstateData, HeirsData } from './inheritance-calculator';

export interface PDFReportData {
  madhab: string;
  madhhabName: string;
  date: string;
  estate: EstateData;
  heirs: HeirsData;
  result: CalculationResult;
}

export function generatePDFContent(data: PDFReportData): string {
  const {
    madhab,
    madhhabName,
    date,
    estate,
    heirs,
    result,
  } = data;

  // Calculate total heirs
  const totalHeirs = Object.values(heirs).reduce((sum, count) => sum + count, 0);

  // Generate HTML content for PDF
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير حساب المواريث</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          background: #f5f5f5;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          color: #059669;
          margin-bottom: 10px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .info-section {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-right: 4px solid #059669;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .info-label {
          font-weight: bold;
          color: #059669;
        }
        
        .info-value {
          color: #333;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #059669;
          border-bottom: 2px solid #059669;
          padding-bottom: 10px;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 13px;
        }
        
        table thead {
          background: #059669;
          color: white;
        }
        
        table th {
          padding: 12px;
          text-align: center;
          font-weight: bold;
        }
        
        table td {
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .summary-box {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .blocked-heirs {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .blocked-heir-item {
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        .blocked-heir-name {
          font-weight: bold;
          color: #ef4444;
        }
        
        .blocked-heir-reason {
          color: #666;
          margin-top: 3px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #999;
          font-size: 12px;
        }
        
        .special-cases {
          background: #fffbeb;
          border-left: 4px solid #f59222;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .special-case-item {
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .special-case-label {
          font-weight: bold;
          color: #f59222;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🧮 تقرير حساب المواريث الشرعية</h1>
          <p>تاريخ التقرير: ${date}</p>
        </div>
        
        <!-- Basic Info -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">المذهب الفقهي:</span>
            <span class="info-value">${madhhabName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">عدد الورثة:</span>
            <span class="info-value">${totalHeirs}</span>
          </div>
          <div class="info-row">
            <span class="info-label">إجمالي التركة:</span>
            <span class="info-value">${estate.total.toLocaleString()} ريال</span>
          </div>
          <div class="info-row">
            <span class="info-label">التركة الصافية:</span>
            <span class="info-value">${result.netEstate?.toLocaleString()} ريال</span>
          </div>
        </div>
        
        <!-- Summary -->
        <div class="summary-box">
          <div class="summary-row">
            <span><strong>أصل المسألة:</strong></span>
            <span>${result.asl}</span>
          </div>
          <div class="summary-row">
            <span><strong>الأساس النهائي:</strong></span>
            <span>${result.finalBase}</span>
          </div>
        </div>
        
        <!-- Special Cases -->
        ${(result.awlApplied || result.raddApplied || result.bloodRelativesApplied) ? `
        <div class="special-cases">
          <div style="font-weight: bold; margin-bottom: 10px; color: #f59222;">الحالات الخاصة المطبقة:</div>
          ${result.awlApplied ? '<div class="special-case-item"><span class="special-case-label">✓ العول</span> - تم تطبيق العول على المسألة</div>' : ''}
          ${result.raddApplied ? '<div class="special-case-item"><span class="special-case-label">✓ الرد</span> - تم تطبيق الرد على الورثة</div>' : ''}
          ${result.bloodRelativesApplied ? '<div class="special-case-item"><span class="special-case-label">✓ ذوو الأرحام</span> - تم تطبيق قواعد ذوي الأرحام</div>' : ''}
        </div>
        ` : ''}
        
        <!-- Results Table -->
        <h2 class="section-title">توزيع الميراث</h2>
        <table>
          <thead>
            <tr>
              <th>الوارث</th>
              <th>العدد</th>
              <th>النصيب (السهام)</th>
              <th>النسبة المئوية</th>
              <th>المبلغ الموزع (ريال)</th>
            </tr>
          </thead>
          <tbody>
            ${result.shares?.map(share => {
              const percentage = ((share.fraction.toDecimal() * 100) / (result.finalBase || 1)).toFixed(1);
              return `
                <tr>
                  <td>${share.name}</td>
                  <td>${share.count}</td>
                  <td>${share.fraction.toArabic()}</td>
                  <td>${percentage}%</td>
                  <td>${share.amount?.toLocaleString()} ريال</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <!-- Blocked Heirs -->
        ${result.blockedHeirs && result.blockedHeirs.length > 0 ? `
        <h2 class="section-title">الورثة المحجوبون</h2>
        <div class="blocked-heirs">
          ${result.blockedHeirs.map(blocked => `
            <div class="blocked-heir-item">
              <div class="blocked-heir-name">${blocked.heir}</div>
              <div class="blocked-heir-reason">محجوب بـ: ${blocked.by} - ${blocked.reason}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p>تم إنشاء هذا التقرير باستخدام تطبيق حاسبة المواريث الشرعية</p>
          <p>جميع الحسابات وفقاً لقواعد المذهب ${madhhabName}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function generateCSVContent(data: PDFReportData): string {
  const { madhhabName, result } = data;

  let csv = 'حاسبة المواريث الشرعية - تقرير CSV\n';
  csv += `المذهب الفقهي,${madhhabName}\n`;
  csv += `التاريخ,${data.date}\n`;
  csv += `التركة الصافية,${result.netEstate}\n`;
  csv += `أصل المسألة,${result.asl}\n`;
  csv += `الأساس النهائي,${result.finalBase}\n\n`;

  csv += 'توزيع الميراث\n';
  csv += 'الوارث,العدد,النصيب,النسبة المئوية,المبلغ\n';

  result.shares?.forEach(share => {
    const percentage = ((share.fraction.toDecimal() * 100) / (result.finalBase || 1)).toFixed(1);
    csv += `${share.name},${share.count},${share.fraction.toArabic()},${percentage}%,${share.amount}\n`;
  });

  return csv;
}
