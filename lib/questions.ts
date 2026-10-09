import { QuestionDef, QuestionBlock } from '@/types/geo3d';

export const QUESTION_BLOCKS: Record<QuestionBlock, { title: string; maxScore: number; description: string }> = {
  BLOCK_1_RECOGNITION: {
    title: 'Bloco 1 — Reconhecimento 2D e 3D',
    maxScore: 2.0,
    description: 'Diferenciação entre figuras planas (2D) e sólidos com volume espacial (3D).'
  },
  BLOCK_2_NETS: {
    title: 'Bloco 2 — Associação entre Planificações e Sólidos',
    maxScore: 3.0,
    description: 'Correspondência visual entre moldes bidimensionais abertos e seus respectivos sólidos tridimensionais.'
  },
  BLOCK_3_FOLDING: {
    title: 'Bloco 3 — Previsão e Dobradura Virtual',
    maxScore: 2.0,
    description: 'Previsão de montagem espacial e identificação de planificações matematicamente válidas.'
  },
  BLOCK_4_SPATIAL: {
    title: 'Bloco 4 — Manipulação e Visualização 3D',
    maxScore: 1.5,
    description: 'Rotação tridimensional livre, identificação de faces ocultas e projeções de vistas ortográficas.'
  },
  BLOCK_5_COMPOSITION: {
    title: 'Bloco 5 — Composição de Formas',
    maxScore: 1.5,
    description: 'Construção tridimensional estruturada através da junção de primitivas geométricas.'
  }
};

export const QUESTIONS: QuestionDef[] = [
  // QUESTÃO 1 (1.0 pt)
  {
    id: 1,
    block: 'BLOCK_1_RECOGNITION',
    blockTitle: 'Reconhecimento 2D e 3D',
    title: 'Identifique o objeto 3D',
    visualPrompt: 'Selecione a figura que possui volume tridimensional (3D).',
    points: 1.0,
    type: 'select_single',
    options: [
      { id: 'square', label: 'Quadrado Plano', is3D: false, shape: 'square' },
      { id: 'triangle', label: 'Triângulo Plano', is3D: false, shape: 'triangle' },
      { id: 'cube', label: 'Cubo com Volume', is3D: true, shape: 'cube' }
    ]
  },
  // QUESTÃO 2 (1.0 pt)
  {
    id: 2,
    block: 'BLOCK_1_RECOGNITION',
    blockTitle: 'Reconhecimento 2D e 3D',
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
  // QUESTÃO 3 (1.0 pt)
  {
    id: 3,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Planificações e Sólidos',
    title: 'Encontre o Cubo',
    visualPrompt: 'Observe a planificação de 6 quadrados. Qual sólido corresponde a ela?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'cube', solid: 'cube', name: 'Cubo' },
      { id: 'cylinder', solid: 'cylinder', name: 'Cilindro' },
      { id: 'triangular_prism', solid: 'triangular_prism', name: 'Prisma Triangular' }
    ]
  },
  // QUESTÃO 4 (1.0 pt)
  {
    id: 4,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Planificações e Sólidos',
    title: 'Encontre o Prisma Triangular',
    visualPrompt: 'Observe o molde com 3 retângulos e 2 triângulos. Qual é o sólido formado?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide Quadrada' },
      { id: 'triangular_prism', solid: 'triangular_prism', name: 'Prisma Triangular' },
      { id: 'cuboid', solid: 'cuboid', name: 'Paralelepípedo' }
    ]
  },
  // QUESTÃO 5 (1.0 pt)
  {
    id: 5,
    block: 'BLOCK_2_NETS',
    blockTitle: 'Planificações e Sólidos',
    title: 'Encontre o Cilindro',
    visualPrompt: 'Observe o molde com 1 retângulo e 2 círculos. Qual é o sólido correspondente?',
    points: 1.0,
    type: 'select_net',
    options: [
      { id: 'cylinder', solid: 'cylinder', name: 'Cilindro' },
      { id: 'cube', solid: 'cube', name: 'Cubo' },
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide' }
    ]
  },
  // QUESTÃO 6 (1.0 pt)
  {
    id: 6,
    block: 'BLOCK_3_FOLDING',
    blockTitle: 'Previsão e Dobradura',
    title: 'O que será formado ao dobrar?',
    visualPrompt: 'Preveja qual sólido será formado quando este molde se fechar.',
    points: 1.0,
    type: 'predict_solid',
    options: [
      { id: 'cube', solid: 'cube', name: 'Cubo Perfeito' },
      { id: 'cuboid', solid: 'cuboid', name: 'Paralelepípedo Alongado' },
      { id: 'square_pyramid', solid: 'square_pyramid', name: 'Pirâmide' }
    ]
  },
  // QUESTÃO 7 (1.0 pt)
  {
    id: 7,
    block: 'BLOCK_3_FOLDING',
    blockTitle: 'Previsão e Dobradura',
    title: 'Qual molde fecha corretamente?',
    visualPrompt: 'Selecione a planificação geometricamente válida que fecha sem sobrepor faces.',
    points: 1.0,
    type: 'valid_net',
    options: [
      { id: 'net_a', name: 'Molde A (Cruz Latina 1-4-1)', isValid: true, description: '4 faces em linha + 1 superior + 1 inferior em colunas opostas' },
      { id: 'net_b', name: 'Molde B (5 em Linha)', isValid: false, description: '5 faces alinhadas (sobrepõem faces ao fechar)' },
      { id: 'net_c', name: 'Molde C (Abas Sobrepostas)', isValid: false, description: 'Duas abas adjacentes no mesmo lado superior' }
    ]
  },
  // QUESTÃO 8 (0.75 pt)
  {
    id: 8,
    block: 'BLOCK_4_SPATIAL',
    blockTitle: 'Manipulação 3D',
    title: 'Descubra a face oculta',
    visualPrompt: 'Gire o cubo 3D. Qual é a cor da face OPOSTA à face AZUL (traseira)?',
    points: 0.75,
    type: 'cube_face_color',
    options: [
      { id: 'red', name: 'Vermelho', hex: '#ef4444' },
      { id: 'green', name: 'Verde', hex: '#10b981' },
      { id: 'yellow', name: 'Amarelo', hex: '#eab308' },
      { id: 'purple', name: 'Roxo', hex: '#a855f7' }
    ]
  },
  // QUESTÃO 9 (0.75 pt)
  {
    id: 9,
    block: 'BLOCK_4_SPATIAL',
    blockTitle: 'Manipulação 3D',
    title: 'Encontre a Vista Superior',
    visualPrompt: 'Observe o prisma triangular 3D. Qual das opções representa a vista de cima (superior)?',
    points: 0.75,
    type: 'orthographic_view',
    options: [
      { id: 'view_a', name: 'Vista A: Retângulo Único com Aresta Central', isCorrect: true },
      { id: 'view_b', name: 'Vista B: Triângulo Isósceles', isCorrect: false },
      { id: 'view_c', name: 'Vista C: Círculo Completo', isCorrect: false }
    ]
  },
  // QUESTÃO 10 (1.5 pt)
  {
    id: 10,
    block: 'BLOCK_5_COMPOSITION',
    blockTitle: 'Composição de Formas',
    title: 'Construa a Casa Geométrica 3D',
    visualPrompt: 'Monte a casa: posicione o Cubo na base e o Prisma Triangular no telhado.',
    points: 1.5,
    type: 'compose_house',
    options: [
      { id: 'cube', name: 'Cubo (Corpo)', type: 'base' },
      { id: 'triangular_prism', name: 'Prisma Triangular (Telhado)', type: 'roof' },
      { id: 'sphere', name: 'Esfera (Distrator)', type: 'distractor' }
    ]
  }
];

// SERVER-SIDE VALIDATION FUNCTION
// Protege gabarito contra inspeção no frontend
export function gradeStudentAnswer(questionId: number, answerData: any): { isCorrect: boolean; score: number } {
  const q = QUESTIONS.find(item => item.id === questionId);
  if (!q) return { isCorrect: false, score: 0 };

  switch (q.id) {
    case 1: {
      const isCorrect = answerData?.selectedOption === 'cube';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 2: {
      // answerData format: { classifications: { circle: '2D', cylinder: '3D', rectangle: '2D', pyramid: '3D' } }
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
      const isCorrect = answerData?.selectedOption === 'cube';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 4: {
      const isCorrect = answerData?.selectedOption === 'triangular_prism';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 5: {
      const isCorrect = answerData?.selectedOption === 'cylinder';
      return { isCorrect, score: isCorrect ? q.points : 0 };
    }
    case 6: {
      const isCorrect = answerData?.selectedOption === 'cube';
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
      // House composition: base must be 'cube', roof must be 'triangular_prism'
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
export function getSanitizedQuestions(): QuestionDef[] {
  return QUESTIONS.map(q => {
    // Return question without server-only scoring flags
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
