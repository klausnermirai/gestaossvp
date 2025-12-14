
import { jsPDF } from 'jspdf';
import { ConferenceHierarchy, Council, MonthlyMapData, CouncilType } from '../types';

interface PDFData {
  conference: ConferenceHierarchy;
  metropolitan?: string;
  central?: string;
  particular?: string;
  month: number;
  year: number;
  data: MonthlyMapData;
  lines: Record<number, number>; // Map de ID da linha -> Valor
}

export const generateMapPDF = (pdfData: PDFData) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape, millimeters, A4
  const { conference, metropolitan, central, particular, month, year, data, lines } = pdfData;

  // Helper to format currency
  const fmt = (val: number) => val ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

  // --- HEADER ---
  // Blue Title Bar
  doc.setFillColor(0, 80, 160); // SSVP Blue approximation
  doc.rect(10, 10, 277, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MAPA DO MOVIMENTO MENSAL PARA CONFERÊNCIAS', 148.5, 15.5, { align: 'center' });

  // --- INFO BLOCK ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Row 1
  doc.text('CONFERÊNCIA:', 12, 24);
  doc.setFont('helvetica', 'normal');
  doc.text(conference.name.toUpperCase(), 45, 24);
  
  doc.setFont('helvetica', 'bold');
  doc.text('MÊS:', 180, 24);
  doc.rect(190, 20, 10, 5); // Box for Month Number
  doc.text(month.toString().padStart(2, '0'), 192, 24); 
  doc.setFont('helvetica', 'normal');
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  doc.text(monthNames[month - 1] || '', 202, 24);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ANO:', 240, 24);
  doc.setFont('helvetica', 'normal');
  doc.text(year.toString(), 252, 24);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DA CONFERÊNCIA:', 12, 30);
  doc.setFont('helvetica', 'normal');
  doc.text('xx-xx-xx-xx', 65, 30); // Placeholder or add to type

  doc.text(`Data Fundação: ${conference.foundationDate ? new Date(conference.foundationDate).toLocaleDateString('pt-BR') : ''}`, 150, 30);
  doc.text(`Data Agregação: -`, 210, 30);

  // Row 3 (Councils)
  doc.rect(10, 32, 277, 10); // Container box
  doc.line(100, 32, 100, 42); // Vertical separator 1
  doc.line(190, 32, 190, 42); // Vertical separator 2
  doc.line(10, 37, 277, 37); // Horizontal separator

  doc.setFontSize(8);
  doc.text('Conselho Particular:', 12, 36);
  doc.text(particular?.toUpperCase() || '', 40, 36);
  
  doc.text('Conselho Central:', 12, 41);
  doc.text(central?.toUpperCase() || '', 40, 41);
  
  doc.text('Conselho Metropolitano:', 192, 41);
  doc.text(metropolitan?.toUpperCase() || '', 225, 41);

  // Row 4 (Stats)
  doc.rect(10, 42, 277, 6);
  // Grid for stats
  const statsX = [10, 40, 60, 80, 100, 120, 150, 180];
  // Draw verticals
  // doc.line(40, 42, 40, 48); ... simplified logic below
  
  doc.setFont('helvetica', 'normal');
  const stats = [
    `Nº de Membros: ${data.activeMembers}`,
    `Confrades: ${data.confradesCount}`,
    `Consócias: ${data.consociasCount}`,
    `Aspirantes: ${data.aspirantesCount}`,
    `Auxiliares: ${data.auxiliaresCount}`,
    `Famílias Assistidas: ${data.familiesAssistedCount}`,
    `Pessoas Assistidas: ${data.peopleAssistedCount}`
  ];
  
  let currentX = 12;
  stats.forEach(stat => {
     doc.text(stat, currentX, 46);
     currentX += 38;
  });

  // --- FINANCIAL TABLE ---
  const tableTop = 48;
  const col1W = 110; // Desc
  const col1ValW = 28.5; // Value
  const col2W = 110;
  const col2ValW = 28.5;
  
  const midX = 10 + col1W + col1ValW; // Center of table

  // Title Row
  doc.setFillColor(230, 230, 230);
  doc.rect(10, tableTop, 277, 6, 'F');
  doc.rect(10, tableTop, 277, 6); // Border
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RESUMO DO MOVIMENTO FINANCEIRO MENSAL DE CONFERÊNCIAS', 148.5, tableTop + 4, { align: 'center' });

  // Headers
  const hRow = tableTop + 6;
  doc.setFillColor(200, 200, 200);
  doc.rect(10, hRow, 277, 6, 'F');
  doc.rect(10, hRow, 277, 6);
  doc.line(midX, hRow, midX, hRow + 6); // Split Left/Right
  
  doc.text('RECEBIMENTOS (Receitas/Arrecadações)', 10 + (col1W/2), hRow + 4);
  doc.text('R$', 10 + col1W + (col1ValW/2), hRow + 4, { align: 'center' });
  
  doc.text('PAGAMENTOS (Despesas/Inv. Sociais)', midX + (col2W/2), hRow + 4);
  doc.text('R$', midX + col2W + (col2ValW/2), hRow + 4, { align: 'center' });

  // Rows 1-15 (Left) and 16-30 (Right)
  let y = hRow + 6;
  const rowH = 5.5;
  const numRows = 15;

  doc.setFontSize(7); // Smaller font for list items

  for (let i = 0; i < numRows; i++) {
    const leftId = i + 1;
    const rightId = i + 16;
    
    // Draw row box
    doc.rect(10, y, 277, rowH);
    
    // Vertical Lines
    doc.line(10 + col1W, y, 10 + col1W, y + rowH); // Left Val Sep
    doc.line(midX, y, midX, y + rowH); // Middle Sep
    doc.line(midX + col2W, y, midX + col2W, y + rowH); // Right Val Sep

    // Left Content
    const leftVal = lines[leftId] || 0;
    const leftText = getLineText(leftId);
    doc.setFont('helvetica', isBold(leftId) ? 'bold' : 'normal');
    doc.text(leftText, 12, y + 4);
    if(leftVal !== 0 || isBold(leftId)) { // Show totals even if 0 if bold
        doc.text(fmt(leftVal), 10 + col1W + col1ValW - 2, y + 4, { align: 'right' });
    }

    // Right Content
    const rightVal = lines[rightId] || 0;
    const rightText = getLineText(rightId);
    doc.setFont('helvetica', isBold(rightId) ? 'bold' : 'normal');
    doc.text(rightText, midX + 2, y + 4);
    if(rightVal !== 0 || isBold(rightId)) {
        doc.text(fmt(rightVal), midX + col2W + col2ValW - 2, y + 4, { align: 'right' });
    }

    y += rowH;
  }

  // --- FOOTER ---
  const footerY = y;
  const footerH = 20;
  
  // Box 1: Stats
  doc.rect(10, footerY, 120, footerH);
  doc.line(10, footerY + 10, 130, footerY + 10); // Horizontal split
  
  // Col splits
  doc.line(40, footerY, 40, footerY + 10);
  doc.line(80, footerY, 80, footerY + 10);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Total de Alimentos', 12, footerY + 3);
  doc.text('Doados em Kg/mês', 12, footerY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.foodKg || 0} Kg`, 25, footerY + 8); // Value

  doc.setFont('helvetica', 'bold');
  doc.text('No. de Obras', 42, footerY + 3);
  doc.text('Especiais - O.E.', 42, footerY + 8);
  // Value Obras Especiais (placeholder logic)
  
  doc.text('Total de Pessoas', 82, footerY + 3);
  doc.text('Atendidas na O.E.', 82, footerY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.peopleAttendedSpecialWorks || 0}`, 110, footerY + 8);

  // Bottom half of stats
  doc.setFont('helvetica', 'bold');
  doc.text('Despesas do Mês', 12, footerY + 14);
  doc.text('Com O.E. em R$', 12, footerY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(fmt(data.expensesSpecialWorks || 0), 60, footerY + 18);

  // Box 2: Construction
  doc.rect(130, footerY, 50, footerH);
  doc.setFont('helvetica', 'bold');
  doc.text('Construção/Reforma', 132, footerY + 3);
  doc.text('Casa Quantidade', 132, footerY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(data.constructionReform || '', 132, footerY + 14);

  // Box 3: Signatures
  doc.rect(180, footerY, 107, footerH + 10); // Taller box
  doc.setFillColor(200, 200, 200);
  doc.rect(180, footerY, 107, 10, 'F'); // Grey background for Date
  
  doc.text('Recebido em: ____/____/________', 185, footerY + 7);
  
  doc.line(185, footerY + 22, 280, footerY + 22);
  doc.text('Presidente ou Tesoureiro do Conselho Particular', 232, footerY + 26, { align: 'center' });

  // Conference Signatures (Below main table)
  const sigY = footerY + 35;
  doc.line(10, sigY, 80, sigY);
  doc.text('Presidente da Conferência', 45, sigY + 4, { align: 'center' });
  
  doc.line(90, sigY, 160, sigY);
  doc.text('Secretário (a) da Conferência', 125, sigY + 4, { align: 'center' });

  doc.line(170, sigY, 240, sigY);
  doc.text('Tesoureiro (a) da Conferência', 205, sigY + 4, { align: 'center' });

  // Save
  doc.save(`Mapa_${conference.name.replace(/\s/g, '_')}_${month}_${year}.pdf`);
};

// Helper for row texts (simplified)
function getLineText(id: number): string {
    const map = [
        "01. Coleta nas reuniões durante o mês",
        "02. Subscritores e Benfeitores",
        "03. Doações Recebidas",
        "04. Receitas Líquidas com Eventos (Rifa, Bazar, almoços etc.)",
        "05. Outras Receitas Sujeitas a Décimas",
        "06. Subtotal (Valor base para cálculo da Décima do mês)",
        "07. Subvenções Oficiais",
        "08. Contribuição da Solidariedade e Coleta de Ozanam",
        "09. União Fraternal (Contribuições Recebidas)",
        "10. Outras Receitas não sujeitas a décima",
        "11. Receitas Diversas",
        "12. Recebimento de Contribuições para Repasses",
        "13. Total dos Recebimentos (Somar da linha 06 a linha 12)",
        "14. Saldo no início do mês (Igual ao Saldo final do mês anterior)",
        "15. Total Recebimentos + Saldo início do mês",
        "16. Despesas com Cestas Básicas (alimentos, higiene, etc.)",
        "17. Despesas com Moradias dos Assistidos",
        "18. Pagamentos de contas Assistidos (água, luz, gás, etc.)",
        "19. Despesas com Obras Especiais",
        "20. União Fraternal (Contribuições a Unidades Vicentinas)",
        "21. Outras despesas",
        "22. Despesas com Subvenções",
        "23. Despesas Administrativas e de Consumo da Conferência",
        "24. Décima paga ao Conselho Particular (10% da linha 6)",
        "25. Outras saídas",
        "26. Repasses da Contribuição da Solidariedade e Ozanam",
        "27. Repasses de contribuições Recebidas",
        "28. Total dos Pagamentos (Somar da linha 16 a linha 27)",
        "29. Saldo no final do mês (linha 15 - linha 28)",
        "30. Total Pagamentos + Saldo Final",
    ];
    return map[id - 1] || "";
}

function isBold(id: number): boolean {
    return [6, 13, 14, 15, 24, 28, 29, 30].includes(id);
}
