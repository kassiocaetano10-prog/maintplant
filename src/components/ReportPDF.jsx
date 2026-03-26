import React from 'react';

const ReportPDF = ({ valves, vstatus, zones, history, onClose, showToast }) => {
  const [generating, setGenerating] = React.useState(false);
  const [reportType, setReportType] = React.useState('geral'); // geral | zona | valvula

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const now = new Date().toLocaleDateString('pt-BR');

      // Header
      doc.setFillColor(6, 8, 16);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 35, pageWidth, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 212, 255);
      doc.text('MAINTPLANT', 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(180, 200, 220);
      doc.text('RELATÓRIO DE MANUTENÇÃO INDUSTRIAL', 14, 22);

      doc.setFontSize(8);
      doc.setTextColor(140, 160, 180);
      doc.text(`Gerado em: ${now}`, 14, 29);
      doc.text(`Tipo: ${reportType === 'geral' ? 'Relatório Geral' : reportType === 'zona' ? 'Por Zona' : 'Detalhado'}`, pageWidth - 14, 29, { align: 'right' });

      let yPos = 44;

      // Summary stats
      const total = valves.length;
      const ok = valves.filter(v => vstatus(v) === 'ok').length;
      const warn = valves.filter(v => vstatus(v) === 'warn').length;
      const crit = valves.filter(v => vstatus(v) === 'crit').length;

      doc.setFillColor(17, 24, 39);
      doc.roundedRect(14, yPos, pageWidth - 28, 22, 3, 3, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100, 130, 160);
      const cols = [
        { label: 'TOTAL', value: total, color: [0, 212, 255] },
        { label: 'EM DIA', value: ok, color: [34, 197, 94] },
        { label: 'ATENÇÃO', value: warn, color: [251, 191, 36] },
        { label: 'CRÍTICO', value: crit, color: [239, 68, 68] }
      ];

      cols.forEach((col, i) => {
        const x = 14 + (pageWidth - 28) / 4 * i + (pageWidth - 28) / 8;
        doc.setTextColor(...col.color);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(col.value), x, yPos + 11, { align: 'center' });
        doc.setFontSize(6);
        doc.setTextColor(100, 130, 160);
        doc.text(col.label, x, yPos + 17, { align: 'center' });
      });

      yPos += 30;

      if (reportType === 'geral' || reportType === 'zona') {
        // Zone summary table
        doc.setFontSize(10);
        doc.setTextColor(0, 212, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('STATUS POR ZONA', 14, yPos);
        yPos += 4;

        const zoneData = zones.map(z => {
          const zv = valves.filter(v => v.zona === z);
          const zOk = zv.filter(v => vstatus(v) === 'ok').length;
          const zWarn = zv.filter(v => vstatus(v) === 'warn').length;
          const zCrit = zv.filter(v => vstatus(v) === 'crit').length;
          return [
            `Zona ${z}`,
            String(zv.length),
            String(zOk),
            String(zWarn),
            String(zCrit),
            zv.length > 0 ? `${Math.round(zOk / zv.length * 100)}%` : '0%'
          ];
        });

        doc.autoTable({
          startY: yPos,
          head: [['Zona', 'Total', 'OK', 'Atenção', 'Crítico', '% Em Dia']],
          body: zoneData,
          theme: 'grid',
          headStyles: { fillColor: [31, 41, 55], textColor: [0, 212, 255], fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fillColor: [12, 17, 32], textColor: [200, 210, 220], fontSize: 7 },
          alternateRowStyles: { fillColor: [17, 24, 39] },
          styles: { cellPadding: 2.5, lineColor: [31, 41, 55], lineWidth: 0.3 },
          margin: { left: 14, right: 14 },
          columnStyles: {
            2: { textColor: [34, 197, 94] },
            3: { textColor: [251, 191, 36] },
            4: { textColor: [239, 68, 68] }
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (reportType === 'geral' || reportType === 'valvula') {
        // Critical valves list
        const critValves = valves.filter(v => vstatus(v) === 'crit');

        if (doc.internal.pageSize.getHeight() - yPos < 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text(`VÁLVULAS CRÍTICAS (${critValves.length})`, 14, yPos);
        yPos += 4;

        const critData = critValves.slice(0, 40).map(v => {
          const days = v.ult_man
            ? Math.floor((new Date() - new Date(v.ult_man)) / (1000 * 60 * 60 * 24))
            : 'Nunca';
          return [v.tag, `Zona ${v.zona}`, v.marca, v.kit || 'N/A', String(days)];
        });

        doc.autoTable({
          startY: yPos,
          head: [['TAG', 'Zona', 'Marca', 'Kit', 'Dias s/ Man.']],
          body: critData,
          theme: 'grid',
          headStyles: { fillColor: [60, 20, 20], textColor: [239, 68, 68], fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fillColor: [12, 17, 32], textColor: [200, 210, 220], fontSize: 6.5 },
          alternateRowStyles: { fillColor: [17, 24, 39] },
          styles: { cellPadding: 2, lineColor: [31, 41, 55], lineWidth: 0.3 },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Maintenance history
      if (history && history.length > 0) {
        if (doc.internal.pageSize.getHeight() - yPos < 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(`ÚLTIMAS MANUTENÇÕES (${Math.min(history.length, 30)})`, 14, yPos);
        yPos += 4;

        const histData = history.slice(0, 30).map(h => [
          new Date(h.date).toLocaleDateString('pt-BR'),
          h.tag,
          h.technician,
          h.type === 'preventiva' ? 'Preventiva' : 'Corretiva',
          h.kitChanged ? 'Sim' : 'Não',
          (h.service || '').substring(0, 30)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Data', 'TAG', 'Técnico', 'Tipo', 'Kit', 'Serviço']],
          body: histData,
          theme: 'grid',
          headStyles: { fillColor: [15, 40, 25], textColor: [34, 197, 94], fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fillColor: [12, 17, 32], textColor: [200, 210, 220], fontSize: 6.5 },
          alternateRowStyles: { fillColor: [17, 24, 39] },
          styles: { cellPadding: 2, lineColor: [31, 41, 55], lineWidth: 0.3 },
          margin: { left: 14, right: 14 }
        });
      }

      // Footer on all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const h = doc.internal.pageSize.getHeight();
        doc.setFillColor(249, 115, 22);
        doc.rect(0, h - 8, pageWidth, 0.5, 'F');
        doc.setFontSize(6);
        doc.setTextColor(100, 130, 160);
        doc.text('MaintPlant — Gestão de Manutenção Industrial', 14, h - 3);
        doc.text(`Página ${i}/${totalPages}`, pageWidth - 14, h - 3, { align: 'right' });
      }

      doc.save(`MaintPlant_Relatorio_${now.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      showToast?.('Erro ao gerar PDF. Tente novamente.', 'error');
    }
    setGenerating(false);
  };

  return (
    <div className="overlay on">
      <div className="ovhd">
        <button className="bkbtn" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1rem', color: 'var(--cy)' }}>
            📄 RELATÓRIOS
          </div>
        </div>
      </div>
      <div className="ovbd">
        <div className="card" style={{ marginBottom: '10px' }}>
          <div className="ctitle">Tipo de relatório</div>
          {[
            { id: 'geral', icon: '📊', title: 'Relatório Geral', desc: 'Visão completa: zonas, críticos e histórico' },
            { id: 'zona', icon: '🏭', title: 'Por Zona', desc: 'Status detalhado de cada zona' },
            { id: 'valvula', icon: '🔧', title: 'Válvulas Críticas', desc: 'Lista de válvulas que precisam de atenção' }
          ].map(opt => (
            <div key={opt.id} onClick={() => setReportType(opt.id)}
              style={{
                padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer',
                background: reportType === opt.id ? 'rgba(0,212,255,0.1)' : 'var(--s1)',
                border: reportType === opt.id ? '1px solid var(--cy)' : '1px solid var(--s3)',
                transition: '0.2s'
              }}>
              <div style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '.8rem', color: 'var(--txt)' }}>
                {opt.icon} {opt.title}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '.6rem', color: 'var(--mut)', marginTop: '2px' }}>
                {opt.desc}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-p" onClick={generatePDF} disabled={generating}
          style={{ opacity: generating ? 0.5 : 1 }}>
          {generating ? '⏳ Gerando...' : '📥 Gerar e Baixar PDF'}
        </button>
      </div>
    </div>
  );
};

export default ReportPDF;
