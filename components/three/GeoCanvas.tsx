'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SolidType } from '@/types/geo3d';
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
  Play,
  Pause
} from 'lucide-react';

interface GeoCanvasProps {
  solidType: SolidType;
  interactive?: boolean;
  allowUnfold?: boolean;
  unfoldProgress?: number; // 0 = 3D solid, 1 = 2D flat net
  onUnfoldChange?: (progress: number) => void;
  highlightFaceIndex?: number;
  showFaceColors?: boolean;
  height?: string | number;
  className?: string;
  autoRotateInit?: boolean;
  customMeshFactory?: (scene: THREE.Scene) => void;
}

// Face colors palette constant
const FACE_COLORS = [
  0x3b82f6, // Azul (Frente)
  0xef4444, // Vermelho (Trás)
  0xeab308, // Amarelo (Topo)
  0xa855f7, // Roxo (Base)
  0x10b981, // Verde (Esquerda)
  0xf97316  // Laranja (Direita)
];

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
  solidType,
  interactive = true,
  allowUnfold = true,
  unfoldProgress: externalUnfoldProgress,
  onUnfoldChange,
  showFaceColors = true,
  height = 360,
  className = '',
  autoRotateInit = false
}: GeoCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported] = useState<boolean>(() => checkWebGLSupport());
  const [internalUnfold, setInternalUnfold] = useState<number>(0);
  const [isAnimatingUnfold, setIsAnimatingUnfold] = useState<boolean>(false);
  const [unfoldDirection, setUnfoldDirection] = useState<'open' | 'close'>('open');
  const [useFaceColors, setUseFaceColors] = useState<boolean>(showFaceColors);
  const [autoRotate, setAutoRotate] = useState<boolean>(autoRotateInit);

  // References to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const solidGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Touch and mouse drag states
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationEulerRef = useRef<THREE.Euler>(new THREE.Euler(0.4, 0.6, 0));
  const autoRotateRef = useRef<boolean>(autoRotateInit);

  const currentUnfold = externalUnfoldProgress !== undefined ? externalUnfoldProgress : internalUnfold;
  const currentUnfoldRef = useRef<number>(currentUnfold);
  const onUnfoldChangeRef = useRef(onUnfoldChange);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    currentUnfoldRef.current = currentUnfold;
    onUnfoldChangeRef.current = onUnfoldChange;
  }, [autoRotate, currentUnfold, onUnfoldChange]);

  // Helper to construct geometry based on solid and unfold
  const buildSolidMesh = useCallback((group: THREE.Group, solid: SolidType, unfoldT: number, colorful: boolean) => {
    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }

    const t = Math.max(0, Math.min(1, unfoldT)); // Clamp 0 to 1
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const addEdgeWire = (mesh: THREE.Mesh, thresholdAngle?: number) => {
      const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
      mesh.add(new THREE.LineSegments(edgesGeom, wireMat));
      return mesh;
    };

    if (solid === 'cube') {
      // HINGED CUBE (Latin cross net: Center, Front, Back, Left, Right, Top)
      const S = 2.0;
      const H = S / 2;

      const createFaceMesh = (colorIndex: number) => {
        const geom = new THREE.PlaneGeometry(S, S);
        const col = colorful ? FACE_COLORS[colorIndex % FACE_COLORS.length] : 0x0284c7;
        const mat = new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
        return addEdgeWire(new THREE.Mesh(geom, mat));
      };

      // 1. BASE FACE (Center flat on XZ plane, y = -H when closed)
      const baseFace = createFaceMesh(3);
      baseFace.rotation.x = Math.PI / 2;
      baseFace.position.set(0, -H * (1 - t), 0);
      group.add(baseFace);

      // 2. FRONT FACE (hinges at z = +H)
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, -H * (1 - t), H);
      const frontFace = createFaceMesh(0);
      frontFace.position.set(0, 0, H);
      frontFace.rotation.x = Math.PI / 2;
      frontPivot.add(frontFace);
      frontPivot.rotation.x = (1 - t) * (-Math.PI / 2);
      group.add(frontPivot);

      // 3. BACK FACE (hinges at z = -H)
      const backPivot = new THREE.Group();
      backPivot.position.set(0, -H * (1 - t), -H);
      const backFace = createFaceMesh(1);
      backFace.position.set(0, 0, -H);
      backFace.rotation.x = Math.PI / 2;
      backPivot.add(backFace);
      backPivot.rotation.x = (1 - t) * (Math.PI / 2);
      group.add(backPivot);

      // 4. TOP FACE (hinged on the Back Face outer edge)
      const topPivot = new THREE.Group();
      topPivot.position.set(0, 0, -2 * H);
      const topFace = createFaceMesh(2);
      topFace.position.set(0, 0, -H);
      topFace.rotation.x = Math.PI / 2;
      topPivot.add(topFace);
      topPivot.rotation.x = (1 - t) * (Math.PI / 2);
      backPivot.add(topPivot);

      // 5. LEFT FACE (hinges at x = -H)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-H, -H * (1 - t), 0);
      const leftFace = createFaceMesh(4);
      leftFace.position.set(-H, 0, 0);
      leftFace.rotation.x = Math.PI / 2;
      leftPivot.add(leftFace);
      leftPivot.rotation.z = (1 - t) * (-Math.PI / 2);
      group.add(leftPivot);

      // 6. RIGHT FACE (hinges at x = +H)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(H, -H * (1 - t), 0);
      const rightFace = createFaceMesh(5);
      rightFace.position.set(H, 0, 0);
      rightFace.rotation.x = Math.PI / 2;
      rightPivot.add(rightFace);
      rightPivot.rotation.z = (1 - t) * (Math.PI / 2);
      group.add(rightPivot);

    } else if (solid === 'cuboid') {
      const W = 2.6;
      const H = 1.4;
      const D = 1.8;

      const makeRect = (w: number, d: number, colorIdx: number) => {
        const col = colorful ? FACE_COLORS[colorIdx % FACE_COLORS.length] : 0x0284c7;
        return addEdgeWire(
          new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide })
          )
        );
      };

      const yOffset = (-H / 2) * (1 - t);

      // Base (W x D)
      const base = makeRect(W, D, 3);
      base.rotation.x = Math.PI / 2;
      base.position.set(0, yOffset, 0);
      group.add(base);

      // Front (W x H) hinged at z = +D/2
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, yOffset, D / 2);
      const front = makeRect(W, H, 0);
      front.rotation.x = Math.PI / 2;
      front.position.set(0, 0, H / 2);
      frontPivot.add(front);
      frontPivot.rotation.x = (1 - t) * (-Math.PI / 2);
      group.add(frontPivot);

      // Back (W x H) hinged at z = -D/2
      const backPivot = new THREE.Group();
      backPivot.position.set(0, yOffset, -D / 2);
      const back = makeRect(W, H, 1);
      back.rotation.x = Math.PI / 2;
      back.position.set(0, 0, -H / 2);
      backPivot.add(back);
      backPivot.rotation.x = (1 - t) * (Math.PI / 2);
      group.add(backPivot);

      // Top (W x D) hinged at outer edge of Back
      const topPivot = new THREE.Group();
      topPivot.position.set(0, 0, -H);
      const top = makeRect(W, D, 2);
      top.rotation.x = Math.PI / 2;
      top.position.set(0, 0, -D / 2);
      topPivot.add(top);
      topPivot.rotation.x = (1 - t) * (Math.PI / 2);
      backPivot.add(topPivot);

      // Left (H x D) hinged at x = -W/2
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-W / 2, yOffset, 0);
      const left = makeRect(H, D, 4);
      left.rotation.x = Math.PI / 2;
      left.position.set(-H / 2, 0, 0);
      leftPivot.add(left);
      leftPivot.rotation.z = (1 - t) * (-Math.PI / 2);
      group.add(leftPivot);

      // Right (H x D) hinged at x = +W/2
      const rightPivot = new THREE.Group();
      rightPivot.position.set(W / 2, yOffset, 0);
      const right = makeRect(H, D, 5);
      right.rotation.x = Math.PI / 2;
      right.position.set(H / 2, 0, 0);
      rightPivot.add(right);
      rightPivot.rotation.z = (1 - t) * (Math.PI / 2);
      group.add(rightPivot);

    } else if (solid === 'triangular_prism') {
      if (t === 0) {
        const shape = new THREE.Shape();
        const baseW = 2.4;
        const heightTri = 2.0;
        shape.moveTo(-baseW / 2, -heightTri / 2);
        shape.lineTo(baseW / 2, -heightTri / 2);
        shape.lineTo(0, heightTri / 2);
        shape.closePath();

        const extrudeSettings = { depth: 2.8, bevelEnabled: false };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();

        const mat = new THREE.MeshStandardMaterial({ 
          color: colorful ? 0x2563eb : 0x0284c7, 
          roughness: 0.35, 
          metalness: 0.1 
        });
        group.add(addEdgeWire(new THREE.Mesh(geom, mat)));
      } else {
        const rectW = 2.0;
        const rectH = 1.8;

        const r1 = addEdgeWire(new THREE.Mesh(new THREE.PlaneGeometry(rectW, rectH), new THREE.MeshStandardMaterial({ color: 0x2563eb, side: THREE.DoubleSide })));
        r1.rotation.x = Math.PI / 2;
        group.add(r1);

        const r2 = addEdgeWire(new THREE.Mesh(new THREE.PlaneGeometry(rectW, rectH), new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })));
        r2.rotation.x = Math.PI / 2;
        r2.position.set(-rectW * t, 0, 0);
        group.add(r2);

        const r3 = addEdgeWire(new THREE.Mesh(new THREE.PlaneGeometry(rectW, rectH), new THREE.MeshStandardMaterial({ color: 0x60a5fa, side: THREE.DoubleSide })));
        r3.rotation.x = Math.PI / 2;
        r3.position.set(rectW * t, 0, 0);
        group.add(r3);

        const triShape1 = new THREE.Shape();
        triShape1.moveTo(-rectW / 2, 0);
        triShape1.lineTo(rectW / 2, 0);
        triShape1.lineTo(0, 1.5);
        triShape1.closePath();
        const t1Mesh = addEdgeWire(new THREE.Mesh(new THREE.ShapeGeometry(triShape1), new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })));
        t1Mesh.rotation.x = Math.PI / 2;
        t1Mesh.position.set(0, 0, -rectH / 2);
        group.add(t1Mesh);

        const triShape2 = new THREE.Shape();
        triShape2.moveTo(-rectW / 2, 0);
        triShape2.lineTo(rectW / 2, 0);
        triShape2.lineTo(0, -1.5);
        triShape2.closePath();
        const t2Mesh = addEdgeWire(new THREE.Mesh(new THREE.ShapeGeometry(triShape2), new THREE.MeshStandardMaterial({ color: 0x10b981, side: THREE.DoubleSide })));
        t2Mesh.rotation.x = Math.PI / 2;
        t2Mesh.position.set(0, 0, rectH / 2);
        group.add(t2Mesh);
      }

    } else if (solid === 'square_pyramid') {
      if (t === 0) {
        const geom = new THREE.ConeGeometry(2.0, 2.6, 4);
        geom.rotateY(Math.PI / 4);
        const mat = new THREE.MeshStandardMaterial({ 
          color: colorful ? 0x8b5cf6 : 0x0284c7, 
          roughness: 0.35 
        });
        group.add(addEdgeWire(new THREE.Mesh(geom, mat)));
      } else {
        const S = 1.8;
        const H_tri = 1.9;
        const baseMesh = addEdgeWire(new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, side: THREE.DoubleSide })));
        baseMesh.rotation.x = Math.PI / 2;
        group.add(baseMesh);

        const createFlap = (color: number) => {
          const s = new THREE.Shape();
          s.moveTo(-S / 2, 0);
          s.lineTo(S / 2, 0);
          s.lineTo(0, H_tri);
          s.closePath();
          return addEdgeWire(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })));
        };

        const flapN = createFlap(0xec4899);
        flapN.rotation.x = -Math.PI / 2;
        flapN.position.set(0, 0, -S / 2);
        group.add(flapN);

        const flapS = createFlap(0x3b82f6);
        flapS.rotation.x = Math.PI / 2;
        flapS.position.set(0, 0, S / 2);
        group.add(flapS);

        const flapW = createFlap(0x10b981);
        flapW.rotation.x = Math.PI / 2;
        flapW.rotation.z = -Math.PI / 2;
        flapW.position.set(-S / 2, 0, 0);
        group.add(flapW);

        const flapE = createFlap(0xf59e0b);
        flapE.rotation.x = Math.PI / 2;
        flapE.rotation.z = Math.PI / 2;
        flapE.position.set(S / 2, 0, 0);
        group.add(flapE);
      }

    } else if (solid === 'cylinder') {
      if (t === 0) {
        const geom = new THREE.CylinderGeometry(1.3, 1.3, 2.6, 32);
        const mat = new THREE.MeshStandardMaterial({ 
          color: colorful ? 0x06b6d4 : 0x0284c7, 
          roughness: 0.35 
        });
        group.add(addEdgeWire(new THREE.Mesh(geom, mat), 20));
      } else {
        const R = 1.0;
        const rectWidth = 4.2;
        const rectHeight = 2.0;

        const rectMesh = addEdgeWire(new THREE.Mesh(new THREE.PlaneGeometry(rectWidth, rectHeight), new THREE.MeshStandardMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })));
        rectMesh.rotation.x = Math.PI / 2;
        group.add(rectMesh);

        const circleTop = addEdgeWire(new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshStandardMaterial({ color: 0x3b82f6, side: THREE.DoubleSide })));
        circleTop.rotation.x = Math.PI / 2;
        circleTop.position.set(0, 0, -rectHeight / 2 - R * t);
        group.add(circleTop);

        const circleBottom = addEdgeWire(new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7, side: THREE.DoubleSide })));
        circleBottom.rotation.x = Math.PI / 2;
        circleBottom.position.set(0, 0, rectHeight / 2 + R * t);
        group.add(circleBottom);
      }
    }
  }, []);

  // Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webglSupported) return;

    const width = container.clientWidth || 360;
    const canvasHeight = typeof height === 'number' ? height : (parseInt(height, 10) || 360);

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean neutral slate-50
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // MESH GROUP
    const solidGroup = new THREE.Group();
    scene.add(solidGroup);
    solidGroupRef.current = solidGroup;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    buildSolidMesh(solidGroup, solidType, currentUnfoldRef.current, useFaceColors);

    // ANIMATION LOOP
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const isReducedMotion = typeof document !== 'undefined' && document.body.classList.contains('reduced-motion');
      if (autoRotateRef.current && !isReducedMotion && solidGroup) {
        rotationEulerRef.current.y += 0.008;
      }

      if (solidGroup) {
        solidGroup.rotation.copy(rotationEulerRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE OBSERVER
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
  }, [height, solidType, webglSupported, buildSolidMesh, useFaceColors]);

  // Rebuild mesh when solidType, currentUnfold or useFaceColors changes
  useEffect(() => {
    if (solidGroupRef.current) {
      buildSolidMesh(solidGroupRef.current, solidType, currentUnfold, useFaceColors);
    }
  }, [solidType, currentUnfold, useFaceColors, buildSolidMesh]);

  // Unfolding animation loop
  useEffect(() => {
    if (!isAnimatingUnfold) return;

    let startTime: number | null = null;
    const duration = 1200;
    const startVal = currentUnfoldRef.current;
    const targetVal = unfoldDirection === 'open' ? 1 : 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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

  // Touch and Mouse Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    rotationEulerRef.current.y += deltaX * 0.01;
    rotationEulerRef.current.x += deltaY * 0.01;

    // Limit vertical pitch to avoid flipping
    rotationEulerRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationEulerRef.current.x));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Directional Button Controls (Accessibility WCAG 2.2 AA)
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
    rotationEulerRef.current = new THREE.Euler(0.4, 0.6, 0);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 3.2, 7.5);
    }
    setInternalUnfold(0);
    if (onUnfoldChange) onUnfoldChange(0);
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

  if (!webglSupported) {
    return (
      <div 
        className="w-full bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-700"
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
        aria-label={`Visualizador 3D interativo do sólido ${solidType}`}
      />

      {/* Floating Status Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-700 backdrop-blur-xs border border-slate-200/80 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${currentUnfold > 0.5 ? 'bg-amber-500' : 'bg-blue-600'}`} />
          {currentUnfold > 0.5 ? 'Planificação 2D Aberta' : 'Sólido 3D Fechado'}
        </span>
      </div>

      {/* Interactive Controls Bar */}
      {interactive && (
        <>
          {/* Directional Pad (Top-Right) */}
          <div className="absolute top-3 right-3 flex flex-col items-center bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs gap-1">
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
          <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Left Tools (Zoom & Reset) */}
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
              <button
                onClick={() => setUseFaceColors(!useFaceColors)}
                className={`p-2 rounded-lg transition ${useFaceColors ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Destacar cores das faces"
                aria-label="Destacar cores das faces"
              >
                <Palette className="w-5 h-5" />
              </button>
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
