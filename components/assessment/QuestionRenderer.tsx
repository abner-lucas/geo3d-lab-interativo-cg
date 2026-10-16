'use client';

import React from 'react';
import { QuestionDef, AssessmentMode } from '@/types/geo3d';
import { GeoCanvas } from '@/components/three/GeoCanvas';
import { 
  CubeLatinCrossNet, 
  CubeInvalidNetLine, 
  CubeInvalidNetOverlap, 
  TriangularPrismNet, 
  CylinderNet, 
  PyramidNet 
} from '@/components/geometric/GeometricNets';
import { Classifier2D3D } from './Classifier2D3D';
import { HouseComposer } from './HouseComposer';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2,
  MousePointerClick,
  Compass,
  Layers
} from 'lucide-react';

interface QuestionRendererProps {
  question: QuestionDef;
  currentAnswer: any;
  onAnswerChange: (data: any) => void;
  mode: AssessmentMode;
  isConfirmed?: boolean;
}

export function QuestionRenderer({
  question,
  currentAnswer,
  onAnswerChange,
}: QuestionRendererProps) {
  // Helper for single choice selection
  const handleSelectOption = (optionId: string) => {
    onAnswerChange({ selectedOption: optionId });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ================================================================== */}
      {/* MODO TREINO — TUTORIAL DE AMBIENTAÇÃO (QUESTÕES 101, 102, 103)      */}
      {/* ================================================================== */}

      {/* TREINO PASSO 1 (ID 101): Aprendendo a clicar em uma alternativa */}
      {question.id === 101 && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <MousePointerClick className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-black uppercase tracking-wider mb-0.5">Guia de Treino (Passo 1 de 3) — Como Marcar Respostas</p>
              <p>
                Durante a avaliação, basta clicar sobre o cartão desejado. Uma borda azul aparecerá ao redor da opção escolhida e o sistema salvará sua resposta automaticamente. Teste clicando na <strong>Linha Reta</strong> abaixo:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Opção 1: Linha Reta */}
            <button
              type="button"
              onClick={() => handleSelectOption('line')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'line'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'line'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cartão A</span>
              <div className="w-32 h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                  <line x1="10" y1="30" x2="90" y2="30" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Linha Reta</p>
                <span className="text-xs text-slate-500">Traço reto contínuo</span>
              </div>
            </button>

            {/* Opção 2: Pontos Separados */}
            <button
              type="button"
              onClick={() => handleSelectOption('dots')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'dots'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'dots'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cartão B</span>
              <div className="w-32 h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                  <circle cx="20" cy="30" r="6" fill="#f59e0b" />
                  <circle cx="50" cy="30" r="6" fill="#f59e0b" />
                  <circle cx="80" cy="30" r="6" fill="#f59e0b" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Pontos Separados</p>
                <span className="text-xs text-slate-500">Três pontos isolados</span>
              </div>
            </button>

            {/* Opção 3: Linha Ondulada */}
            <button
              type="button"
              onClick={() => handleSelectOption('wave')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'wave'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'wave'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cartão C</span>
              <div className="w-32 h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                  <path d="M 10 30 Q 30 5, 50 30 T 90 30" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Linha Ondulada</p>
                <span className="text-xs text-slate-500">Curva em formato de onda</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TREINO PASSO 2 (ID 102): Aprendendo a girar a câmera 3D e usar os botões do visualizador */}
      {question.id === 102 && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Compass className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-black uppercase tracking-wider mb-0.5">Guia de Treino (Passo 2 de 3) — Como Usar o Visualizador 3D</p>
              <p>
                Você pode <strong>arrastar com o mouse/dedo</strong> sobre a caixa 3D ou usar as <strong>setas no canto superior direito</strong> para girar o objeto. Teste também clicar no botão azul <strong>&ldquo;ABRIR PLANIFICAÇÃO&rdquo;</strong> na barra inferior da tela 3D e responda abaixo:
              </p>
            </div>
          </div>

          <GeoCanvas
            solidType="cuboid"
            height={280}
            interactive={true}
            allowUnfold={true}
            showFaceColors={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.options?.map((opt: any) => {
              const isSelected = currentAnswer?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <CheckCircle2 className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TREINO PASSO 3 (ID 103): Aprendendo a preencher lacunas por clique */}
      {question.id === 103 && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Layers className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-black uppercase tracking-wider mb-0.5">Guia de Treino (Passo 3 de 3) — Como Encaixar Peças e Concluir</p>
              <p>
                Algumas questões possuem espaços para preencher clicando nos botões correspondentes. Complete os dois lados abaixo (<strong>Peça Azul na Esquerda</strong> e <strong>Peça Amarela na Direita</strong>) e depois clique no botão verde <strong>&ldquo;CONCLUIR TREINO&rdquo;</strong>!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Espaço da Esquerda */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col items-center gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                1. Espaço da Esquerda (Coloque Azul)
              </span>
              <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center font-bold text-xs ${
                currentAnswer?.leftSlot === 'blue_piece'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : currentAnswer?.leftSlot === 'yellow_piece'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                  : 'bg-white border-dashed border-slate-300 text-slate-400'
              }`}>
                {currentAnswer?.leftSlot === 'blue_piece'
                  ? 'Peça Azul'
                  : currentAnswer?.leftSlot === 'yellow_piece'
                  ? 'Peça Amarela'
                  : 'Vazio'}
              </div>
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => onAnswerChange({ ...currentAnswer, leftSlot: 'blue_piece' })}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    currentAnswer?.leftSlot === 'blue_piece'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                  }`}
                >
                  Colocar Azul
                </button>
                <button
                  type="button"
                  onClick={() => onAnswerChange({ ...currentAnswer, leftSlot: 'yellow_piece' })}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    currentAnswer?.leftSlot === 'yellow_piece'
                      ? 'bg-amber-400 text-slate-900 border-amber-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  Colocar Amarela
                </button>
              </div>
            </div>

            {/* Espaço da Direita */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col items-center gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                2. Espaço da Direita (Coloque Amarela)
              </span>
              <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center font-bold text-xs ${
                currentAnswer?.rightSlot === 'yellow_piece'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                  : currentAnswer?.rightSlot === 'blue_piece'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-white border-dashed border-slate-300 text-slate-400'
              }`}>
                {currentAnswer?.rightSlot === 'yellow_piece'
                  ? 'Peça Amarela'
                  : currentAnswer?.rightSlot === 'blue_piece'
                  ? 'Peça Azul'
                  : 'Vazio'}
              </div>
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => onAnswerChange({ ...currentAnswer, rightSlot: 'blue_piece' })}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    currentAnswer?.rightSlot === 'blue_piece'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                  }`}
                >
                  Colocar Azul
                </button>
                <button
                  type="button"
                  onClick={() => onAnswerChange({ ...currentAnswer, rightSlot: 'yellow_piece' })}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                    currentAnswer?.rightSlot === 'yellow_piece'
                      ? 'bg-amber-400 text-slate-900 border-amber-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  Colocar Amarela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODO AVALIAÇÃO — 10 QUESTÕES EM ORDEM CRESCENTE DE COMPLEXIDADE     */}
      {/* ================================================================== */}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 1 (Nível 1): Identifique o objeto 3D (Quadrado, Triângulo, Cubo) */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 1 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Opção 1: Quadrado 2D */}
            <button
              type="button"
              onClick={() => handleSelectOption('square')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'square'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'square'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Figura A</span>
              <div className="w-32 h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-100 border-2 border-blue-500 rounded-xs" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Quadrado</p>
              </div>
            </button>

            {/* Opção 2: Triângulo 2D */}
            <button
              type="button"
              onClick={() => handleSelectOption('triangle')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'triangle'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'triangle'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Figura B</span>
              <div className="w-32 h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-amber-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Triângulo</p>
              </div>
            </button>

            {/* Opção 3: Cubo */}
            <button
              type="button"
              onClick={() => handleSelectOption('cube')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'cube'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'cube'}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Figura C</span>
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <GeoCanvas solidType="cube" height={128} interactive={false} showFaceColors={false} autoRotateInit={true} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Cubo</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 2 (Nível 1): Plano ou Volume? Classificador 2D vs 3D */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 2 && (
        <Classifier2D3D
          initialClassifications={currentAnswer?.classifications || {}}
          onChange={(classifications) => onAnswerChange({ classifications })}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 3 (Nível 2 - Elementar): Encontre o Cilindro */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 3 && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Molde: 1 Retângulo e 2 Círculos
              </span>
              <CylinderNet className="w-48 h-36" />
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6 max-w-xs text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm mb-1">Qual sólido é formado?</p>
              <p>O retângulo curva-se para formar a lateral e os dois círculos fecham a tampa superior e a base inferior.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.options?.map((opt: any) => {
              const isSelected = currentAnswer?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} showFaceColors={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 4 (Nível 2 - Regular): Encontre o Cubo a partir da Planificação */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 4 && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Molde 2D de Referência (6 Quadrados Iguais)
              </span>
              <CubeLatinCrossNet className="w-44 h-40" />
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6 max-w-xs text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm mb-1">Qual sólido este molde forma?</p>
              <p>Ao ser dobrado e fechado no espaço 3D, qual dos três sólidos abaixo será formado pelas 6 faces quadradas?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.options?.map((opt: any) => {
              const isSelected = currentAnswer?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} showFaceColors={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 5 (Nível 2 - Combinado): Encontre o Prisma Triangular */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 5 && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Molde: 3 Retângulos e 2 Triângulos
              </span>
              <TriangularPrismNet className="w-48 h-36" />
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6 max-w-xs text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm mb-1">Associação geométrica</p>
              <p>Identifique qual sólido tridimensional possui exatamente 3 faces laterais retangulares e 2 bases triangulares.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.options?.map((opt: any) => {
              const isSelected = currentAnswer?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} showFaceColors={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 6 (Nível 3 - Previsão de Dobradura Piramidal) */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 6 && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Planificação Aberta (1 Quadrado Central + 4 Triângulos)
              </span>
              <PyramidNet className="w-44 h-40" />
            </div>

            <div className="flex-1 max-w-md flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-800">
                Preveja o fechamento deste molde:
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                O quadrado central fica apoiado no chão enquanto as 4 abas triangulares sobem até se unirem em uma ponta no topo. Qual sólido será formado?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.options?.map((opt: any) => {
              const isSelected = currentAnswer?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition text-center cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} showFaceColors={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 7 (Nível 3 - Validação Geométrica de Molde) */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 7 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Molde A: Válido (Cruz 1-4-1) */}
            <button
              type="button"
              onClick={() => handleSelectOption('net_a')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'net_a'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'net_a'}
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Molde A</span>
              <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-2">
                <CubeLatinCrossNet className="w-40 h-36" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Disposição 1</p>
                <span className="text-xs text-slate-500">4 centrais + 1 em cada lado oposto</span>
              </div>
            </button>

            {/* Molde B: Inválido (5 em linha) */}
            <button
              type="button"
              onClick={() => handleSelectOption('net_b')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'net_b'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'net_b'}
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Molde B</span>
              <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-2">
                <CubeInvalidNetLine className="w-40 h-36" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Disposição 2</p>
                <span className="text-xs text-slate-500">5 quadrados seguidos em linha</span>
              </div>
            </button>

            {/* Molde C: Inválido (Abas sobrepostas) */}
            <button
              type="button"
              onClick={() => handleSelectOption('net_c')}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between gap-4 transition text-center cursor-pointer ${
                currentAnswer?.selectedOption === 'net_c'
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              aria-pressed={currentAnswer?.selectedOption === 'net_c'}
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Molde C</span>
              <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-2">
                <CubeInvalidNetOverlap className="w-40 h-36" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Disposição 3</p>
                <span className="text-xs text-slate-500">Duas abas apenas no lado superior</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 8 (Nível 4 - Manipulação 3D): Descubra a Face Oposta */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 8 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Gire o cubo livremente para ver todos os lados
              </span>
              <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Arraste com mouse ou toque
              </span>
            </div>
            <GeoCanvas 
              solidType="cube" 
              height={340} 
              interactive={true} 
              allowUnfold={false} 
              showFaceColors={true} 
            />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-4">
                <p className="font-bold text-xs text-blue-900 uppercase">Face de Referência:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-4 h-4 rounded-md bg-blue-600" />
                  <span className="font-bold text-sm text-slate-800">Face AZUL (Frente)</span>
                </div>
              </div>

              <p className="font-bold text-slate-800 text-sm mb-1">Qual é a cor da face OPOSTA?</p>
              <p className="text-xs text-slate-600 mb-4">
                Gire o cubo para examinar a face de trás (oposta à azul) e selecione a cor:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options?.map((opt: any) => {
                  const isSelected = currentAnswer?.selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span className="w-5 h-5 rounded-md shadow-xs border border-black/10 shrink-0" style={{ backgroundColor: opt.hex }} />
                      <span className="font-bold text-xs text-slate-800">{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 italic text-center">
              Dica: Use também os botões direcionais no canto superior do visualizador 3D.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 9 (Nível 4 - Vista de Cima): Encontre a Vista Superior */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 9 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Sólido Tridimensional (Prisma Triangular)
              </span>
              <span className="text-xs text-slate-500">Gire para olhar o objeto de vários ângulos</span>
            </div>
            <GeoCanvas 
              solidType="triangular_prism" 
              height={320} 
              interactive={true} 
              allowUnfold={false}
              showFaceColors={false}
            />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <p className="font-bold text-slate-800 text-sm mb-1">Qual é a Vista Superior (olhando de cima)?</p>
              <p className="text-xs text-slate-600 mb-4">
                Imagine olhar este prisma triangular exatamente de cima para baixo:
              </p>

              <div className="flex flex-col gap-3">
                {/* Vista A: Retângulo com linha central (correta) */}
                <button
                  type="button"
                  onClick={() => handleSelectOption('view_a')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer ${
                    currentAnswer?.selectedOption === 'view_a'
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                  aria-pressed={currentAnswer?.selectedOption === 'view_a'}
                >
                  <div className="w-16 h-12 bg-white rounded-md border border-slate-300 flex items-center justify-center p-1 shrink-0">
                    <svg viewBox="0 0 50 36" className="w-full h-full">
                      <rect x="2" y="4" width="46" height="28" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
                      <line x1="25" y1="4" x2="25" y2="32" stroke="#0369a1" strokeWidth="2" strokeDasharray="2 2" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-800">Vista A</p>
                    <span className="text-[11px] text-slate-500">Retângulo com divisão central</span>
                  </div>
                </button>

                {/* Vista B: Triângulo */}
                <button
                  type="button"
                  onClick={() => handleSelectOption('view_b')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer ${
                    currentAnswer?.selectedOption === 'view_b'
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                  aria-pressed={currentAnswer?.selectedOption === 'view_b'}
                >
                  <div className="w-16 h-12 bg-white rounded-md border border-slate-300 flex items-center justify-center p-1 shrink-0">
                    <svg viewBox="0 0 50 36" className="w-full h-full">
                      <polygon points="25,4 6,32 44,32" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-800">Vista B</p>
                    <span className="text-[11px] text-slate-500">Triângulo simples</span>
                  </div>
                </button>

                {/* Vista C: Círculo */}
                <button
                  type="button"
                  onClick={() => handleSelectOption('view_c')}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer ${
                    currentAnswer?.selectedOption === 'view_c'
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                  aria-pressed={currentAnswer?.selectedOption === 'view_c'}
                >
                  <div className="w-16 h-12 bg-white rounded-md border border-slate-300 flex items-center justify-center p-1 shrink-0">
                    <svg viewBox="0 0 50 36" className="w-full h-full">
                      <circle cx="25" cy="18" r="14" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-800">Vista C</p>
                    <span className="text-[11px] text-slate-500">Círculo</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 10 (Nível 5 - Composição): Construa a Casa Geométrica 3D */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 10 && (
        <HouseComposer
          initialValue={currentAnswer}
          onChange={(val) => onAnswerChange(val)}
        />
      )}
    </div>
  );
}
