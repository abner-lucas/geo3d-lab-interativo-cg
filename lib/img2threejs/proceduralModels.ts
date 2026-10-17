import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SolidType } from '@/types/geo3d';

// ============================================================================
// IMG2THREEJS PROCEDURAL MODEL RUNTIME & TYPES
// ============================================================================

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
  colorfulFaces?: boolean;
  unfoldProgress?: number; // 0 = 3D fechado, 1 = Planificação 2D aberta
  explodeProgress?: number; // 0 = unido, 1 = partes destacadas (vista explodida)
  showVertices?: boolean;
  highlightPartId?: string | null;
  xrayMode?: boolean; // Opacidade translúcida para visualização interna Raio-X
  neonEdges?: boolean; // Arestas em ciano brilhante / ouro neon
  glowingVertices?: boolean; // Vértices esféricos aumentados com brilho emissivo violeta
  showGuidingRays?: boolean; // Feixes tracejados ligando faces ao centro geométrico
  explodeMultiplier?: number; // Fator de escala da distância de separação
};

export type SculptPartMetadata = {
  id: string;
  name: string;
  shapeLabel: string;
  role: 'base' | 'lateral' | 'top' | 'cap' | 'body' | 'roof' | 'detail';
  faceIndex: number;
  normalDir: [number, number, number];
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
  partMetadata: Record<string, SculptPartMetadata>;
};

export const FACE_PALETTE_HEX = [
  '#3b82f6', // 0: Azul (Frente)
  '#ef4444', // 1: Vermelho (Trás)
  '#eab308', // 2: Amarelo (Topo)
  '#a855f7', // 3: Roxo (Base)
  '#10b981', // 4: Verde (Esquerda)
  '#f97316', // 5: Laranja (Direita)
];

export const FACE_NAMES_PT = [
  'Face Frontal (Azul)',
  'Face Traseira (Vermelha)',
  'Face Superior / Topo (Amarela)',
  'Face da Base (Roxa)',
  'Face Esquerda (Verde)',
  'Face Direita (Laranja)',
];

// ============================================================================
// DETERMINISTIC NOISE & PROCEDURAL PBR MATERIAL GENERATOR (img2threejs)
// ============================================================================

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function smoothCurve(t: number): number {
  return t * t * (3 - 2 * t);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wx = ((x % periodX) + periodX) % periodX;
  const wy = ((y % periodY) + periodY) % periodY;
  let v = Math.imul(wx + seed * 17, 374761393) ^ Math.imul(wy + seed * 31, 668265263);
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

const roughnessTextureCache = new Map<string, THREE.CanvasTexture>();

function getProceduralRoughnessMap(seedKey: string, size = 128): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (roughnessTextureCache.has(seedKey)) {
    return roughnessTextureCache.get(seedKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const seed = hashString(seedKey);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const macro = periodicValueNoise(u, v, seed, 3, 3) * 0.55;
      const meso = periodicValueNoise(u, v, seed + 101, 10, 10) * 0.3;
      const micro = periodicValueNoise(u, v, seed + 307, 28, 28) * 0.15;
      const combined = macro + meso + micro;
      // Map around neutral roughness multiplier (210..250)
      const byteVal = Math.round(215 + combined * 38);
      const idx = (y * size + x) * 4;
      data[idx] = byteVal;
      data[idx + 1] = byteVal;
      data[idx + 2] = byteVal;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  roughnessTextureCache.set(seedKey, texture);
  return texture;
}

export function createSculptMaterial(
  id: string,
  hexColor: string,
  options: {
    roughness?: number;
    metalness?: number;
    clearcoat?: number;
    opacity?: number;
    highlighted?: boolean;
    wireframe?: boolean;
    xrayMode?: boolean;
  } = {}
): THREE.MeshPhysicalMaterial {
  const color = new THREE.Color().setStyle(hexColor, THREE.SRGBColorSpace);
  const roughMap = getProceduralRoughnessMap(id);

  const isXray = options.xrayMode ?? false;
  const opacity = isXray ? 0.74 : (options.opacity ?? 1);

  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: isXray ? 0.16 : (options.roughness ?? 0.32),
    metalness: isXray ? 0.04 : (options.metalness ?? 0.08),
    clearcoat: isXray ? 0.8 : (options.clearcoat ?? 0.18),
    clearcoatRoughness: 0.25,
    roughnessMap: roughMap,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    wireframe: options.wireframe ?? false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  if (options.highlighted) {
    mat.emissive = new THREE.Color().setStyle(hexColor, THREE.SRGBColorSpace);
    mat.emissiveIntensity = 0.28;
  } else if (isXray) {
    mat.emissive = new THREE.Color().setStyle(hexColor, THREE.SRGBColorSpace);
    mat.emissiveIntensity = 0.12;
  }

  return mat;
}

// Helper for crisp architectural edges and corner vertices with neon glow support
function decorateMeshWithEdges(
  mesh: THREE.Mesh,
  thresholdAngle = 15,
  highlighted = false,
  neonMode = false
): THREE.Mesh {
  const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const edgeColor = highlighted ? 0xf59e0b : (neonMode ? 0x00f5ff : 0x0f172a);
  const edgeMat = new THREE.LineBasicMaterial({
    color: edgeColor,
    linewidth: neonMode ? 2.5 : 2,
    transparent: neonMode,
    opacity: neonMode ? 0.95 : 1,
  });
  const lines = new THREE.LineSegments(edgesGeom, edgeMat);
  lines.name = `${mesh.name}__edges`;
  lines.raycast = () => {}; // Do not intercept raycast clicks on edge lines
  mesh.add(lines);
  return mesh;
}

// Helper to render GSAP X-Ray & Exploded visual scaffolding: ghost wireframe, guiding rays, and glowing vertices
function addExplodeVisualAids(
  root: THREE.Group,
  options: ProceduralModelOptions,
  center: THREE.Vector3,
  ghostGeometry: THREE.BufferGeometry | null,
  facePositions: THREE.Vector3[],
  vertexPositions: [number, number, number][]
) {
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1);
  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  if (t > 0.08) return; // Only in closed 3D state

  // 1. Ghost Central Wireframe (Origem Estrutural do Sólido)
  if (ghostGeometry && explode > 0.05) {
    const ghostMat = new THREE.LineBasicMaterial({
      color: options.neonEdges ? 0x38bdf8 : 0x94a3b8,
      transparent: true,
      opacity: Math.min(0.48, explode * 0.55),
      depthWrite: false,
    });
    const isWireframeLines = Boolean(ghostGeometry.userData?.isWireframeLines);
    const linesGeom = isWireframeLines
      ? ghostGeometry
      : new THREE.EdgesGeometry(ghostGeometry);
    const ghost = new THREE.LineSegments(linesGeom, ghostMat);
    if (isWireframeLines) {
      ghost.position.set(0, 0, 0);
    } else {
      ghost.position.copy(center);
    }
    ghost.name = 'ghost_wireframe';
    root.add(ghost);
  }

  // 2. Guiding Rays (Feixes conectando cada face flutuante ao centro)
  if ((options.showGuidingRays ?? true) && explode > 0.06) {
    const rayPoints: THREE.Vector3[] = [];
    facePositions.forEach(pos => {
      rayPoints.push(center.clone());
      rayPoints.push(pos.clone());
    });
    if (rayPoints.length > 0) {
      const rayGeom = new THREE.BufferGeometry().setFromPoints(rayPoints);
      const rayMat = new THREE.LineDashedMaterial({
        color: options.neonEdges ? 0x00f5ff : 0x64748b,
        dashSize: 0.12,
        gapSize: 0.08,
        transparent: true,
        opacity: Math.min(0.7, explode * 0.8),
        depthWrite: false,
      });
      const rays = new THREE.LineSegments(rayGeom, rayMat);
      rays.computeLineDistances();
      rays.name = 'guiding_rays';
      root.add(rays);
    }
  }

  // 3. Glowing Corner Vertices (Vértices nos cantos do sólido)
  // Vertex positions are provided in absolute 3D space [vx, vy, vz]
  if (((options.showVertices ?? false) || (options.glowingVertices ?? false)) && vertexPositions.length > 0) {
    const vGroup = new THREE.Group();
    vGroup.name = 'vertices_markers';
    const isGlowing = options.glowingVertices ?? false;
    const vRadius = isGlowing ? 0.11 : 0.08;
    const vGeom = new THREE.SphereGeometry(vRadius, 16, 16);
    const vMat = new THREE.MeshStandardMaterial({
      color: isGlowing ? 0x9333ea : 0x7c3aed,
      emissive: isGlowing ? 0xa855f7 : 0x000000,
      emissiveIntensity: isGlowing ? 1.1 : 0,
      roughness: 0.15,
      metalness: 0.25,
    });

    vertexPositions.forEach(([vx, vy, vz]) => {
      const sp = new THREE.Mesh(vGeom, vMat);
      sp.position.set(vx, vy, vz);
      vGroup.add(sp);
    });
    root.add(vGroup);
  }
}

function registerPart(
  runtime: ProceduralModelRuntime,
  pivot: THREE.Group,
  mesh: THREE.Mesh,
  meta: SculptPartMetadata
) {
  pivot.name = `${meta.id}__pivot`;
  mesh.name = meta.id;
  mesh.userData.sculptPart = meta;
  pivot.userData.sculptPart = meta;

  runtime.nodes[meta.id] = pivot;
  runtime.meshes[meta.id] = mesh;
  runtime.partMetadata[meta.id] = meta;
  runtime.colliders[meta.id] = {
    type: 'box',
    role: meta.role,
    shapeLabel: meta.shapeLabel,
  };
  if (!runtime.destructionGroups[meta.role]) {
    runtime.destructionGroups[meta.role] = [];
  }
  runtime.destructionGroups[meta.role].push(pivot);
}

// ============================================================================
// 1. CUBE MODEL FACTORY (6 Hinged Square Faces - Cruz Latina 1-4-1)
// ============================================================================

export function createCubeSculptModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CubeSculptModel';

  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  const explodeDist = (options.explodeMultiplier ?? 1.25) * 1.0;
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * explodeDist;
  const colorful = options.colorfulFaces ?? true;

  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  const S = 2.0;
  const H = S / 2;

  const makeSquareFace = (
    id: string,
    name: string,
    role: SculptPartMetadata['role'],
    colorIdx: number,
    normalDir: [number, number, number]
  ) => {
    const hex = colorful ? FACE_PALETTE_HEX[colorIdx % FACE_PALETTE_HEX.length] : '#0284c7';
    const isHighlighted = options.highlightPartId === id;
    const geom = new THREE.PlaneGeometry(S, S);
    const mat = createSculptMaterial(`cube_${id}`, hex, {
      highlighted: isHighlighted,
      wireframe: options.wireframe,
      xrayMode: options.xrayMode,
    });
    const mesh = decorateMeshWithEdges(new THREE.Mesh(geom, mat), 15, isHighlighted, options.neonEdges);
    mesh.castShadow = options.castShadow ?? true;
    mesh.receiveShadow = options.receiveShadow ?? true;
    return {
      mesh,
      meta: {
        id,
        name,
        shapeLabel: 'Quadrado (4 lados iguais)',
        role,
        faceIndex: colorIdx,
        normalDir,
      } satisfies SculptPartMetadata,
    };
  };

  const yCenterOffset = -H * (1 - t);

  // 1. Base Face (Bottom)
  const basePivot = new THREE.Group();
  basePivot.position.set(0, yCenterOffset - explode * (1 - t), 0);
  const basePart = makeSquareFace('face_base', 'Face da Base (Inferior)', 'base', 3, [0, -1, 0]);
  basePart.mesh.rotation.x = Math.PI / 2;
  basePivot.add(basePart.mesh);
  root.add(basePivot);
  registerPart(runtime, basePivot, basePart.mesh, basePart.meta);

  // 2. Front Face (hinged at z = +H)
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, yCenterOffset, H + explode * (1 - t));
  const frontPart = makeSquareFace('face_front', 'Face Frontal (Azul)', 'lateral', 0, [0, 0, 1]);
  frontPart.mesh.position.set(0, 0, H);
  frontPart.mesh.rotation.x = Math.PI / 2;
  frontPivot.add(frontPart.mesh);
  frontPivot.rotation.x = (1 - t) * (-Math.PI / 2);
  root.add(frontPivot);
  registerPart(runtime, frontPivot, frontPart.mesh, frontPart.meta);

  // 3. Back Face (hinged at z = -H)
  const backPivot = new THREE.Group();
  backPivot.position.set(0, yCenterOffset, -H - explode * (1 - t));
  const backPart = makeSquareFace('face_back', 'Face Traseira (Vermelha)', 'lateral', 1, [0, 0, -1]);
  backPart.mesh.position.set(0, 0, -H);
  backPart.mesh.rotation.x = Math.PI / 2;
  backPivot.add(backPart.mesh);
  backPivot.rotation.x = (1 - t) * (Math.PI / 2);
  root.add(backPivot);
  registerPart(runtime, backPivot, backPart.mesh, backPart.meta);

  // 4. Top Face (hinged on Back Face outer edge)
  const topPivot = new THREE.Group();
  topPivot.position.set(0, explode * (1 - t), -2 * H);
  const topPart = makeSquareFace('face_top', 'Face do Topo (Amarela)', 'top', 2, [0, 1, 0]);
  topPart.mesh.position.set(0, 0, -H);
  topPart.mesh.rotation.x = Math.PI / 2;
  topPivot.add(topPart.mesh);
  topPivot.rotation.x = (1 - t) * (Math.PI / 2);
  backPivot.add(topPivot);
  registerPart(runtime, topPivot, topPart.mesh, topPart.meta);

  // 5. Left Face (hinged at x = -H)
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-H - explode * (1 - t), yCenterOffset, 0);
  const leftPart = makeSquareFace('face_left', 'Face Esquerda (Verde)', 'lateral', 4, [-1, 0, 0]);
  leftPart.mesh.position.set(-H, 0, 0);
  leftPart.mesh.rotation.x = Math.PI / 2;
  leftPivot.add(leftPart.mesh);
  leftPivot.rotation.z = (1 - t) * (-Math.PI / 2);
  root.add(leftPivot);
  registerPart(runtime, leftPivot, leftPart.mesh, leftPart.meta);

  // 6. Right Face (hinged at x = +H)
  const rightPivot = new THREE.Group();
  rightPivot.position.set(H + explode * (1 - t), yCenterOffset, 0);
  const rightPart = makeSquareFace('face_right', 'Face Direita (Laranja)', 'lateral', 5, [1, 0, 0]);
  rightPart.mesh.position.set(H, 0, 0);
  rightPart.mesh.rotation.x = Math.PI / 2;
  rightPivot.add(rightPart.mesh);
  rightPivot.rotation.z = (1 - t) * (Math.PI / 2);
  root.add(rightPivot);
  registerPart(runtime, rightPivot, rightPart.mesh, rightPart.meta);

  // GSAP X-Ray & Explode visual scaffolding (Ghost wireframe, guiding rays, glowing vertices)
  addExplodeVisualAids(
    root,
    options,
    new THREE.Vector3(0, 0, 0),
    new THREE.BoxGeometry(S, S, S),
    [
      new THREE.Vector3(0, -H - explode * (1 - t), 0),
      new THREE.Vector3(0, H + explode * (1 - t), 0),
      new THREE.Vector3(0, 0, H + explode * (1 - t)),
      new THREE.Vector3(0, 0, -H - explode * (1 - t)),
      new THREE.Vector3(-H - explode * (1 - t), 0, 0),
      new THREE.Vector3(H + explode * (1 - t), 0, 0),
    ],
    [
      [-H,  H,  H], [ H,  H,  H], [ H,  H, -H], [-H,  H, -H],
      [-H, -H,  H], [ H, -H,  H], [ H, -H, -H], [-H, -H, -H]
    ]
  );

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// 2. CUBOID MODEL FACTORY (6 Hinged Rectangular Faces - Paralelepípedo)
// ============================================================================

export function createCuboidSculptModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CuboidSculptModel';

  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  const explodeDist = (options.explodeMultiplier ?? 1.25) * 1.0;
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * explodeDist;
  const colorful = options.colorfulFaces ?? true;

  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  const W = 2.6;
  const H = 1.4;
  const D = 1.8;

  const makeRectFace = (
    id: string,
    name: string,
    w: number,
    d: number,
    role: SculptPartMetadata['role'],
    colorIdx: number,
    normalDir: [number, number, number]
  ) => {
    const hex = colorful ? FACE_PALETTE_HEX[colorIdx % FACE_PALETTE_HEX.length] : '#0284c7';
    const isHighlighted = options.highlightPartId === id;
    const geom = new THREE.PlaneGeometry(w, d);
    const mat = createSculptMaterial(`cuboid_${id}`, hex, {
      highlighted: isHighlighted,
      wireframe: options.wireframe,
      xrayMode: options.xrayMode,
    });
    const mesh = decorateMeshWithEdges(new THREE.Mesh(geom, mat), 15, isHighlighted, options.neonEdges);
    mesh.castShadow = options.castShadow ?? true;
    mesh.receiveShadow = options.receiveShadow ?? true;
    return {
      mesh,
      meta: {
        id,
        name,
        shapeLabel: 'Retângulo (lados opostos iguais)',
        role,
        faceIndex: colorIdx,
        normalDir,
      } satisfies SculptPartMetadata,
    };
  };

  const yOffset = (-H / 2) * (1 - t);

  // Base (W x D)
  const basePivot = new THREE.Group();
  basePivot.position.set(0, yOffset - explode * (1 - t), 0);
  const basePart = makeRectFace('face_base', 'Base Retangular Inferior', W, D, 'base', 3, [0, -1, 0]);
  basePart.mesh.rotation.x = Math.PI / 2;
  basePivot.add(basePart.mesh);
  root.add(basePivot);
  registerPart(runtime, basePivot, basePart.mesh, basePart.meta);

  // Front (W x H)
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, yOffset, D / 2 + explode * (1 - t));
  const frontPart = makeRectFace('face_front', 'Face Frontal Retangular', W, H, 'lateral', 0, [0, 0, 1]);
  frontPart.mesh.rotation.x = Math.PI / 2;
  frontPart.mesh.position.set(0, 0, H / 2);
  frontPivot.add(frontPart.mesh);
  frontPivot.rotation.x = (1 - t) * (-Math.PI / 2);
  root.add(frontPivot);
  registerPart(runtime, frontPivot, frontPart.mesh, frontPart.meta);

  // Back (W x H)
  const backPivot = new THREE.Group();
  backPivot.position.set(0, yOffset, -D / 2 - explode * (1 - t));
  const backPart = makeRectFace('face_back', 'Face Traseira Retangular', W, H, 'lateral', 1, [0, 0, -1]);
  backPart.mesh.rotation.x = Math.PI / 2;
  backPart.mesh.position.set(0, 0, -H / 2);
  backPivot.add(backPart.mesh);
  backPivot.rotation.x = (1 - t) * (Math.PI / 2);
  root.add(backPivot);
  registerPart(runtime, backPivot, backPart.mesh, backPart.meta);

  // Top (W x D)
  const topPivot = new THREE.Group();
  topPivot.position.set(0, explode * (1 - t), -H);
  const topPart = makeRectFace('face_top', 'Tampa Retangular Superior', W, D, 'top', 2, [0, 1, 0]);
  topPart.mesh.rotation.x = Math.PI / 2;
  topPart.mesh.position.set(0, 0, -D / 2);
  topPivot.add(topPart.mesh);
  topPivot.rotation.x = (1 - t) * (Math.PI / 2);
  backPivot.add(topPivot);
  registerPart(runtime, topPivot, topPart.mesh, topPart.meta);

  // Left (H x D)
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-W / 2 - explode * (1 - t), yOffset, 0);
  const leftPart = makeRectFace('face_left', 'Lateral Esquerda Retangular', H, D, 'lateral', 4, [-1, 0, 0]);
  leftPart.mesh.rotation.x = Math.PI / 2;
  leftPart.mesh.position.set(-H / 2, 0, 0);
  leftPivot.add(leftPart.mesh);
  leftPivot.rotation.z = (1 - t) * (-Math.PI / 2);
  root.add(leftPivot);
  registerPart(runtime, leftPivot, leftPart.mesh, leftPart.meta);

  // Right (H x D)
  const rightPivot = new THREE.Group();
  rightPivot.position.set(W / 2 + explode * (1 - t), yOffset, 0);
  const rightPart = makeRectFace('face_right', 'Lateral Direita Retangular', H, D, 'lateral', 5, [1, 0, 0]);
  rightPart.mesh.rotation.x = Math.PI / 2;
  rightPart.mesh.position.set(H / 2, 0, 0);
  rightPivot.add(rightPart.mesh);
  rightPivot.rotation.z = (1 - t) * (Math.PI / 2);
  root.add(rightPivot);
  registerPart(runtime, rightPivot, rightPart.mesh, rightPart.meta);

  // GSAP X-Ray & Explode visual scaffolding (Ghost wireframe, guiding rays, glowing vertices)
  addExplodeVisualAids(
    root,
    options,
    new THREE.Vector3(0, 0, 0),
    new THREE.BoxGeometry(W, H, D),
    [
      new THREE.Vector3(0, -H / 2 - explode * (1 - t), 0),
      new THREE.Vector3(0, H / 2 + explode * (1 - t), 0),
      new THREE.Vector3(0, 0, D / 2 + explode * (1 - t)),
      new THREE.Vector3(0, 0, -D / 2 - explode * (1 - t)),
      new THREE.Vector3(-W / 2 - explode * (1 - t), 0, 0),
      new THREE.Vector3(W / 2 + explode * (1 - t), 0, 0),
    ],
    [
      [-W / 2,  H / 2,  D / 2], [ W / 2,  H / 2,  D / 2], [ W / 2,  H / 2, -D / 2], [-W / 2,  H / 2, -D / 2],
      [-W / 2, -H / 2,  D / 2], [ W / 2, -H / 2,  D / 2], [ W / 2, -H / 2, -D / 2], [-W / 2, -H / 2, -D / 2]
    ]
  );

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// 3. TRIANGULAR PRISM MODEL FACTORY (Continuous Hinged 3 Rectangles + 2 Triangles)
// ============================================================================

export function createTriangularPrismSculptModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'TriangularPrismSculptModel';

  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  const explodeDist = (options.explodeMultiplier ?? 1.25) * 1.0;
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * explodeDist;
  const colorful = options.colorfulFaces ?? true;

  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  // Equilateral triangle cross-section: width S = 2.1, depth L = 2.4
  const S = 2.1;
  const L = 2.4;
  const triHeight = S * (Math.sqrt(3) / 2); // ~1.818
  const yOffset = (-triHeight / 3) * (1 - t);

  // 1. Base Rectangle (S x L) on XZ plane
  const basePivot = new THREE.Group();
  basePivot.position.set(0, yOffset - explode * (1 - t), 0);
  const baseHex = colorful ? '#3b82f6' : '#0284c7';
  const baseHighlighted = options.highlightPartId === 'prism_base';
  const baseMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.PlaneGeometry(S, L),
      createSculptMaterial('prism_base', baseHex, { highlighted: baseHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    baseHighlighted,
    options.neonEdges
  );
  baseMesh.rotation.x = Math.PI / 2;
  basePivot.add(baseMesh);
  root.add(basePivot);
  registerPart(runtime, basePivot, baseMesh, {
    id: 'prism_base',
    name: 'Face Retangular da Base',
    shapeLabel: 'Retângulo (Base inferior)',
    role: 'base',
    faceIndex: 0,
    normalDir: [0, -1, 0],
  });

  // 2. Left Rectangular Slope (hinged at x = -S/2)
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-S / 2 - explode * 0.7 * (1 - t), yOffset + explode * 0.4 * (1 - t), 0);
  const leftHex = colorful ? '#10b981' : '#0ea5e9';
  const leftHighlighted = options.highlightPartId === 'prism_left';
  const leftMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.PlaneGeometry(S, L),
      createSculptMaterial('prism_left', leftHex, { highlighted: leftHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    leftHighlighted,
    options.neonEdges
  );
  leftMesh.rotation.x = Math.PI / 2;
  leftMesh.position.set(-S / 2, 0, 0);
  leftPivot.add(leftMesh);
  leftPivot.rotation.z = (1 - t) * (-2 * Math.PI / 3);
  root.add(leftPivot);
  registerPart(runtime, leftPivot, leftMesh, {
    id: 'prism_left',
    name: 'Parede Retangular Esquerda',
    shapeLabel: 'Retângulo (Lateral inclinada)',
    role: 'lateral',
    faceIndex: 4,
    normalDir: [-0.86, 0.5, 0],
  });

  // 3. Right Rectangular Slope (hinged at x = +S/2)
  const rightPivot = new THREE.Group();
  rightPivot.position.set(S / 2 + explode * 0.7 * (1 - t), yOffset + explode * 0.4 * (1 - t), 0);
  const rightHex = colorful ? '#f97316' : '#0ea5e9';
  const rightHighlighted = options.highlightPartId === 'prism_right';
  const rightMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.PlaneGeometry(S, L),
      createSculptMaterial('prism_right', rightHex, { highlighted: rightHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    rightHighlighted,
    options.neonEdges
  );
  rightMesh.rotation.x = Math.PI / 2;
  rightMesh.position.set(S / 2, 0, 0);
  rightPivot.add(rightMesh);
  rightPivot.rotation.z = (1 - t) * (2 * Math.PI / 3);
  root.add(rightPivot);
  registerPart(runtime, rightPivot, rightMesh, {
    id: 'prism_right',
    name: 'Parede Retangular Direita',
    shapeLabel: 'Retângulo (Lateral inclinada)',
    role: 'lateral',
    faceIndex: 5,
    normalDir: [0.86, 0.5, 0],
  });

  // 4. Front Triangular Base (hinged at z = +L/2)
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, yOffset, L / 2 + explode * (1 - t));
  const frontTriShape = new THREE.Shape();
  frontTriShape.moveTo(-S / 2, 0);
  frontTriShape.lineTo(S / 2, 0);
  frontTriShape.lineTo(0, triHeight);
  frontTriShape.closePath();

  const frontHex = colorful ? '#eab308' : '#0284c7';
  const frontHighlighted = options.highlightPartId === 'prism_front_tri';
  const frontTriMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(frontTriShape),
      createSculptMaterial('prism_front_tri', frontHex, { highlighted: frontHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    frontHighlighted,
    options.neonEdges
  );
  frontTriMesh.rotation.x = Math.PI / 2;
  frontPivot.add(frontTriMesh);
  frontPivot.rotation.x = (1 - t) * (-Math.PI / 2);
  root.add(frontPivot);
  registerPart(runtime, frontPivot, frontTriMesh, {
    id: 'prism_front_tri',
    name: 'Base Triangular Frontal',
    shapeLabel: 'Triângulo (3 lados)',
    role: 'cap',
    faceIndex: 2,
    normalDir: [0, 0, 1],
  });

  // 5. Back Triangular Base (hinged at z = -L/2)
  const backPivot = new THREE.Group();
  backPivot.position.set(0, yOffset, -L / 2 - explode * (1 - t));
  const backTriShape = new THREE.Shape();
  backTriShape.moveTo(-S / 2, 0);
  backTriShape.lineTo(S / 2, 0);
  backTriShape.lineTo(0, -triHeight);
  backTriShape.closePath();

  const backHex = colorful ? '#a855f7' : '#0284c7';
  const backHighlighted = options.highlightPartId === 'prism_back_tri';
  const backTriMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(backTriShape),
      createSculptMaterial('prism_back_tri', backHex, { highlighted: backHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    backHighlighted,
    options.neonEdges
  );
  backTriMesh.rotation.x = Math.PI / 2;
  backPivot.add(backTriMesh);
  backPivot.rotation.x = (1 - t) * (Math.PI / 2);
  root.add(backPivot);
  registerPart(runtime, backPivot, backTriMesh, {
    id: 'prism_back_tri',
    name: 'Base Triangular Traseira',
    shapeLabel: 'Triângulo (3 lados)',
    role: 'cap',
    faceIndex: 3,
    normalDir: [0, 0, -1],
  });

  // GSAP X-Ray & Explode visual scaffolding (Guiding rays, glowing vertices)
  const prismGhostGeom = new THREE.BufferGeometry();
  const prismEdgePts: THREE.Vector3[] = [
    new THREE.Vector3(-S / 2, -triHeight / 3, L / 2), new THREE.Vector3(S / 2, -triHeight / 3, L / 2),
    new THREE.Vector3(S / 2, -triHeight / 3, L / 2), new THREE.Vector3(0, 2 * triHeight / 3, L / 2),
    new THREE.Vector3(0, 2 * triHeight / 3, L / 2), new THREE.Vector3(-S / 2, -triHeight / 3, L / 2),
    new THREE.Vector3(-S / 2, -triHeight / 3, -L / 2), new THREE.Vector3(S / 2, -triHeight / 3, -L / 2),
    new THREE.Vector3(S / 2, -triHeight / 3, -L / 2), new THREE.Vector3(0, 2 * triHeight / 3, -L / 2),
    new THREE.Vector3(0, 2 * triHeight / 3, -L / 2), new THREE.Vector3(-S / 2, -triHeight / 3, -L / 2),
    new THREE.Vector3(-S / 2, -triHeight / 3, L / 2), new THREE.Vector3(-S / 2, -triHeight / 3, -L / 2),
    new THREE.Vector3(S / 2, -triHeight / 3, L / 2), new THREE.Vector3(S / 2, -triHeight / 3, -L / 2),
    new THREE.Vector3(0, 2 * triHeight / 3, L / 2), new THREE.Vector3(0, 2 * triHeight / 3, -L / 2),
  ];
  prismGhostGeom.setFromPoints(prismEdgePts);
  prismGhostGeom.userData.isWireframeLines = true;

  addExplodeVisualAids(
    root,
    options,
    new THREE.Vector3(0, 0, 0),
    prismGhostGeom,
    [
      new THREE.Vector3(0, -triHeight / 3 - explode * (1 - t), 0),
      new THREE.Vector3(-S / 4 - explode * 0.7 * (1 - t), triHeight / 6 + explode * 0.4 * (1 - t), 0),
      new THREE.Vector3(S / 4 + explode * 0.7 * (1 - t), triHeight / 6 + explode * 0.4 * (1 - t), 0),
      new THREE.Vector3(0, 0, L / 2 + explode * (1 - t)),
      new THREE.Vector3(0, 0, -L / 2 - explode * (1 - t)),
    ],
    [
      [-S / 2, -triHeight / 3,  L / 2],
      [ S / 2, -triHeight / 3,  L / 2],
      [ 0,      2 * triHeight / 3, L / 2],
      [-S / 2, -triHeight / 3, -L / 2],
      [ S / 2, -triHeight / 3, -L / 2],
      [ 0,      2 * triHeight / 3, -L / 2]
    ]
  );

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// 4. SQUARE PYRAMID MODEL FACTORY (Continuous Hinged 1 Square + 4 Triangles)
// ============================================================================

export function createSquarePyramidSculptModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'SquarePyramidSculptModel';

  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  const explodeDist = (options.explodeMultiplier ?? 1.25) * 1.0;
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * explodeDist;
  const colorful = options.colorfulFaces ?? true;

  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  const S = 2.0; // Base square side
  const halfS = S / 2; // 1.0
  const slantH = 2.0; // Slant height of each triangular flap
  const foldAngle = Math.PI - Math.acos(halfS / slantH);
  const pyramidHeight = Math.sqrt(slantH * slantH - halfS * halfS); // ~1.732
  const yOffset = (-pyramidHeight / 2.5) * (1 - t);

  // 1. Square Base
  const basePivot = new THREE.Group();
  basePivot.position.set(0, yOffset - explode * (1 - t), 0);
  const baseHex = colorful ? '#8b5cf6' : '#0284c7';
  const baseHighlighted = options.highlightPartId === 'pyramid_base';
  const baseMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.PlaneGeometry(S, S),
      createSculptMaterial('pyramid_base', baseHex, { highlighted: baseHighlighted, wireframe: options.wireframe, xrayMode: options.xrayMode })
    ),
    15,
    baseHighlighted,
    options.neonEdges
  );
  baseMesh.rotation.x = Math.PI / 2;
  basePivot.add(baseMesh);
  root.add(basePivot);
  registerPart(runtime, basePivot, baseMesh, {
    id: 'pyramid_base',
    name: 'Base Quadrada Central',
    shapeLabel: 'Quadrado (Base de apoio)',
    role: 'base',
    faceIndex: 3,
    normalDir: [0, -1, 0],
  });

  // Helper for triangular flaps
  // Flap 1: Front (+Z edge)
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, yOffset + explode * 0.3 * (1 - t), halfS + explode * 0.7 * (1 - t));
  const frontShape = new THREE.Shape();
  frontShape.moveTo(-halfS, 0);
  frontShape.lineTo(halfS, 0);
  frontShape.lineTo(0, slantH);
  frontShape.closePath();
  const frontHighlighted = options.highlightPartId === 'pyramid_front';
  const frontMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(frontShape),
      createSculptMaterial('pyramid_front', colorful ? '#3b82f6' : '#0ea5e9', {
        highlighted: frontHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    15,
    frontHighlighted,
    options.neonEdges
  );
  frontMesh.rotation.x = Math.PI / 2;
  frontPivot.add(frontMesh);
  frontPivot.rotation.x = (1 - t) * (-foldAngle);
  root.add(frontPivot);
  registerPart(runtime, frontPivot, frontMesh, {
    id: 'pyramid_front',
    name: 'Face Triangular Frontal',
    shapeLabel: 'Triângulo Lateral',
    role: 'lateral',
    faceIndex: 0,
    normalDir: [0, 0.5, 0.86],
  });

  // Flap 2: Back (-Z edge)
  const backPivot = new THREE.Group();
  backPivot.position.set(0, yOffset + explode * 0.3 * (1 - t), -halfS - explode * 0.7 * (1 - t));
  const backShape = new THREE.Shape();
  backShape.moveTo(-halfS, 0);
  backShape.lineTo(halfS, 0);
  backShape.lineTo(0, -slantH);
  backShape.closePath();
  const backHighlighted = options.highlightPartId === 'pyramid_back';
  const backMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(backShape),
      createSculptMaterial('pyramid_back', colorful ? '#ef4444' : '#0ea5e9', {
        highlighted: backHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    15,
    backHighlighted,
    options.neonEdges
  );
  backMesh.rotation.x = Math.PI / 2;
  backPivot.add(backMesh);
  backPivot.rotation.x = (1 - t) * foldAngle;
  root.add(backPivot);
  registerPart(runtime, backPivot, backMesh, {
    id: 'pyramid_back',
    name: 'Face Triangular Traseira',
    shapeLabel: 'Triângulo Lateral',
    role: 'lateral',
    faceIndex: 1,
    normalDir: [0, 0.5, -0.86],
  });

  // Flap 3: Left (-X edge)
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-halfS - explode * 0.7 * (1 - t), yOffset + explode * 0.3 * (1 - t), 0);
  const leftShape = new THREE.Shape();
  leftShape.moveTo(0, -halfS);
  leftShape.lineTo(0, halfS);
  leftShape.lineTo(-slantH, 0);
  leftShape.closePath();
  const leftHighlighted = options.highlightPartId === 'pyramid_left';
  const leftMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(leftShape),
      createSculptMaterial('pyramid_left', colorful ? '#10b981' : '#0ea5e9', {
        highlighted: leftHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    15,
    leftHighlighted,
    options.neonEdges
  );
  leftMesh.rotation.x = Math.PI / 2;
  leftPivot.add(leftMesh);
  leftPivot.rotation.z = (1 - t) * (-foldAngle);
  root.add(leftPivot);
  registerPart(runtime, leftPivot, leftMesh, {
    id: 'pyramid_left',
    name: 'Face Triangular Esquerda',
    shapeLabel: 'Triângulo Lateral',
    role: 'lateral',
    faceIndex: 4,
    normalDir: [-0.86, 0.5, 0],
  });

  // Flap 4: Right (+X edge)
  const rightPivot = new THREE.Group();
  rightPivot.position.set(halfS + explode * 0.7 * (1 - t), yOffset + explode * 0.3 * (1 - t), 0);
  const rightShape = new THREE.Shape();
  rightShape.moveTo(0, -halfS);
  rightShape.lineTo(0, halfS);
  rightShape.lineTo(slantH, 0);
  rightShape.closePath();
  const rightHighlighted = options.highlightPartId === 'pyramid_right';
  const rightMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.ShapeGeometry(rightShape),
      createSculptMaterial('pyramid_right', colorful ? '#f59e0b' : '#0ea5e9', {
        highlighted: rightHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    15,
    rightHighlighted,
    options.neonEdges
  );
  rightMesh.rotation.x = Math.PI / 2;
  rightPivot.add(rightMesh);
  rightPivot.rotation.z = (1 - t) * foldAngle;
  root.add(rightPivot);
  registerPart(runtime, rightPivot, rightMesh, {
    id: 'pyramid_right',
    name: 'Face Triangular Direita',
    shapeLabel: 'Triângulo Lateral',
    role: 'lateral',
    faceIndex: 5,
    normalDir: [0.86, 0.5, 0],
  });

  // GSAP X-Ray & Explode visual scaffolding (Guiding rays, glowing vertices)
  const pyramidGhostGeom = new THREE.BufferGeometry();
  const pyramidEdgePts: THREE.Vector3[] = [
    // 4 base edges:
    new THREE.Vector3(-halfS, yOffset, halfS), new THREE.Vector3(halfS, yOffset, halfS),
    new THREE.Vector3(halfS, yOffset, halfS), new THREE.Vector3(halfS, yOffset, -halfS),
    new THREE.Vector3(halfS, yOffset, -halfS), new THREE.Vector3(-halfS, yOffset, -halfS),
    new THREE.Vector3(-halfS, yOffset, -halfS), new THREE.Vector3(-halfS, yOffset, halfS),
    // 4 slant edges to apex:
    new THREE.Vector3(-halfS, yOffset, halfS), new THREE.Vector3(0, yOffset + pyramidHeight, 0),
    new THREE.Vector3(halfS, yOffset, halfS), new THREE.Vector3(0, yOffset + pyramidHeight, 0),
    new THREE.Vector3(halfS, yOffset, -halfS), new THREE.Vector3(0, yOffset + pyramidHeight, 0),
    new THREE.Vector3(-halfS, yOffset, -halfS), new THREE.Vector3(0, yOffset + pyramidHeight, 0),
  ];
  pyramidGhostGeom.setFromPoints(pyramidEdgePts);
  pyramidGhostGeom.userData.isWireframeLines = true;

  addExplodeVisualAids(
    root,
    options,
    new THREE.Vector3(0, yOffset + pyramidHeight * 0.25, 0),
    pyramidGhostGeom,
    [
      new THREE.Vector3(0, yOffset - explode * (1 - t), 0),
      new THREE.Vector3(0, yOffset + pyramidHeight / 3 + explode * 0.3 * (1 - t), halfS * 0.5 + explode * 0.7 * (1 - t)),
      new THREE.Vector3(0, yOffset + pyramidHeight / 3 + explode * 0.3 * (1 - t), -halfS * 0.5 - explode * 0.7 * (1 - t)),
      new THREE.Vector3(-halfS * 0.5 - explode * 0.7 * (1 - t), yOffset + pyramidHeight / 3 + explode * 0.3 * (1 - t), 0),
      new THREE.Vector3(halfS * 0.5 + explode * 0.7 * (1 - t), yOffset + pyramidHeight / 3 + explode * 0.3 * (1 - t), 0),
    ],
    [
      [-halfS, yOffset,  halfS],
      [ halfS, yOffset,  halfS],
      [ halfS, yOffset, -halfS],
      [-halfS, yOffset, -halfS],
      [0,      yOffset + pyramidHeight, 0]
    ]
  );

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// 5. CYLINDER MODEL FACTORY (Continuous Unrolling Lateral Wall + 2 Circular Caps)
// ============================================================================

export function createCylinderSculptModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CylinderSculptModel';

  const t = THREE.MathUtils.clamp(options.unfoldProgress ?? 0, 0, 1);
  const explodeDist = (options.explodeMultiplier ?? 1.25) * 1.0;
  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * explodeDist;
  const colorful = options.colorfulFaces ?? true;

  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  const R = 1.05;
  const H = 2.2;

  const segmentsX = 48;
  const segmentsY = 1;
  const totalWidth = 2 * Math.PI * R;

  const tiltAngle = t * (Math.PI / 2); // 0 = vertical cylinder, PI/2 = flat on XZ plane

  const orientGroup = new THREE.Group();
  orientGroup.rotation.x = -tiltAngle;
  root.add(orientGroup);

  const lateralPivot = new THREE.Group();
  orientGroup.add(lateralPivot);

  const latGeom = new THREE.PlaneGeometry(totalWidth, H, segmentsX, segmentsY);
  const posAttr = latGeom.attributes.position;

  const curlFactor = Math.max(0.0005, 1 - t);
  const effRadius = R / curlFactor;

  for (let i = 0; i < posAttr.count; i++) {
    const xOrig = posAttr.getX(i);
    const yOrig = posAttr.getY(i);
    const angle = xOrig / effRadius;
    const px = effRadius * Math.sin(angle);
    const pz = effRadius * Math.cos(angle) - effRadius + R * (1 - t);
    posAttr.setXYZ(i, px, yOrig, pz);
  }
  latGeom.computeVertexNormals();

  const latHex = colorful ? '#06b6d4' : '#0284c7';
  const latHighlighted = options.highlightPartId === 'cylinder_lateral';
  const latMat = createSculptMaterial('cylinder_lateral', latHex, {
    highlighted: latHighlighted,
    wireframe: options.wireframe,
    xrayMode: options.xrayMode,
  });
  const latMesh = decorateMeshWithEdges(new THREE.Mesh(latGeom, latMat), 25, latHighlighted, options.neonEdges);
  lateralPivot.add(latMesh);
  registerPart(runtime, lateralPivot, latMesh, {
    id: 'cylinder_lateral',
    name: 'Superfície Lateral Curva (Retângulo quando aberta)',
    shapeLabel: 'Retângulo Curvado',
    role: 'lateral',
    faceIndex: 0,
    normalDir: [0, 0, 1],
  });

  // Top Circular Cap (hinged at top of spine: y = +H/2, z = R*(1-t))
  const topCapPivot = new THREE.Group();
  topCapPivot.position.set(0, H / 2 + explode * (1 - t), R * (1 - t));
  const topCapHighlighted = options.highlightPartId === 'cylinder_top';
  const topCapMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.CircleGeometry(R, 40),
      createSculptMaterial('cylinder_top', colorful ? '#eab308' : '#0ea5e9', {
        highlighted: topCapHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    20,
    topCapHighlighted,
    options.neonEdges
  );
  topCapMesh.position.set(0, R, 0);
  topCapPivot.add(topCapMesh);
  topCapPivot.rotation.x = (1 - t) * (-Math.PI / 2);
  orientGroup.add(topCapPivot);
  registerPart(runtime, topCapPivot, topCapMesh, {
    id: 'cylinder_top',
    name: 'Base Circular Superior (Tampa)',
    shapeLabel: 'Círculo Plano',
    role: 'top',
    faceIndex: 2,
    normalDir: [0, 1, 0],
  });

  // Bottom Circular Cap (hinged at bottom of spine: y = -H/2, z = R*(1-t))
  const bottomCapPivot = new THREE.Group();
  bottomCapPivot.position.set(0, -H / 2 - explode * (1 - t), R * (1 - t));
  const bottomCapHighlighted = options.highlightPartId === 'cylinder_bottom';
  const bottomCapMesh = decorateMeshWithEdges(
    new THREE.Mesh(
      new THREE.CircleGeometry(R, 40),
      createSculptMaterial('cylinder_bottom', colorful ? '#a855f7' : '#0ea5e9', {
        highlighted: bottomCapHighlighted,
        wireframe: options.wireframe,
        xrayMode: options.xrayMode,
      })
    ),
    20,
    bottomCapHighlighted,
    options.neonEdges
  );
  bottomCapMesh.position.set(0, -R, 0);
  bottomCapPivot.add(bottomCapMesh);
  bottomCapPivot.rotation.x = (1 - t) * (Math.PI / 2);
  orientGroup.add(bottomCapPivot);
  registerPart(runtime, bottomCapPivot, bottomCapMesh, {
    id: 'cylinder_bottom',
    name: 'Base Circular Inferior (Fundo)',
    shapeLabel: 'Círculo Plano',
    role: 'base',
    faceIndex: 3,
    normalDir: [0, -1, 0],
  });

  // GSAP X-Ray & Explode visual scaffolding
  addExplodeVisualAids(
    root,
    options,
    new THREE.Vector3(0, 0, 0),
    new THREE.CylinderGeometry(R, R, H, 24),
    [
      new THREE.Vector3(0, H / 2 + explode * (1 - t) + R / 2, 0),
      new THREE.Vector3(0, -H / 2 - explode * (1 - t) - R / 2, 0),
    ],
    [] // Cilindro é corpo redondo e possui 0 vértices (sem pontas)
  );

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// 6. HOUSE COMPOSITE 3D MODEL FACTORY (For HouseComposer & Architectural Demo)
// ============================================================================

export function createHouseCompositeSculptModel(
  basePiece: string,
  roofPiece: string,
  options: ProceduralModelOptions & { isReferenceTarget?: boolean } = {}
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'HouseCompositeSculptModel';

  const explode = THREE.MathUtils.clamp(options.explodeProgress ?? 0, 0, 1) * 0.6;
  const runtime: ProceduralModelRuntime = {
    nodes: { root },
    meshes: {},
    sockets: {},
    colliders: {},
    destructionGroups: {},
    partMetadata: {},
  };

  const buildPieceMesh = (pieceType: string, slot: 'base' | 'roof'): THREE.Group => {
    const group = new THREE.Group();
    const isRoof = slot === 'roof';

    if (pieceType === 'cube') {
      const s = isRoof ? 1.7 : 2.0;
      const geom = new THREE.BoxGeometry(s, s, s);
      const mat = createSculptMaterial(`house_${slot}_cube`, isRoof ? '#f59e0b' : '#3b82f6');
      const mesh = decorateMeshWithEdges(new THREE.Mesh(geom, mat), 15);
      group.add(mesh);

      // Architectural door & window details when used as base
      if (!isRoof) {
        const doorGeom = new THREE.PlaneGeometry(0.55, 0.95);
        const doorMat = createSculptMaterial('house_door', '#1e293b', { roughness: 0.5 });
        const doorMesh = decorateMeshWithEdges(new THREE.Mesh(doorGeom, doorMat), 15);
        doorMesh.position.set(0, -0.5, s / 2 + 0.015);
        group.add(doorMesh);

        const winGeom = new THREE.PlaneGeometry(0.42, 0.42);
        const winMat = createSculptMaterial('house_win', '#bae6fd', { roughness: 0.15, clearcoat: 0.6 });
        const winL = decorateMeshWithEdges(new THREE.Mesh(winGeom, winMat), 15);
        winL.position.set(-0.52, 0.28, s / 2 + 0.015);
        const winR = decorateMeshWithEdges(new THREE.Mesh(winGeom, winMat), 15);
        winR.position.set(0.52, 0.28, s / 2 + 0.015);
        group.add(winL, winR);
      }
    } else if (pieceType === 'triangular_prism') {
      const w = 2.25;
      const h = 1.35;
      const d = 2.15;
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, -h / 2);
      shape.lineTo(w / 2, -h / 2);
      shape.lineTo(0, h / 2);
      shape.closePath();

      const geom = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
      geom.center();
      const mat = createSculptMaterial(`house_${slot}_prism`, isRoof ? '#f59e0b' : '#3b82f6');
      const mesh = decorateMeshWithEdges(new THREE.Mesh(geom, mat), 15);
      group.add(mesh);
    } else if (pieceType === 'sphere') {
      const r = isRoof ? 1.0 : 1.1;
      const geom = new THREE.SphereGeometry(r, 28, 20);
      const mat = createSculptMaterial(`house_${slot}_sphere`, '#f43f5e');
      const mesh = decorateMeshWithEdges(new THREE.Mesh(geom, mat), 25);
      group.add(mesh);
    }

    return group;
  };

  // Base Slot (y = -0.75)
  if (basePiece) {
    const baseGroup = buildPieceMesh(basePiece, 'base');
    baseGroup.position.set(0, -0.75 - explode * 0.5, 0);
    root.add(baseGroup);
    runtime.nodes['house_base'] = baseGroup;
  } else {
    // Wireframe placeholder slot for Base
    const ghostGeom = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const ghostEdges = new THREE.EdgesGeometry(ghostGeom);
    const ghostLine = new THREE.LineSegments(
      ghostEdges,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 })
    );
    ghostLine.position.set(0, -0.75, 0);
    root.add(ghostLine);
  }

  // Roof Slot (y = +0.92)
  if (roofPiece) {
    const roofGroup = buildPieceMesh(roofPiece, 'roof');
    roofGroup.position.set(0, 0.92 + explode * 0.7, 0);
    root.add(roofGroup);
    runtime.nodes['house_roof'] = roofGroup;
  } else {
    // Wireframe placeholder slot for Roof
    const w = 2.25;
    const h = 1.35;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.lineTo(0, h / 2);
    shape.closePath();
    const ghostRoofGeom = new THREE.ExtrudeGeometry(shape, { depth: 2.15, bevelEnabled: false });
    ghostRoofGeom.center();
    const ghostRoofEdges = new THREE.EdgesGeometry(ghostRoofGeom);
    const ghostRoofLine = new THREE.LineSegments(
      ghostRoofEdges,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 })
    );
    ghostRoofLine.position.set(0, 0.92, 0);
    root.add(ghostRoofLine);
  }

  root.userData.sculptRuntime = runtime;
  return root;
}

// ============================================================================
// UNIFIED SOLID DISPATCHER & STUDIO LOOK-DEV HELPERS (img2threejs)
// ============================================================================

export function createSolidSculptModel(
  solidType: SolidType,
  options: ProceduralModelOptions = {}
): THREE.Group {
  switch (solidType) {
    case 'cube':
      return createCubeSculptModel(options);
    case 'cuboid':
      return createCuboidSculptModel(options);
    case 'triangular_prism':
      return createTriangularPrismSculptModel(options);
    case 'square_pyramid':
      return createSquarePyramidSculptModel(options);
    case 'cylinder':
      return createCylinderSculptModel(options);
    default:
      return createCubeSculptModel(options);
  }
}

export function createGeo3DLookDevLights(
  mode: 'neutral' | 'grazing' | 'studio' = 'studio'
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = 'Geo3D_img2threejs_LookDevLights';

  const hemi = new THREE.HemisphereLight(
    0xf8fafc,
    0x334155,
    mode === 'grazing' ? 0.45 : 0.95
  );
  lights.add(hemi);

  const key = new THREE.DirectionalLight(
    0xfffbeb,
    mode === 'grazing' ? 2.4 : 1.55
  );
  if (mode === 'grazing') {
    key.position.set(7.5, 2.2, 4.0);
  } else {
    key.position.set(5.0, 8.5, 6.5);
  }
  lights.add(key);

  const fill = new THREE.DirectionalLight(0xdbeafe, 0.65);
  fill.position.set(-5.5, 4.0, 4.5);
  lights.add(fill);

  const rim = new THREE.DirectionalLight(0xfef3c7, 0.75);
  rim.position.set(0.5, 5.0, -6.5);
  lights.add(rim);

  return lights;
}

export function configureGeo3DRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createGeo3DEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture | null {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  } catch {
    return null;
  }
}
