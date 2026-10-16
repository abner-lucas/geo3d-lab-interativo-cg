'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SolidType } from '@/types/geo3d';
import { 
  createSolidSculptModel, 
  createHouseCompositeSculptModel,
  createGeo3DLookDevLights, 
  configureGeo3DRenderer, 
  createGeo3DEnvironment,
  SculptPartMetadata,
  ProceduralModelRuntime
} from '@/lib/img2threejs/proceduralModels';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Palette,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';

export interface GeoCanvasProps {
  solidType?: SolidType;
  compositeModel?: { basePiece: string; roofPiece: string };
  interactive?: boolean;
  allowUnfold?: boolean;
  unfoldProgress?: number; // 0 = 3D solid, 1 = 2D flat net
  onUnfoldChange?: (progress: number) => void;
  allowExplode?: boolean;
  explodeProgress?: number;
  onExplodeChange?: (progress: number) => void;
  highlightFaceIndex?: number;
  highlightPartId?: string | null;
  showFaceColors?: boolean;
  height?: string | number;
  className?: string;
  autoRotateInit?: boolean;
  onHoverPart?: (part: SculptPartMetadata | null) => void;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function GeoCanvas({
  solidType = 'cube',
  compositeModel,
  interactive = true,
  allowUnfold = true,
  unfoldProgress: externalUnfoldProgress,
  onUnfoldChange,
  allowExplode = true,
  explodeProgress: externalExplodeProgress,
  onExplodeChange,
  highlightPartId = null,
  showFaceColors = true,
  height = 360,
  className = '',
  autoRotateInit = false,
  onHoverPart,
}: GeoCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported] = useState<boolean>(() => checkWebGLSupport());

  // Folding state
  const [internalUnfold, setInternalUnfold] = useState<number>(0);
  const [isAnimatingUnfold, setIsAnimatingUnfold] = useState<boolean>(false);
  const [unfoldDirection, setUnfoldDirection] = useState<'open' | 'close'>('open');

  // Explode state
  const [internalExplode, setInternalExplode] = useState<number>(0);
  const [isAnimatingExplode, setIsAnimatingExplode] = useState<boolean>(false);

  // Appearance state
  const [useFaceColors, setUseFaceColors] = useState<boolean>(showFaceColors);
  const [autoRotate, setAutoRotate] = useState<boolean>(autoRotateInit);
  const [hoveredPart, setHoveredPart] = useState<SculptPartMetadata | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dragging & rotation
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationEulerRef = useRef<THREE.Euler>(new THREE.Euler(0.38, 0.58, 0));
  const autoRotateRef = useRef<boolean>(autoRotateInit);

  // Raycaster
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseVecRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const currentUnfold = externalUnfoldProgress !== undefined ? externalUnfoldProgress : internalUnfold;
  const currentUnfoldRef = useRef<number>(currentUnfold);
  const onUnfoldChangeRef = useRef(onUnfoldChange);

  const currentExplode = externalExplodeProgress !== undefined ? externalExplodeProgress : internalExplode;
  const currentExplodeRef = useRef<number>(currentExplode);
  const onExplodeChangeRef = useRef(onExplodeChange);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    currentUnfoldRef.current = currentUnfold;
    onUnfoldChangeRef.current = onUnfoldChange;
    currentExplodeRef.current = currentExplode;
    onExplodeChangeRef.current = onExplodeChange;
  }, [autoRotate, currentUnfold, onUnfoldChange, currentExplode, onExplodeChange]);

  // Build the active model using img2threejs procedural generators
  const buildCurrentModel = (group: THREE.Group, unfoldT: number, explodeT: number, colorful: boolean, activeHighlight: string | null) => {
    // Clear previous model children safely
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((node: any) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m: any) => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    }

    let proceduralModel: THREE.Group;
    if (compositeModel) {
      proceduralModel = createHouseCompositeSculptModel(
        compositeModel.basePiece,
        compositeModel.roofPiece,
        {
          colorfulFaces: colorful,
          explodeProgress: explodeT,
          highlightPartId: activeHighlight,
        }
      );
    } else {
      proceduralModel = createSolidSculptModel(solidType, {
        unfoldProgress: unfoldT,
        explodeProgress: explodeT,
        colorfulFaces: colorful,
        highlightPartId: activeHighlight,
        showVertices: true,
      });
    }

    group.add(proceduralModel);
  };

  // Main Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const width = container.clientWidth || 360;
    const canvasHeight = typeof height === 'number' ? height : (parseInt(height, 10) || 360);

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Slate-50 clean canvas
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / canvasHeight, 0.1, 100);
    camera.position.set(0, 3.2, 7.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic Tone Mapping (img2threejs)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    configureGeo3DRenderer(renderer);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Look-Dev Lighting & Environment Map
    const lights = createGeo3DLookDevLights('studio');
    scene.add(lights);

    const envMap = createGeo3DEnvironment(renderer);
    if (envMap) {
      scene.environment = envMap;
    }

    // 5. Procedural Model Root Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    buildCurrentModel(modelGroup, currentUnfoldRef.current, currentExplodeRef.current, useFaceColors, highlightPartId);

    // 6. Animation Render Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const isReducedMotion = typeof document !== 'undefined' && document.body.classList.contains('reduced-motion');
      if (autoRotateRef.current && !isReducedMotion && modelGroup) {
        rotationEulerRef.current.y += 0.007;
      }

      if (modelGroup) {
        modelGroup.rotation.copy(rotationEulerRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      camera.aspect = newW / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, canvasHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height, solidType, compositeModel, webglSupported]);

  // Re-build model when parameters update
  useEffect(() => {
    if (modelGroupRef.current) {
      buildCurrentModel(modelGroupRef.current, currentUnfold, currentExplode, useFaceColors, highlightPartId);
    }
  }, [solidType, compositeModel, currentUnfold, currentExplode, useFaceColors, highlightPartId]);

  // Unfolding animation step loop
  useEffect(() => {
    if (!isAnimatingUnfold) return;

    let startTime: number | null = null;
    const duration = 1100;
    const startVal = currentUnfoldRef.current;
    const targetVal = unfoldDirection === 'open' ? 1 : 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-in-out
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const nextVal = startVal + (targetVal - startVal) * eased;
      setInternalUnfold(nextVal);
      if (onUnfoldChangeRef.current) onUnfoldChangeRef.current(nextVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimatingUnfold(false);
        setInternalUnfold(targetVal);
        if (onUnfoldChangeRef.current) onUnfoldChangeRef.current(targetVal);
      }
    };

    const handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [isAnimatingUnfold, unfoldDirection]);

  // Explode animation step loop
  useEffect(() => {
    if (!isAnimatingExplode) return;

    let startTime: number | null = null;
    const duration = 700;
    const startVal = currentExplodeRef.current;
    const targetVal = startVal < 0.5 ? 1 : 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const nextVal = startVal + (targetVal - startVal) * eased;
      setInternalExplode(nextVal);
      if (onExplodeChangeRef.current) onExplodeChangeRef.current(nextVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimatingExplode(false);
        setInternalExplode(targetVal);
        if (onExplodeChangeRef.current) onExplodeChangeRef.current(targetVal);
      }
    };

    const handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [isAnimatingExplode]);

  // Raycasting for interactive face inspection
  const handlePointerRaycast = (clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current || !modelGroupRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseVecRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVecRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);

    const hit = intersects.find(i => (i.object as THREE.Mesh).isMesh && i.object.userData?.sculptPart);
    if (hit) {
      const partMeta = hit.object.userData.sculptPart as SculptPartMetadata;
      setHoveredPart(partMeta);
      if (onHoverPart) onHoverPart(partMeta);
    } else {
      setHoveredPart(null);
      if (onHoverPart) onHoverPart(null);
    }
  };

  // Touch and Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    handlePointerRaycast(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      rotationEulerRef.current.y += deltaX * 0.01;
      rotationEulerRef.current.x += deltaY * 0.01;
      rotationEulerRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationEulerRef.current.x));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      handlePointerRaycast(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Directional button controls
  const rotateStep = (dx: number, dy: number) => {
    rotationEulerRef.current.x += dy * 0.25;
    rotationEulerRef.current.y += dx * 0.25;
    rotationEulerRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationEulerRef.current.x));
  };

  const zoomCamera = (delta: number) => {
    if (!cameraRef.current) return;
    const newZ = cameraRef.current.position.z + delta;
    if (newZ >= 4 && newZ <= 15) {
      cameraRef.current.position.z = newZ;
    }
  };

  const resetView = () => {
    rotationEulerRef.current = new THREE.Euler(0.38, 0.58, 0);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 3.2, 7.8);
    }
    setInternalUnfold(0);
    if (onUnfoldChange) onUnfoldChange(0);
    setInternalExplode(0);
    if (onExplodeChange) onExplodeChange(0);
  };

  const toggleFolding = () => {
    if (isAnimatingUnfold) return;
    const willOpen = currentUnfold < 0.5;
    const targetVal = willOpen ? 1 : 0;
    if (typeof document !== 'undefined' && document.body.classList.contains('reduced-motion')) {
      setInternalUnfold(targetVal);
      if (onUnfoldChange) onUnfoldChange(targetVal);
      return;
    }
    setUnfoldDirection(willOpen ? 'open' : 'close');
    setIsAnimatingUnfold(true);
  };

  const toggleExploding = () => {
    if (isAnimatingExplode) return;
    setIsAnimatingExplode(true);
  };

  if (!webglSupported) {
    return (
      <div 
        className="w-full bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-700"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
          <Eye className="w-8 h-8" />
        </div>
        <p className="font-semibold text-base mb-1">Visualização 2D Alternativa (Sem WebGL)</p>
        <p className="text-xs text-slate-500 max-w-sm">
          Seu navegador não possui aceleração WebGL ativa. O conteúdo pode ser visualizado nas ilustrações estáticas.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 overflow-hidden shadow-xs select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="region"
        aria-label={`Visualizador 3D interativo do modelo procedural ${solidType}`}
      />

      {/* Floating Status Badge & Interactive Inspection Tooltip */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
        {interactive && (allowUnfold || allowExplode) && (currentUnfold > 0.05 || currentExplode > 0.05) && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-700 backdrop-blur-xs border border-slate-200/80 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${currentUnfold > 0.5 ? 'bg-amber-500' : 'bg-blue-600'}`} />
              {currentUnfold > 0.5 ? 'Planificação Aberta' : 'Faces Separadas'}
            </span>
          </div>
        )}

        {/* Hovered Face Metadata Pill */}
        {interactive && hoveredPart && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white backdrop-blur-xs border border-slate-800 shadow-md text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span><strong>{hoveredPart.name}</strong> • {hoveredPart.shapeLabel}</span>
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      {interactive && (
        <>
          {/* Directional Pad (Top-Right) */}
          <div className="absolute top-3 right-3 flex flex-col items-center bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs gap-1 z-10">
            <button
              onClick={() => rotateStep(0, -1)}
              className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
              title="Girar para Cima"
              aria-label="Girar 3D para Cima"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => rotateStep(-1, 0)}
                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
                title="Girar para Esquerda"
                aria-label="Girar 3D para Esquerda"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={resetView}
                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-600 transition"
                title="Restaurar Posição Inicial"
                aria-label="Restaurar Posição Inicial"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => rotateStep(1, 0)}
                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
                title="Girar para Direita"
                aria-label="Girar 3D para Direita"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => rotateStep(0, 1)}
              className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
              title="Girar para Baixo"
              aria-label="Girar 3D para Baixo"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Bottom Control Toolbar */}
          <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
            {/* Left Tools (Zoom & Options) */}
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs pointer-events-auto">
              <button
                onClick={() => zoomCamera(-1.2)}
                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
                title="Aproximar (+)"
                aria-label="Aproximar visualização"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => zoomCamera(1.2)}
                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-700 transition"
                title="Afastar (-)"
                aria-label="Afastar visualização"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              {showFaceColors && (
                <button
                  onClick={() => setUseFaceColors(!useFaceColors)}
                  className={`p-2 rounded-lg transition ${useFaceColors ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
                  title="Destacar cores das faces"
                  aria-label="Destacar cores das faces"
                >
                  <Palette className="w-5 h-5" />
                </button>
              )}
              {allowExplode && currentUnfold < 0.2 && (
                <button
                  onClick={toggleExploding}
                  disabled={isAnimatingExplode}
                  className={`p-2 rounded-lg transition ${currentExplode > 0.3 ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-100 text-slate-600'}`}
                  title={currentExplode > 0.3 ? 'Unir faces do sólido' : 'Separar faces no espaço 3D (Vista explodida)'}
                  aria-label="Separar faces em 3D"
                >
                  <Layers className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-lg transition ${autoRotate ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Giro automático"
                aria-label="Giro automático"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Right Action: Open / Close Fold Animation */}
            {allowUnfold && (
              <div className="pointer-events-auto">
                <button
                  onClick={toggleFolding}
                  disabled={isAnimatingUnfold}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50 ${
                    currentUnfold < 0.5 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  aria-label={currentUnfold < 0.5 ? 'Abrir e desdobrar sólido em planificação' : 'Fechar e dobrar planificação em sólido'}
                >
                  {currentUnfold < 0.5 ? (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span>ABRIR PLANIFICAÇÃO</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span>FECHAR SÓLIDO 3D</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
