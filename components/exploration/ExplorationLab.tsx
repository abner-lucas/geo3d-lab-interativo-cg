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
  Cpu
} from 'lucide-react';

export function ExplorationLab() {
  const [activeSolid, setActiveSolid] = useState<SolidType>('cube');
  const [activeTab, setActiveTab] = useState<'CONCEPTS' | 'TOPOLOGY' | 'CG_APPLICATIONS'>('CONCEPTS');

  const solidsData: Record<SolidType, {
    name: string;
    category: string;
    description: string;
    facesCount: number;
    verticesCount: number;
    edgesCount: number;
    spatialConcept: string;
    cgApplication: string;
    eulerFormula: string;
  }> = {
    cube: {
      name: 'Hexaedro Regular',
      category: 'Poliedro Platônico Simétrico',
      description: 'Sólido tridimensional perfeitamente simétrico nos três eixos espaciais (Largura X, Altura Y e Profundidade Z), com todas as arestas de mesma medida.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      spatialConcept: 'Possui simetria isométrica nas três dimensões ortogonais, encontrando-se sempre em ângulos retos de 90°.',
      cgApplication: 'Na Computação Gráfica, é a primitiva fundamental (Voxel / Bounding Box) usada para calcular colisões rápidas e construir mundos em blocos.',
      eulerFormula: '8 vértices - 12 arestas + 6 faces = 2'
    },
    cuboid: {
      name: 'Bloco Prisma Retangular',
      category: 'Poliedro Prismático Ortogonal',
      description: 'Sólido tridimensional cujas dimensões de largura (X), altura (Y) e profundidade (Z) possuem medidas independentes entre si.',
      facesCount: 6,
      verticesCount: 8,
      edgesCount: 12,
      spatialConcept: 'Organiza o volume através de planos paralelos dois a dois, permitindo alongamento direcional em qualquer eixo.',
      cgApplication: 'Muito empregado na modelagem arquitetônica 3D (edifícios, vigas, mobiliário) e caixas delimitadoras orientadas (OBB).',
      eulerFormula: '8 vértices - 12 arestas + 6 faces = 2'
    },
    triangular_prism: {
      name: 'Prisma de Seção Triangular',
      category: 'Poliedro Prismático Não-Retangular',
      description: 'Sólido formado pela projeção espacial reta (extrusão) de um polígono de três lados ao longo de um eixo de profundidade.',
      facesCount: 5,
      verticesCount: 6,
      edgesCount: 9,
      spatialConcept: 'Combina planos inclinados convergentes com bases paralelas, desviando feixes de luz em ângulos agudos.',
      cgApplication: 'Utilizado em motores gráficos para rampas, estruturas de cobertura, refração óptica simulada e malhas low-poly.',
      eulerFormula: '6 vértices - 9 arestas + 5 faces = 2'
    },
    square_pyramid: {
      name: 'Poliedro Piramidal',
      category: 'Sólido de Convergência em Ápice',
      description: 'Poliedro cujas arestas laterais partem de uma base poligonal plana e convergem para um único vértice superior central (ápice).',
      facesCount: 5,
      verticesCount: 5,
      edgesCount: 8,
      spatialConcept: 'Apresenta redução progressiva de sua seção transversal conforme a altura (eixo Y) se aproxima do topo.',
      cgApplication: 'Representa o "Frustum" da câmera virtual 3D (cone de visão que define o que aparece na tela do computador).',
      eulerFormula: '5 vértices - 8 arestas + 5 faces = 2'
    },
    cylinder: {
      name: 'Sólido Cilíndrico de Revolução',
      category: 'Corpo Redondo Curvilíneo',
      description: 'Sólido gerado pela rotação completa (360°) de um segmento reto em torno de um eixo central de simetria vertical.',
      facesCount: 3,
      verticesCount: 0,
      edgesCount: 2,
      spatialConcept: 'Combina superfícies planas paralelas nas extremidades com uma superfície contínua curva sem quinas laterais.',
      cgApplication: 'Nas malhas 3D (Three.js/WebGL), superfícies curvas são aproximadas por dezenas de subdivisões poligonais suavizadas por normais (Phong/Gouraud shading).',
      eulerFormula: 'Corpo redondo de revolução (sem vértices)'
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
            Plataforma de explanação interativa: gire os modelos em 360°, inspecione a topologia espacial e estude suas aplicações na Computação Gráfica.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Arraste na tela 3D para inspecionar luz, sombra, vértices e arestas.</span>
        </div>
      </div>

      {/* Solid Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: 'cube', label: 'Hexaedro Regular', icon: <Box className="w-5 h-5" /> },
          { id: 'cuboid', label: 'Prisma Retangular', icon: <Layers className="w-5 h-5" /> },
          { id: 'triangular_prism', label: 'Prisma Triangular', icon: <Triangle className="w-5 h-5" /> },
          { id: 'square_pyramid', label: 'Poliedro Piramidal', icon: <Triangle className="w-5 h-5 rotate-180" /> },
          { id: 'cylinder', label: 'Sólido de Revolução', icon: <Cylinder className="w-5 h-5" /> }
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
        {/* Left: Interactive 3D Canvas (Somente inspeção espacial, sem revelar gabaritos de planificação ou cores da avaliação) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <GeoCanvas
            solidType={activeSolid}
            height={440}
            interactive={true}
            allowUnfold={false}
            showFaceColors={false}
          />

          {/* Spatial Axes Explanation Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Eixos do Espaço 3D:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                Eixo X: Largura Horizontal
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                Eixo Y: Altura Vertical
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                Eixo Z: Profundidade Espacial
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
                <p className="text-[10px] font-bold text-blue-900 uppercase">Superfícies</p>
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

            {/* Explanation Mini-Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('CONCEPTS')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'CONCEPTS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Geometria
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TOPOLOGY')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'TOPOLOGY' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Euler (V-A+F)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CG_APPLICATIONS')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'CG_APPLICATIONS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Uso em 3D
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              {activeTab === 'CONCEPTS' && (
                <div>
                  <span className="font-bold text-slate-800">Estrutura no Espaço 3D:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.spatialConcept}</p>
                </div>
              )}

              {activeTab === 'TOPOLOGY' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] block mb-1">
                    Teorema Topológico de Euler (V - A + F = 2):
                  </span>
                  <p className="text-blue-700 text-xs font-mono font-bold">
                    {currentSolidInfo.eulerFormula}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Em todo poliedro convexo fechado, o número de Vértices menos Arestas mais Faces é constante e igual a 2.
                  </p>
                </div>
              )}

              {activeTab === 'CG_APPLICATIONS' && (
                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    Aplicação em Computação Gráfica:
                  </span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.cgApplication}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
