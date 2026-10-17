'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { SPRING_TOUCH, SPRING_POP, SPRING_CARD } from '@/lib/motionUtils';
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
  Shapes,
  Play,
  Pause,
  RotateCcw,
  Scan,
  Activity
} from 'lucide-react';

export function ExplorationLab() {
  const [activeSolid, setActiveSolid] = useState<SolidType>('cube');
  const [activeTab, setActiveTab] = useState<'SHAPE' | 'DAILY_LIFE' | 'CG_3D'>('SHAPE');

  // GSAP Exploded View & X-Ray Mode State
  const [isExplodeMode, setIsExplodeMode] = useState<boolean>(false);
  const [explodeProgress, setExplodeProgress] = useState<number>(0);
  const [neonEdges, setNeonEdges] = useState<boolean>(true);
  const [glowingVertices, setGlowingVertices] = useState<boolean>(true);
  const [xrayMode, setXrayMode] = useState<boolean>(true);
  const [showGuidingRays, setShowGuidingRays] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressProxyRef = useRef<{ val: number }>({ val: 0 });

  useEffect(() => {
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        setExplodeProgress(progressProxyRef.current.val);
      },
      onComplete: () => setIsPlaying(false),
      onReverseComplete: () => setIsPlaying(false),
    });

    tl.to(progressProxyRef.current, {
      val: 1,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  const toggleExplodeMode = () => {
    if (!isExplodeMode) {
      setIsExplodeMode(true);
      if (explodeProgress < 0.2) {
        goToStage(1);
      }
    } else {
      goToStage(0, () => {
        setIsExplodeMode(false);
      });
    }
  };

  const togglePlay = () => {
    if (!timelineRef.current) return;
    if (isPlaying) {
      timelineRef.current.pause();
      setIsPlaying(false);
    } else {
      if (progressProxyRef.current.val >= 0.99) {
        progressProxyRef.current.val = 0;
        timelineRef.current.restart();
      } else {
        timelineRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  const reverseTimeline = () => {
    if (!timelineRef.current) return;
    timelineRef.current.reverse();
    setIsPlaying(true);
  };

  const handleScrub = (val: number) => {
    if (!timelineRef.current) return;
    timelineRef.current.pause();
    setIsPlaying(false);
    progressProxyRef.current.val = val;
    timelineRef.current.progress(val);
    setExplodeProgress(val);
  };

  const goToStage = (target: number, onComplete?: () => void) => {
    if (!timelineRef.current) return;
    timelineRef.current.pause();
    setIsPlaying(true);
    gsap.to(progressProxyRef.current, {
      val: target,
      duration: 0.85,
      ease: 'power3.out',
      onUpdate: () => {
        setExplodeProgress(progressProxyRef.current.val);
        timelineRef.current?.progress(progressProxyRef.current.val);
      },
      onComplete: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
    });
  };

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
            <motion.button
              key={item.id}
              onClick={() => setActiveSolid(item.id as SolidType)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition cursor-pointer select-none ${
                isActive
                  ? 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSolidPill"
                  className="absolute inset-0 rounded-xl bg-blue-100/50 -z-10"
                  transition={SPRING_TOUCH}
                />
              )}
              <div className={`p-2 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {item.icon}
              </div>
              <span className="text-center leading-tight">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Exploration Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive 3D Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Top Bar: Exploded View & X-Ray Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl transition-colors ${isExplodeMode ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200' : 'bg-slate-100 text-slate-600'}`}>
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">Visão Explodida & Raio-X</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                    GSAP Coreografado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Disseca as faces e destaca vértices luminosos e arestas neon no espaço 3D.
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={toggleExplodeMode}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 select-none ${
                isExplodeMode
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isExplodeMode ? 'Fechar Dissecação' : 'Ativar Modo Raio-X'}</span>
            </motion.button>
          </div>

          <GeoCanvas
            solidType={activeSolid}
            height={440}
            interactive={true}
            allowUnfold={!isExplodeMode}
            allowExplode={!isExplodeMode}
            explodeProgress={explodeProgress}
            xrayMode={xrayMode}
            neonEdges={neonEdges}
            glowingVertices={glowingVertices}
            showGuidingRays={showGuidingRays}
            showFaceColors={true}
          />

          {/* GSAP Timeline Scrubbing & FX Deck */}
          <AnimatePresence>
            {isExplodeMode && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={SPRING_CARD}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-700 shadow-xl flex flex-col gap-4"
              >
                {/* Deck Header: Title & Stage Presets */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <div>
                      <span className="text-xs font-black tracking-wide text-cyan-300 uppercase">
                        Linha do Tempo GSAP: Dissecação em 60 FPS
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {explodeProgress === 0
                          ? 'Sólido Fechado (0%)'
                          : explodeProgress >= 0.95
                          ? 'Explosão e Raio-X Total (100%)'
                          : `Dissecação em Andamento (${Math.round(explodeProgress * 100)}%)`}
                      </div>
                    </div>
                  </div>

                  {/* Stage Quick Presets */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => goToStage(0)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                        explodeProgress < 0.1 ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      0% Fechado
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStage(0.5)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                        explodeProgress >= 0.4 && explodeProgress <= 0.6 ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      50% Dissecado
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStage(1.0)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                        explodeProgress > 0.9 ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      100% Raio-X
                    </button>
                  </div>
                </div>

                {/* Transport Scrub Bar */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pausar Animação' : 'Tocar Animação'}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition cursor-pointer shadow-md shadow-cyan-500/30 flex items-center justify-center shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={reverseTimeline}
                    aria-label="Rebobinar Dissecação"
                    title="Rebobinar Dissecação"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Live Range Scrubber */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>Início</span>
                      <span className="text-cyan-400 font-mono font-black">{Math.round(explodeProgress * 100)}%</span>
                      <span>Afastamento Máximo</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={explodeProgress}
                      onChange={(e) => handleScrub(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Visual FX Toggles */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
                    Efeitos Visuais:
                  </span>

                  <button
                    type="button"
                    onClick={() => setNeonEdges(!neonEdges)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      neonEdges
                        ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-2xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f5ff]" />
                    <span>Arestas Neon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGlowingVertices(!glowingVertices)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      glowingVertices
                        ? 'bg-purple-950/70 border-purple-500/60 text-purple-300 shadow-2xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                    <span>Vértices Roxos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setXrayMode(!xrayMode)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      xrayMode
                        ? 'bg-blue-950/70 border-blue-500/60 text-blue-300 shadow-2xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Faces Raio-X</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuidingRays(!showGuidingRays)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      showGuidingRays
                        ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-2xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Raios Guias</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

            {/* Metric Badges with GSAP Explode Reactive Glow */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className={`p-2.5 rounded-xl text-center overflow-hidden transition-all duration-300 ${
                isExplodeMode && explodeProgress > 0.05
                  ? 'bg-blue-50/90 border-2 border-blue-400 ring-2 ring-blue-300 shadow-xs'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSolidInfo.name + '-faces'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="block text-xl font-black text-blue-700"
                  >
                    {currentSolidInfo.facesCount}
                  </motion.span>
                </AnimatePresence>
                <p className="text-[10px] font-bold text-blue-900 uppercase">Faces (Lados)</p>
                {isExplodeMode && explodeProgress > 0.05 && (
                  <span className="block text-[9px] font-bold text-blue-600 mt-0.5">Separadas</span>
                )}
              </div>

              <div className={`p-2.5 rounded-xl text-center overflow-hidden transition-all duration-300 ${
                isExplodeMode && explodeProgress > 0.05 && neonEdges
                  ? 'bg-emerald-50/90 border-2 border-emerald-400 ring-2 ring-emerald-300 shadow-xs'
                  : 'bg-emerald-50 border border-emerald-200'
              }`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSolidInfo.name + '-edges'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="block text-xl font-black text-emerald-700"
                  >
                    {currentSolidInfo.edgesCount}
                  </motion.span>
                </AnimatePresence>
                <p className="text-[10px] font-bold text-emerald-900 uppercase">Arestas (Linhas)</p>
                {isExplodeMode && explodeProgress > 0.05 && neonEdges && (
                  <span className="block text-[9px] font-bold text-emerald-600 mt-0.5">Neon</span>
                )}
              </div>

              <div className={`p-2.5 rounded-xl text-center overflow-hidden transition-all duration-300 ${
                isExplodeMode && explodeProgress > 0.05 && glowingVertices
                  ? 'bg-purple-50/90 border-2 border-purple-400 ring-2 ring-purple-300 shadow-xs'
                  : 'bg-purple-50 border border-purple-200'
              }`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSolidInfo.name + '-vertices'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="block text-xl font-black text-purple-700"
                  >
                    {currentSolidInfo.verticesCount}
                  </motion.span>
                </AnimatePresence>
                <p className="text-[10px] font-bold text-purple-900 uppercase">Vértices (Pontas)</p>
                {isExplodeMode && explodeProgress > 0.05 && glowingVertices && (
                  <span className="block text-[9px] font-bold text-purple-600 mt-0.5">Luzes Roxas</span>
                )}
              </div>
            </div>

            {/* Exploded View Pedagogical Callout */}
            <AnimatePresence>
              {isExplodeMode && explodeProgress > 0.05 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={SPRING_CARD}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 text-xs text-cyan-950 flex flex-col gap-1.5 overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Como a Visão Explodida Funciona?</span>
                  </div>
                  <p className="text-[11px] text-cyan-900/80 leading-relaxed">
                    Cada face se afasta do centro do sólido ao longo de sua direção normal.
                    As linhas tracejadas mostram o caminho de volta ao centro e as bolinhas roxas
                    destacam exatamente onde as arestas se cruzam para formar as pontas (vértices).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Explanation Mini-Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold relative">
              <button
                type="button"
                onClick={() => setActiveTab('SHAPE')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'SHAPE' ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shapes className="w-3 h-3" />
                <span>Forma</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DAILY_LIFE')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'DAILY_LIFE' ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3 h-3" />
                <span>No Dia a Dia</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CG_3D')}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'CG_3D' ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span>Nos Jogos 3D</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3 min-h-[90px]">
              <AnimatePresence mode="wait">
                {activeTab === 'SHAPE' && (
                  <motion.div
                    key="SHAPE"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span className="font-bold text-slate-800">Como é a forma deste sólido:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.shapeDetails}</p>
                  </motion.div>
                )}

                {activeTab === 'DAILY_LIFE' && (
                  <motion.div
                    key="DAILY_LIFE"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span className="font-bold text-slate-800">Onde encontramos no dia a dia:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.dailyLife}</p>
                  </motion.div>
                )}

                {activeTab === 'CG_3D' && (
                  <motion.div
                    key="CG_3D"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span className="font-bold text-slate-800">Como é usado em jogos e filmes 3D:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{currentSolidInfo.cgUsage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
