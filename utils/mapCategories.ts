
export interface MapLine {
  id: number;
  description: string;
  type: 'income' | 'expense' | 'info';
  isCalculated?: boolean;
}

export const MAP_CATEGORIES: MapLine[] = [
  // RECEITAS
  { id: 1, description: "01. Coleta nas reuniões durante o mês", type: 'income' },
  { id: 2, description: "02. Subscritores e Benfeitores", type: 'income' },
  { id: 3, description: "03. Doações Recebidas", type: 'income' },
  { id: 4, description: "04. Receitas Líquidas com Eventos (Rifa, Bazar, almoços etc.)", type: 'income' },
  { id: 5, description: "05. Outras Receitas Sujeitas a Décimas", type: 'income' },
  { id: 6, description: "06. Subtotal (Valor base para cálculo da Décima do mês)", type: 'info', isCalculated: true },
  { id: 7, description: "07. Subvenções Oficiais", type: 'income' },
  { id: 8, description: "08. Contribuição da Solidariedade e Coleta de Ozanam", type: 'income' },
  { id: 9, description: "09. União Fraternal (Contribuições Recebidas)", type: 'income' },
  { id: 10, description: "10. Outras Receitas não sujeitas a décima", type: 'income' },
  { id: 11, description: "11. Receitas Diversas", type: 'income' },
  { id: 12, description: "12. Recebimento de Contribuições para Repasses", type: 'income' },
  { id: 13, description: "13. Total dos Recebimentos (Somar da linha 06 a linha 12)", type: 'info', isCalculated: true },
  { id: 14, description: "14. Saldo no início do mês (Igual ao Saldo final do mês anterior)", type: 'income' }, // Tratado como input manual no form
  { id: 15, description: "15. Total Recebimentos + Saldo início do mês", type: 'info', isCalculated: true },

  // DESPESAS
  { id: 16, description: "16. Despesas com Cestas Básicas (alimentos, higiene, etc.)", type: 'expense' },
  { id: 17, description: "17. Despesas com Moradias dos Assistidos (Construção, Aluguel)", type: 'expense' },
  { id: 18, description: "18. Pagamentos de contas Assistidos (água, luz, gás, etc.)", type: 'expense' },
  { id: 19, description: "19. Despesas com Obras Especiais", type: 'expense' },
  { id: 20, description: "20. União Fraternal (Contribuições a Unidades Vicentinas)", type: 'expense' },
  { id: 21, description: "21. Outras despesas", type: 'expense' },
  { id: 22, description: "22. Despesas com Subvenções", type: 'expense' },
  { id: 23, description: "23. Despesas Administrativas e de Consumo da Conferência", type: 'expense' },
  { id: 24, description: "24. Décima paga ao Conselho Particular (10% da linha 6)", type: 'expense' },
  { id: 25, description: "25. Outras saídas", type: 'expense' },
  { id: 26, description: "26. Repasses da Contribuição da Solidariedade e Ozanam", type: 'expense' },
  { id: 27, description: "27. Repasses de contribuições Recebidas", type: 'expense' },
  { id: 28, description: "28. Total dos Pagamentos (Somar da linha 16 a linha 27)", type: 'info', isCalculated: true },
  { id: 29, description: "29. Saldo no final do mês (linha 15 - linha 28)", type: 'info', isCalculated: true },
  { id: 30, description: "30. Total Pagamentos + Saldo Final", type: 'info', isCalculated: true },
];
