'use client';

import React, { useState } from 'react';
import { SolidType } from '@/types/geo3d';
import { GeoCanvas } from '@/components/three/GeoCanvas';
import { 
  Box, 
  Layers, 
  Triangle, 
  Cylinder, 
  Info, 
  Sparkles, 
  Compass,
  Gamepad2,
  Home,
  Shapes
} from 'lucide-react';

export function ExplorationLab() {
  const [activeSolid, setActiveSolid] = useState<SolidType>('cube');
  const [activeTab, setActiveTab] = useState<'SHAPE' | 'DAILY_LIFE' | 'CG_3D'>('SHAPE');

  const solidsData: Record<SolidType, {
    name: string;
    category: string;
    description: string;
    facesCount: number;
    verticesCount: number;
    edgesCount: number;
    shapeDetails: string;
    dailyLife: string;
    cgUsage: string;
  }> = {
    cube: {
      name: 'Cubo',
      category: '6 Faces Quadradas Iguais',
      description: 'Sólido perfeitamente equilibrado em largura, altura e profundidade, com todos os lados de mesmo tamanho e cantos retos.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      shapeDetails: 'Possui 6 faces quadradas idênticas, 12 arestas (linhas) e 8 vértices (cantos). Todas as quinas formam ângulos retos de 90°.',
      dailyLife: 'É o formato clássico de um dado de jogo de tabuleiro, de uma caixa de presente quadrada e do Cubo Mágico.',
      cgUsage: 'Em jogos como Minecraft e mundos virtuais em 3D, o cubo é o bloco principal para construir cenários e calcular colisões de personagens.'
    },
    cuboid: {
      name: 'Paralelepípedo',
      category: 'Bloco de Faces Retangulares',
      description: 'Sólido com formato de bloco reto alongado, onde lados opostos são exatamente iguais e paralelos entre si.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      shapeDetails: 'Possui 6 faces retangulares, 12 arestas e 8 vértices. Suas medidas de largura, altura e comprimento podem ser diferentes.',
      dailyLife: 'É o formato de uma caixa de sapatos, de um tijolo de construção, de uma esponja de pia ou de um livro fechado.',
      cgUsage: 'Na modelagem 3D, é a base para criar prédios, paredes de casas, mesas, portas, carros e aparelhos eletrônicos.'
    },
    triangular_prism: {
      name: 'Prisma Triangular',
      category: 'Bases Triangulares e Lados Retangulares',
      description: 'Sólido que possui tampa e fundo em formato de triângulo, ligados por três paredes retangulares.',
      facesCount: 5,
      verticesCount: 6,
      edgesCount: 9,
      shapeDetails: 'Tem 5 faces no total (2 triângulos nas pontas e 3 retângulos nas laterais), 9 arestas e 6 vértices.',
      dailyLife: 'Lembra o formato de uma barra de chocolate triangular (Toblerone), de uma barraca de camping ou do telhado de duas águas de uma casa.',
      cgUsage: 'Muito utilizado em jogos para criar rampas de corrida ou skate, telhados de vilarejos e montanhas estilizadas.'
    },
    square_pyramid: {
      name: 'Pirâmide Quadrada',
      category: 'Base Quadrada com 4 Lados Triangulares',
      description: 'Sólido que tem um quadrado no chão e quatro lados triangulares que sobem até se unirem em uma única ponta no topo.',
      facesCount: 5,
      verticesCount: 5,
      edgesCount: 8,
      shapeDetails: 'Possui 5 faces (1 base quadrada e 4 faces triangulares), 8 arestas e 5 vértices (4 na base e 1 na ponta de cima).',
      dailyLife: 'É o formato imponente das Pirâmides do Egito, de alguns tipos de barracas e de decorações de mesa.',
      cgUsage: 'Em computação gráfica, é usada para criar torres de castelos, monumentos históricos, copas pontiagudas de pinheiros e cones de luz.'
    },
    cylinder: {
      name: 'Cilindro',
      category: 'Corpo Redondo com Duas Bases Circulares',
      description: 'Sólido circular reto com tampa e fundo redondos perfeitamente planos e uma lateral curva contínua, sem cantos.',
      facesCount: 3,
      verticesCount: 0,
      edgesCount: 2,
      shapeDetails: 'Possui 3 superfícies (2 círculos planos e 1 superfície lateral curva contínua) e 2 bordas redondas, sem vértices (pontas).',
      dailyLife: 'É o formato de uma lata de refrigerante, de um cano de água, de um copo reto, de uma pilha ou de um rolo de papel.',
      cgUsage: 'Em mundos 3D, é utilizado para modelar rodas, canos, postes de iluminação, colunas de palácios e troncos de árvores.'
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
            Gire os modelos 3D, observe suas faces, linhas e cantos, e descubra onde cada forma aparece no nosso dia a dia e nos jogos.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Arraste na tela 3D para olhar o objeto de qualquer ângulo.</span>
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
              onClick={() => setActiveSolid(item.id as SolidType)}
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
            allowExplode={true}
            showFaceColors={true}
          />

          {/* Spatial Axes Explanation Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Dimensões no Espaço 3D:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                Eixo X: Largura (Direita / Esquerda)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                Eixo Y: Altura (Cima / Baixo)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                Eixo Z: Profundidade (Frente / Fundo)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Explanation Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {currentSolidInfo.category}
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
                <p className="text-[10px] font-bold text-blue-900 uppercase">Faces (Lados)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xl font-black text-emerald-700">{currentSolidInfo.edgesCount}</span>
                <p className="text-[10px] font-bold text-emerald-900 uppercase">Arestas (Linhas)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xl font-black text-purple-700">{currentSolidInfo.verticesCount}</span>
                <p className="text-[10px] font-bold text-purple-900 uppercase">Vértices (Pontas)</p>
              </div>
            </div>

            {/* Explanation Mini-Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('SHAPE')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'SHAPE' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shapes className="w-3 h-3" />
                <span>Forma</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DAILY_LIFE')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'DAILY_LIFE' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3 h-3" />
                <span>No Dia a Dia</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CG_3D')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'CG_3D' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Nos Jogos 3D</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              {activeTab === 'SHAPE' && (
                <div>
                  <span className="font-bold text-slate-800">Como é a forma deste sólido:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.shapeDetails}</p>
                </div>
              )}

              {activeTab === 'DAILY_LIFE' && (
                <div>
                  <span className="font-bold text-slate-800">Onde encontramos no dia a dia:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.dailyLife}</p>
                </div>
              )}

              {activeTab === 'CG_3D' && (
                <div>
                  <span className="font-bold text-slate-800">Como é usado em jogos e filmes 3D:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.cgUsage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
