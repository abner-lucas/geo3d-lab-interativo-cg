'use client';

import React, { useState } from 'react';
import { SolidType } from '@/types/geo3d';
import { GeoCanvas } from '@/components/three/GeoCanvas';
import { 
  Box, 
  Layers, 
  Triangle, 
  Cylinder, 
  ChevronRight, 
  Info, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Maximize2,
  Minimize2,
  ShieldCheck
} from 'lucide-react';

export function ExplorationLab() {
  const [activeSolid, setActiveSolid] = useState<SolidType>('cube');
  const [unfoldProgress, setUnfoldProgress] = useState<number>(0);
  const [showFaceColors, setShowFaceColors] = useState<boolean>(true);

  const solidsData: Record<SolidType, {
    name: string;
    description: string;
    facesCount: number;
    verticesCount: number;
    edgesCount: number;
    faceShapes: string;
    netDescription: string;
    eulerFormula: string;
  }> = {
    cube: {
      name: 'Cubo (Hexaedro Regular)',
      description: 'Sólido platônico regular formado por 6 faces quadradas congruentes que se encontram em ângulos de 90°.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      faceShapes: '6 quadrados idênticos',
      netDescription: 'Cruz Latina (1-4-1) com 6 quadrados conectados pelas arestas comuns.',
      eulerFormula: '8 vértices - 12 arestas + 6 faces = 2'
    },
    cuboid: {
      name: 'Paralelepípedo (Bloco Retangular)',
      description: 'Prisma reto com bases retangulares e faces laterais retangulares perpendiculares entre si.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      faceShapes: '6 retângulos (3 pares de faces opostas congruentes)',
      netDescription: '6 retângulos organizados em cruz retangular com abas opostas congruentes.',
      eulerFormula: '8 vértices - 12 arestas + 6 faces = 2'
    },
    triangular_prism: {
      name: 'Prisma Triangular Reto',
      description: 'Poliedro com 2 bases triangulares paralelas congruentes e 3 faces laterais retangulares.',
      facesCount: 5,
      verticesCount: 6,
      edgesCount: 9,
      faceShapes: '2 triângulos e 3 retângulos',
      netDescription: 'Faixa central de 3 retângulos com 2 triângulos nas extremidades das bases.',
      eulerFormula: '6 vértices - 9 arestas + 5 faces = 2'
    },
    square_pyramid: {
      name: 'Pirâmide de Base Quadrada',
      description: 'Poliedro composto por 1 base quadrada plana e 4 faces triangulares que convergem no ápice.',
      facesCount: 5,
      verticesCount: 5,
      edgesCount: 8,
      faceShapes: '1 quadrado (base) e 4 triângulos isósceles',
      netDescription: '1 quadrado central com 4 abas triangulares que se dobram para cima.',
      eulerFormula: '5 vértices - 8 arestas + 5 faces = 2'
    },
    cylinder: {
      name: 'Cilindro Circular Reto',
      description: 'Sólido de revolução formado por 2 bases circulares planas paralelas e 1 superfície lateral curva.',
      facesCount: 3, // 2 bases + 1 face lateral
      verticesCount: 0,
      edgesCount: 2, // 2 arestas curvas circulares
      faceShapes: '2 círculos congruentes e 1 retângulo planificado',
      netDescription: '1 retângulo de comprimento 2·π·R e 2 círculos de raio R tangentes aos lados.',
      eulerFormula: 'Corpo redondo de revolução'
    }
  };

  const currentSolidInfo = solidsData[activeSolid];

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            MODO DE EXPLORAÇÃO LIVRE (SEM NOTA)
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Laboratório 3D de Geometria Espacial
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Gire os sólidos, abra as planificações em 2D e compare faces, arestas e vértices livremente.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Arraste com o dedo ou mouse para girar no espaço 3D.</span>
        </div>
      </div>

      {/* Solid Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: 'cube', label: 'Cubo', icon: <Box className="w-5 h-5" /> },
          { id: 'cuboid', label: 'Paralelepípedo', icon: <Layers className="w-5 h-5" /> },
          { id: 'triangular_prism', label: 'Prisma Triangular', icon: <Triangle className="w-5 h-5" /> },
          { id: 'square_pyramid', label: 'Pirâmide Quadrada', icon: <Triangle className="w-5 h-5 rotate-180" /> },
          { id: 'cylinder', label: 'Cilindro', icon: <Cylinder className="w-5 h-5" /> }
        ].map(item => {
          const isActive = activeSolid === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSolid(item.id as SolidType);
                setUnfoldProgress(0);
              }}
              className={`p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {item.icon}
              </div>
              <span className="text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Exploration Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive 3D Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <GeoCanvas
            solidType={activeSolid}
            height={440}
            interactive={true}
            allowUnfold={true}
            unfoldProgress={unfoldProgress}
            onUnfoldChange={setUnfoldProgress}
            showFaceColors={showFaceColors}
          />

          {/* Interactive Unfolding Slider */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <span>Dobradura:</span>
              <span className="text-blue-600 font-black">{Math.round((1 - unfoldProgress) * 100)}% Fechado</span>
            </div>

            <div className="flex-1 w-full flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">Sólido 3D</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={unfoldProgress}
                onChange={(e) => setUnfoldProgress(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                aria-label="Controle deslizante de abertura da planificação"
              />
              <span className="text-xs text-slate-500 font-semibold">Plano 2D</span>
            </div>

            <button
              onClick={() => setUnfoldProgress(unfoldProgress < 0.5 ? 1 : 0)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              {unfoldProgress < 0.5 ? 'Abrir Tudo' : 'Fechar Tudo'}
            </button>
          </div>
        </div>

        {/* Right: Solid Architectural Properties */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Propriedades Geométricas
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {currentSolidInfo.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentSolidInfo.description}
              </p>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xl font-black text-blue-700">{currentSolidInfo.facesCount}</span>
                <p className="text-[10px] font-bold text-blue-900 uppercase">Faces</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xl font-black text-emerald-700">{currentSolidInfo.edgesCount}</span>
                <p className="text-[10px] font-bold text-emerald-900 uppercase">Arestas</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xl font-black text-purple-700">{currentSolidInfo.verticesCount}</span>
                <p className="text-[10px] font-bold text-purple-900 uppercase">Vértices</p>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="font-bold text-slate-700">Formato das Faces:</span>
                <p className="text-slate-600 mt-0.5">{currentSolidInfo.faceShapes}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Composição da Planificação:</span>
                <p className="text-slate-600 mt-0.5">{currentSolidInfo.netDescription}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 text-[11px]">Relação Espacial:</span>
                <p className="text-slate-600 text-[11px] font-mono mt-0.5">{currentSolidInfo.eulerFormula}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
