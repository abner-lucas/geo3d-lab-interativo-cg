'use client';

import React, { useState } from 'react';
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
  CheckCircle2, 
  HelpCircle, 
  Play, 
  Sparkles, 
  RotateCw, 
  Layers, 
  Box, 
  Eye, 
  Maximize2 
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
  mode,
  isConfirmed = false
}: QuestionRendererProps) {
  const [showDemoAnimation, setShowDemoAnimation] = useState<boolean>(false);
  const [unfoldDemoProgress, setUnfoldDemoProgress] = useState<number>(0);

  // Helper for single choice selection
  const handleSelectOption = (optionId: string) => {
    onAnswerChange({ selectedOption: optionId });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 1: Identifique o objeto 3D (Quadrado, Triângulo, Cubo) */}
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
                <span className="text-xs text-slate-500">Superfície plana (2D)</span>
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
                <span className="text-xs text-slate-500">Superfície plana (2D)</span>
              </div>
            </button>

            {/* Opção 3: Cubo 3D (com volume!) */}
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
                <GeoCanvas solidType="cube" height={128} interactive={false} autoRotateInit={true} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Cubo Espacial</p>
                <span className="text-xs text-emerald-600 font-semibold">Possui Volume (3D)</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 2: Plano ou Volume? Classificador 2D vs 3D */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 2 && (
        <Classifier2D3D
          initialClassifications={currentAnswer?.classifications || {}}
          onChange={(classifications) => onAnswerChange({ classifications })}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 3: Encontre o Cubo a partir da Planificação */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 3 && (
        <div className="flex flex-col gap-6">
          {/* Planificação de Referência */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Molde 2D de Referência (6 Quadrados)
              </span>
              <CubeLatinCrossNet className="w-44 h-40" />
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-6 max-w-xs text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm mb-1">Qual sólido este molde forma?</p>
              <p>Ao ser dobrado e fechado no espaço 3D, qual dos três sólidos abaixo será formado?</p>
            </div>
          </div>

          {/* 3 Opções de Sólidos */}
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
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 4: Encontre o Prisma Triangular */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 4 && (
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
              <p>Identifique qual sólido tridimensional possui exatamente 3 faces retangulares e 2 bases triangulares.</p>
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
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 5: Encontre o Cilindro */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 5 && (
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
              <p>O retângulo forma a lateral curva e os dois círculos formam a tampa superior e a base inferior.</p>
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
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 6: Previsão e Dobradura Virtual */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 6 && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Planificação Aberta (Preveja o resultado)
              </span>
              <CubeLatinCrossNet className="w-44 h-36" />
            </div>

            <div className="flex-1 max-w-md flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-800">
                Preveja mentalmente o fechamento das 6 faces:
              </p>
              <p className="text-xs text-slate-600">
                Selecione abaixo o sólido correto antes de visualizar a dobradura.
              </p>

              {/* Demonstração de Dobradura para Aprendizagem (permitida no treino ou após responder) */}
              {(mode === 'PRACTICE' || currentAnswer?.selectedOption) && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Recurso Pedagógico: Ver Dobradura</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoAnimation(!showDemoAnimation)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {showDemoAnimation ? 'Ocultar Animação' : 'Ver em 3D'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Animação de Dobradura Interativa */}
          {showDemoAnimation && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Simulação 3D de Dobradura e Fechamento
                </span>
                <span className="text-xs text-slate-400">Use o botão &ldquo;ABRIR/FECHAR&rdquo; abaixo</span>
              </div>
              <GeoCanvas solidType="cube" height={260} interactive={true} allowUnfold={true} />
            </div>
          )}

          {/* Opções de Sólidos */}
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
                    <GeoCanvas solidType={opt.solid} height={144} interactive={false} autoRotateInit={true} />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 7: Qual molde funciona? (Cruz Latina vs Inválidos) */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 7 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Molde A: Válido (Cruz Latina 1-4-1) */}
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
                <span className="text-xs text-slate-500">Cruz regular (1-4-1)</span>
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
                <span className="text-xs text-slate-500">5 faces na mesma linha</span>
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
                <span className="text-xs text-slate-500">Duas abas no mesmo lado</span>
              </div>
            </button>
          </div>

          {/* Demonstração visual animada após confirmação ou no modo treino */}
          {(mode === 'PRACTICE' || currentAnswer?.selectedOption) && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Comprovação Geométrica 3D
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  O Molde A dobra perfeitamente sem colidir faces
                </span>
              </div>
              <GeoCanvas solidType="cube" height={220} interactive={true} allowUnfold={true} />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* QUESTÃO 8: Descubra a Face Oposta (Cubo 3D Manipulável) */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 8 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualizador 3D Interativo do Cubo */}
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

          {/* Painel de Resposta da Cor */}
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
      {/* QUESTÃO 9: Encontre a Vista Superior */}
      {/* ------------------------------------------------------------------ */}
      {question.id === 9 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sólido 3D com destaque superior */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Sólido Tridimensional (Prisma Triangular)
              </span>
              <span className="text-xs text-slate-500">Gire para observar o ângulo superior</span>
            </div>
            <GeoCanvas 
              solidType="triangular_prism" 
              height={320} 
              interactive={true} 
              allowUnfold={false} 
            />
          </div>

          {/* Vistas Ortográficas Possíveis */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <p className="font-bold text-slate-800 text-sm mb-1">Qual é a Vista Superior (de cima)?</p>
              <p className="text-xs text-slate-600 mb-4">
                Imagine projetar os raios visuais diretamente de cima para baixo:
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
                    <span className="text-[11px] text-slate-500">Retângulo dividido pela aresta superior</span>
                  </div>
                </button>

                {/* Vista B: Triângulo (Vista Lateral/Frontal) */}
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
                    <span className="text-[11px] text-slate-500">Triângulo (Base frontal)</span>
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
      {/* QUESTÃO 10: Construa a Casa Geométrica 3D (Composição) */}
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
