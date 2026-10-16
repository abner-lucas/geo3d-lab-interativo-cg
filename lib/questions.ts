import { QuestionDef, QuestionBlock, AssessmentMode } from '@/types/geo3d';

export const QUESTION_BLOCKS: Record<QuestionBlock, { title: string; maxScore: number; description: string }> = {
  BLOCK_1_RECOGNITION: {
    title: 'Nível 1 (Inicial) — Reconhecimento 2D e 3D',
    maxScore: 2.0,
    description: 'Diferenciação básica entre figuras planas (2D) e sólidos com volume espacial (3D).'
  },
  BLOCK_2_NETS: {
    title: 'Nível 2 (Elementar) — Moldes e Sólidos',
    maxScore: 3.0,
    description: 'Correspondência progressiva entre moldes bidimensionais abertos e sólidos tridimensionais.'
  },
  BLOCK_3_FOLDING: {
    title: 'Nível 3 (Intermediário) — Previsão e Validação de Dobradura',
    maxScore: 2.0,
    description: 'Abstração mental de fechamento espacial e validação de moldes sem colisão de faces.'
  },
  BLOCK_4_SPATIAL: {
    title: 'Nível 4 (Avançado) — Manipulação 3D e Vistas',
    maxScore: 1.5,
    description: 'Rotação tridimensional ativa para descoberta de faces ocultas e projeção ortográfica.'
  },
  BLOCK_5_COMPOSITION: {
    title: 'Nível 5 (Desafio Final) — Composição Espacial 3D',
    maxScore: 1.5,
    description: 'Síntese construtiva combinando múltiplas primitivas geométricas tridimensionais.'
  }
};

// ============================================================================
// MODO TREINO (TOUR / TUTORIAL DE AMBIENTAÇÃO — APENAS 3 QUESTÕES SIMPLES)
// Totalmente distintas das questões do Modo Avaliação, focadas em ensinar a
// mecânica de uso da plataforma (clique, rotação 3D e preenchimento de lacunas).
// ============================================================================
export const PRACTICE_QUESTIONS: QuestionDef[] = [
  {
    id: 101,
    block: 'BLOCK_1_RECOGNITION',
    blockTitle: 'Passo 1 de 3 • Tutorial de Seleção',
    title: 'Tour 1: Como selecionar uma resposta',
    visualPrompt: 'Bem-vindo ao Tour! Para aprender a marcar uma alternativa, clique no cartão que mostra uma LINHA RETA.',
    points: 3.0,
    type: 'select_single',
    options: [
      { id: 'line', label: 'Linha Reta Contínua' },
      { id: 'dots', label: 'Pontos Separados' },
      { id: 'wave', label: 'Linha Curva Ondulada' }
    ]
  },
  {
    id: 102,
    block: 'BLOCK_3_FOLDING',
    blockTitle: 'Passo 2 de 3 • Tutorial da Câmera 3D',
    title: 'Tour 2: Como girar e usar os botões da tela 3D',
    visualPrompt: 'Pratique girar o objeto na tela abaixo e clique no botão "Abrir" no canto superior do quadro 3D. O que acontece com o bloco quando você clica em "Abrir"?',
    points: 3.5,
    type: 'predict_solid',
    options: [
      { id: 'unfolds', name: 'As partes se abrem espalhadas na tela' },
      { id: 'vanishes', name: 'O objeto apaga e desaparece da tela' },
      { id: 'shrinks', name: 'O objeto encolhe até sumir' }
    ]
  },
  {
    id: 103,
    block: 'BLOCK_5_COMPOSITION',
    blockTitle: 'Passo 3 de 3 • Tutorial de Encaixe e Envio',
    title: 'Tour 3: Como preencher espaços e finalizar',
    visualPrompt: 'Em algumas atividades você preencherá espaços clicando nos botões. Coloque a PEÇA AZUL na Esquerda e a PEÇA AMARELA na Direita!',
    points: 3.5,
    type: 'compose_house',
    options: [
      { id: 'blue_piece', name: 'Peça Azul (Esquerda)' },
      { id: 'yellow_piece', name: 'Peça Amarela (Direita)' }
    ]
  }
];

// ============================================================================
// MODO AVALIAÇÃO (10 QUESTÕES OFICIAIS EM ORDEM CRESCENTE DE COMPLEXIDADE)
// Começa em reconhecimento simples (Nível 1) e avança gradualmente até
// vistas ortográficas e composição espacial 3D (Nível 5).
// ============================================================================
export const QUESTIONS: QuestionDef[] = [
  // QUESTÃO 1 (1.0 pt) — Nível 1: Muito Simples
  {
    id: 1,
    block: 'BLOCK_1_RECOGNITION',
    blockTitle: 'Nível 1 • Reconhecimento Básico',
    title: 'Identifique o objeto 3D',
    visualPrompt: 'Para começar: selecione a única figura abaixo que possui volume tridimensional (3D).',
    points: 1.0,
    type: 'select_single',
    options: [
      { id: 'square', label: 'Quadrado Plano', is3D: false, shape: 'square' },
      { id: 'triangle', label: 'Triângulo Plano', is3D: false, shape: 'triangle' },
      { id: 'cube', label: 'Cubo Espacial', is3D: true, shape: 'cube' }
    ]
  },
  // QUESTÃO 2 (1.0 pt) — Nível 1: Simples
  {
    id: 2,
    block: 'BLOCK_1_RECOGNITION',
    blockTitle: 'Nível 1 • Classificação 2D vs 3D',
    title: 'Plano (2D) ou Volume (3D)?',
    visualPrompt: 'Organize as 4 figuras nos grupos corretos: 2D (Plano) ou 3D (Volume).',
    points: 1.0,
    type: 'classify_2d_3d',
    options: [
      { id: 'circle', name: 'Círculo', iconType: 'circle', expected: '2D' },
      { id: 'cylinder', name: 'Cilindro', iconType: 'cylinder', expected: '3D' },
      { id: 'rectangle', name: 'Retângulo', iconType: 'rectangle', expected: '2D' },
      { id: 'pyramid', name: 'Pirâmide', iconType: 'pyramid', expected: '3D' }
    ]
  },
  // QUESTÃO 3 (1.0 pt) — Nível 2: Elementar (Corpo redondo com círculos é o molde mais imediato)
  {
    id: 3,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Nível 2 • Planificação Inicial',
    title: 'Encontre o Cilindro',
    visualPrompt: 'Observe o molde com 1 retângulo central e 2 círculos nas extremidades. Qual sólido ele forma?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'cylinder', solid: 'cylinder', name: 'Cilindro' },
      { id: 'cube', solid: 'cube', name: 'Cubo' },
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide Quadrada' }
    ]
  },
  // QUESTÃO 4 (1.0 pt) — Nível 2: Elementar-Intermediário
  {
    id: 4,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Nível 2 • Planificação Regular',
    title: 'Encontre o Cubo',
    visualPrompt: 'Observe a planificação composta por 6 faces quadradas iguais. Qual sólido corresponde a ela?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'cube', solid: 'cube', name: 'Cubo' },
      { id: 'cylinder', solid: 'cylinder', name: 'Cilindro' },
      { id: 'triangular_prism', solid: 'triangular_prism', name: 'Prisma Triangular' }
    ]
  },
  // QUESTÃO 5 (1.0 pt) — Nível 2: Intermediário
  {
    id: 5,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Nível 2 • Planificação Combinada',
    title: 'Encontre o Prisma Triangular',
    visualPrompt: 'Observe o molde com 3 faces retangulares e 2 bases triangulares. Qual é o sólido formado?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide Quadrada' },
      { id: 'triangular_prism', solid: 'triangular_prism', name: 'Prisma Triangular' },
      { id: 'cuboid', solid: 'cuboid', name: 'Paralelepípedo' }
    ]
  },
  // QUESTÃO 6 (1.0 pt) — Nível 3: Intermediário (Previsão de fechamento convergente)
  {
    id: 6,
    block: 'BLOCK_3_FOLDING',
    blockTitle: 'Nível 3 • Previsão de Dobradura',
    title: 'O que será formado ao dobrar?',
    visualPrompt: 'Imagine dobrar os 4 triângulos deste molde para cima até suas pontas se encontrarem. Qual sólido surgirá?',
    points: 1.0,
    type: 'predict_solid',
    options: [
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide de Base Quadrada' },
      { id: 'cube', solid: 'cube', name: 'Cubo' },
      { id: 'cuboid', solid: 'cuboid', name: 'Paralelepípedo' }
    ]
  },
  // QUESTÃO 7 (1.0 pt) — Nível 3: Intermediário-Avançado (Validação contra sobreposição de faces)
  {
    id: 7,
    block: 'BLOCK_3_FOLDING',
    blockTitle: 'Nível 3 • Validação Geométrica',
    title: 'Qual molde fecha corretamente?',
    visualPrompt: 'Apenas uma das planificações abaixo fecha um Cubo sem deixar faces sobrepostas. Qual é ela?',
    points: 1.0,
    type: 'valid_net',
    options: [
      { id: 'net_a', name: 'Molde A (Cruz 1-4-1)', isValid: true, description: '4 faces centrais + 1 topo + 1 base em lados opostos' },
      { id: 'net_b', name: 'Molde B (5 em Linha)', isValid: false, description: '5 faces seguidas na mesma faixa horizontal' },
      { id: 'net_c', name: 'Molde C (Abas no Mesmo Lado)', isValid: false, description: 'Duas abas colocadas no mesmo lado superior' }
    ]
  },
  // QUESTÃO 8 (0.75 pt) — Nível 4: Avançado (Manipulação 3D e Oclusão)
  {
    id: 8,
    block: 'BLOCK_4_SPATIAL',
    blockTitle: 'Nível 4 • Rotação e Face Oculta',
    title: 'Descubra a face oculta',
    visualPrompt: 'Gire o cubo colorido 3D. Qual é a cor da face OPOSTA à face AZUL (do outro lado)?',
    points: 0.75,
    type: 'cube_face_color',
    options: [
      { id: 'red', name: 'Vermelho', hex: '#ef4444' },
      { id: 'green', name: 'Verde', hex: '#10b981' },
      { id: 'yellow', name: 'Amarelo', hex: '#eab308' },
      { id: 'purple', name: 'Roxo', hex: '#a855f7' }
    ]
  },
  // QUESTÃO 9 (0.75 pt) — Nível 4: Avançado (Abstração de Projeção Ortográfica)
  {
    id: 9,
    block: 'BLOCK_4_SPATIAL',
    blockTitle: 'Nível 4 • Projeção Ortográfica',
    title: 'Encontre a Vista Superior',
    visualPrompt: 'Observe e gire o prisma triangular 3D. Qual desenho 2D representa sua vista olhando diretamente de cima?',
    points: 0.75,
    type: 'orthographic_view',
    options: [
      { id: 'view_a', name: 'Vista A: Retângulo com linha da aresta central', isCorrect: true },
      { id: 'view_b', name: 'Vista B: Triângulo isolado', isCorrect: false },
      { id: 'view_c', name: 'Vista C: Círculo contínuo', isCorrect: false }
    ]
  },
  // QUESTÃO 10 (1.5 pt) — Nível 5: Complexidade Máxima (Composição Construtiva 3D)
  {
    id: 10,
    block: 'BLOCK_5_COMPOSITION',
    blockTitle: 'Nível 5 • Desafio Final de Composição 3D',
    title: 'Construa a Casa Geométrica 3D',
    visualPrompt: 'Combine dois sólidos geométricos para construir a estrutura 3D completa: escolha a Base e o Telhado corretos.',
    points: 1.5,
    type: 'compose_house',
    options: [
      { id: 'cube', name: 'Cubo (Corpo)', type: 'base' },
      { id: 'triangular_prism', name: 'Prisma Triangular (Telhado)', type: 'roof' },
      { id: 'sphere', name: 'Esfera (Distrator)', type: 'distractor' }
    ]
  }
];

export function getQuestionsByMode(mode: AssessmentMode): QuestionDef[] {
  return mode === 'PRACTICE' ? PRACTICE_QUESTIONS : QUESTIONS;
}

// SERVER-SIDE VALIDATION FUNCTION
// Protege gabarito contra inspeção no frontend (suporta Avaliação 1..10 e Tour de Treino 101..103)
export function gradeStudentAnswer(questionId: number, answerData: any): { isCorrect: boolean; score: number } {
  const allQuestions = [...QUESTIONS, ...PRACTICE_QUESTIONS];
  const q = allQuestions.find(item => item.id === questionId);
  if (!q) return { isCorrect: false, score: 0 };

  switch (q.id) {
    // ------------------------------------------------------------------------
    // QUESTÕES DO MODO TREINO (TOUR / TUTORIAL 101..103)
    // ------------------------------------------------------------------------
    case 101: {
      const isCorrect = answerData?.selectedOption === 'line';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 102: {
      const isCorrect = answerData?.selectedOption === 'unfolds';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 103: {
      const leftOk = answerData?.leftSlot === 'blue_piece';
      const rightOk = answerData?.rightSlot === 'yellow_piece';
      const isCorrect = leftOk && rightOk;
      let score = 0;
      if (isCorrect) score = q.points;
      else if (leftOk || rightOk) score = Number((q.points * 0.5).toFixed(2));
      return { isCorrect, score };
    }

    // ------------------------------------------------------------------------
    // QUESTÕES DO MODO AVALIAÇÃO (1..10 EM ORDEM CRESCENTE DE COMPLEXIDADE)
    // ------------------------------------------------------------------------
    case 1: {
      const isCorrect = answerData?.selectedOption === 'cube';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 2: {
      const answers = answerData?.classifications || {};
      let correctCount = 0;
      if (answers.circle === '2D') correctCount++;
      if (answers.rectangle === '2D') correctCount++;
      if (answers.cylinder === '3D') correctCount++;
      if (answers.pyramid === '3D') correctCount++;
      
      const score = Number(((correctCount / 4) * q.points).toFixed(2));
      return { isCorrect: correctCount === 4, score };
    }
    case 3: {
      // Q3 agora é o Cilindro (molde mais simples com 2 círculos)
      const isCorrect = answerData?.selectedOption === 'cylinder';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 4: {
      // Q4 agora é o Cubo (molde de 6 quadrados)
      const isCorrect = answerData?.selectedOption === 'cube';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 5: {
      // Q5 agora é o Prisma Triangular (3 retângulos + 2 triângulos)
      const isCorrect = answerData?.selectedOption === 'triangular_prism';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 6: {
      // Q6 agora é a Pirâmide de Base Quadrada (previsão de dobradura convergente)
      const isCorrect = answerData?.selectedOption === 'square_pyramid';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 7: {
      const isCorrect = answerData?.selectedOption === 'net_a';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 8: {
      // Opposite to Blue (front) is Red (back)
      const isCorrect = answerData?.selectedOption === 'red';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 9: {
      const isCorrect = answerData?.selectedOption === 'view_a';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 10: {
      const baseMatch = answerData?.basePiece === 'cube';
      const roofMatch = answerData?.roofPiece === 'triangular_prism';
      const isCorrect = baseMatch && roofMatch;
      let score = 0;
      if (baseMatch && roofMatch) score = q.points;
      else if (baseMatch || roofMatch) score = Number((q.points * 0.5).toFixed(2));
      return { isCorrect, score };
    }
    default:
      return { isCorrect: false, score: 0 };
  }
}

// Strip answer keys for the client when delivering assessment questions
export function getSanitizedQuestions(mode: AssessmentMode = 'EVALUATION'): QuestionDef[] {
  const list = getQuestionsByMode(mode);
  return list.map(q => {
    return {
      ...q,
      options: q.options ? q.options.map((opt: any) => {
        const sanitized = { ...opt };
        delete sanitized.isCorrect;
        delete sanitized.expected;
        delete sanitized.isValid;
        return sanitized;
      }) : undefined
    };
  });
}
