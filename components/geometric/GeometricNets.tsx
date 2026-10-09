'use client';

import React from 'react';

// Crisp, high-contrast SVG representations of valid and invalid nets

export function CubeLatinCrossNet({ className = 'w-48 h-48', highlighted = false }: { className?: string; highlighted?: boolean }) {
  // Latin cross (1-4-1) valid net: 6 squares
  // Grid 4x3:
  // row 0: [ , top, , ]
  // row 1: [ left, center, right, far-right ]
  // row 2: [ , bottom, , ]
  const size = 36;
  const stroke = highlighted ? '#2563eb' : '#334155';
  const fill = highlighted ? '#dbeafe' : '#f1f5f9';

  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação em Cruz Latina de 6 quadrados do Cubo">
      {/* Row 0: Top face */}
      <rect x={40} y={4} width={size} height={size} fill="#fef08a" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={58} y={26} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#854d0e">Topo</text>

      {/* Row 1: Left, Center, Right, Far-right */}
      <rect x={4} y={40} width={size} height={size} fill="#bbf7d0" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={22} y={62} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#166534">Esq</text>

      <rect x={40} y={40} width={size} height={size} fill="#bfdbfe" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={58} y={62} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#1e40af">Frente</text>

      <rect x={76} y={40} width={size} height={size} fill="#fed7aa" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={94} y={62} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#9a3412">Dir</text>

      <rect x={112} y={40} width={size} height={size} fill="#fecaca" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={130} y={62} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#991b1b">Trás</text>

      {/* Row 2: Bottom face */}
      <rect x={40} y={76} width={size} height={size} fill="#e9d5ff" stroke={stroke} strokeWidth={2} rx={2} />
      <text x={58} y={98} fontSize={10} fontWeight="bold" textAnchor="middle" fill="#6b21a8">Base</text>
    </svg>
  );
}

export function CubeInvalidNetLine({ className = 'w-48 h-48' }: { className?: string }) {
  // 5 in line + 1 side (Inválido: 5 faces em linha se sobrepõem)
  const size = 26;
  return (
    <svg viewBox="0 0 150 90" className={className} aria-label="Molde Inválido com 5 faces em linha">
      <rect x={6} y={30} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={34} y={30} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={62} y={30} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={90} y={30} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={118} y={30} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={62} y={4} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <line x1={20} y1={72} x2={130} y2={72} stroke="#dc2626" strokeWidth={2} strokeDasharray="3 3" />
      <text x={75} y={84} fontSize={9} fill="#b91c1c" textAnchor="middle" fontWeight="bold">5 faces em linha (Inválido)</text>
    </svg>
  );
}

export function CubeInvalidNetOverlap({ className = 'w-48 h-48' }: { className?: string }) {
  // 2 flaps on the same side in parallel (Inválido: duas abas colidem)
  const size = 30;
  return (
    <svg viewBox="0 0 140 100" className={className} aria-label="Molde Inválido com abas colidentes">
      <rect x={10} y={10} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={42} y={10} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={10} y={42} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={42} y={42} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={74} y={42} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <rect x={106} y={42} width={size} height={size} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} rx={2} />
      <text x={70} y={92} fontSize={9} fill="#b91c1c" textAnchor="middle" fontWeight="bold">Faces colidem (Inválido)</text>
    </svg>
  );
}

export function TriangularPrismNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 3 retângulos e 2 triângulos
  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação de Prisma Triangular com 3 retângulos e 2 triângulos">
      {/* Triângulo Topo */}
      <polygon points="80,6 60,34 100,34" fill="#fde047" stroke="#0284c7" strokeWidth={2} />
      {/* 3 Retângulos */}
      <rect x={16} y={36} width={40} height={50} fill="#bae6fd" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={60} y={36} width={40} height={50} fill="#7dd3fc" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={104} y={36} width={40} height={50} fill="#38bdf8" stroke="#0284c7" strokeWidth={2} rx={2} />
      {/* Triângulo Base */}
      <polygon points="80,114 60,88 100,88" fill="#a7f3d0" stroke="#0284c7" strokeWidth={2} />
    </svg>
  );
}

export function CylinderNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 1 retângulo e 2 círculos
  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação de Cilindro com 1 retângulo e 2 círculos">
      {/* Círculo Topo */}
      <circle cx={80} cy={18} r={14} fill="#93c5fd" stroke="#2563eb" strokeWidth={2} />
      {/* Retângulo Central */}
      <rect x={20} y={36} width={120} height={48} fill="#cffafe" stroke="#0891b2" strokeWidth={2} rx={2} />
      {/* Círculo Base */}
      <circle cx={80} cy={102} r={14} fill="#c084fc" stroke="#9333ea" strokeWidth={2} />
    </svg>
  );
}

export function PyramidNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 1 quadrado e 4 triângulos
  return (
    <svg viewBox="0 0 140 140" className={className} aria-label="Planificação de Pirâmide Quadrada">
      {/* Centro Quadrado */}
      <rect x={46} y={46} width={48} height={48} fill="#ddd6fe" stroke="#7c3aed" strokeWidth={2} rx={2} />
      {/* 4 Triângulos */}
      <polygon points="70,6 46,46 94,46" fill="#fbcfe8" stroke="#db2777" strokeWidth={2} />
      <polygon points="70,134 46,94 94,94" fill="#fed7aa" stroke="#ea580c" strokeWidth={2} />
      <polygon points="6,70 46,46 46,94" fill="#a7f3d0" stroke="#059669" strokeWidth={2} />
      <polygon points="134,70 94,46 94,94" fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} />
    </svg>
  );
}
