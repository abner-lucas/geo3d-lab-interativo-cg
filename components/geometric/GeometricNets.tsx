'use client';

import React from 'react';

// Crisp, high-contrast SVG representations of valid and invalid nets
// Sem rótulos de orientação ("Frente/Trás") ou cores de gabarito que possam vazar respostas de outras questões

export function CubeLatinCrossNet({ className = 'w-48 h-48', highlighted = false }: { className?: string; highlighted?: boolean }) {
  // Latin cross (1-4-1) valid net: 6 squares in neutral blueprint palette
  const size = 36;
  const stroke = highlighted ? '#1d4ed8' : '#0284c7';
  const fillPrimary = '#dbeafe';
  const fillSecondary = '#bfdbfe';

  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação em Cruz de 6 quadrados">
      {/* Row 0: Top flap */}
      <rect x={40} y={4} width={size} height={size} fill={fillSecondary} stroke={stroke} strokeWidth={2} rx={2} />

      {/* Row 1: 4 central squares */}
      <rect x={4} y={40} width={size} height={size} fill={fillPrimary} stroke={stroke} strokeWidth={2} rx={2} />
      <rect x={40} y={40} width={size} height={size} fill={fillSecondary} stroke={stroke} strokeWidth={2} rx={2} />
      <rect x={76} y={40} width={size} height={size} fill={fillPrimary} stroke={stroke} strokeWidth={2} rx={2} />
      <rect x={112} y={40} width={size} height={size} fill={fillSecondary} stroke={stroke} strokeWidth={2} rx={2} />

      {/* Row 2: Bottom flap */}
      <rect x={40} y={76} width={size} height={size} fill={fillPrimary} stroke={stroke} strokeWidth={2} rx={2} />
    </svg>
  );
}

export function CubeInvalidNetLine({ className = 'w-48 h-48' }: { className?: string }) {
  // 5 in line + 1 side (Inválido: 5 faces em linha se sobrepõem)
  const size = 26;
  return (
    <svg viewBox="0 0 150 90" className={className} aria-label="Molde com 5 faces em linha">
      <rect x={6} y={30} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={34} y={30} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={62} y={30} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={90} y={30} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={118} y={30} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={62} y={4} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
    </svg>
  );
}

export function CubeInvalidNetOverlap({ className = 'w-48 h-48' }: { className?: string }) {
  // 2 flaps on the same side in parallel (Inválido: duas abas colidem)
  const size = 30;
  return (
    <svg viewBox="0 0 140 100" className={className} aria-label="Molde com duas abas do mesmo lado">
      <rect x={10} y={10} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={42} y={10} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={10} y={42} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={42} y={42} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={74} y={42} width={size} height={size} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={106} y={42} width={size} height={size} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
    </svg>
  );
}

export function TriangularPrismNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 3 retângulos e 2 triângulos
  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação com 3 retângulos e 2 triângulos">
      {/* Triângulo Topo */}
      <polygon points="80,6 60,34 100,34" fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} />
      {/* 3 Retângulos */}
      <rect x={16} y={36} width={40} height={50} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={60} y={36} width={40} height={50} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      <rect x={104} y={36} width={40} height={50} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      {/* Triângulo Base */}
      <polygon points="80,114 60,88 100,88" fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} />
    </svg>
  );
}

export function CylinderNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 1 retângulo e 2 círculos
  return (
    <svg viewBox="0 0 160 120" className={className} aria-label="Planificação com 1 retângulo e 2 círculos">
      {/* Círculo Topo */}
      <circle cx={80} cy={18} r={14} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} />
      {/* Retângulo Central */}
      <rect x={20} y={36} width={120} height={48} fill="#dbeafe" stroke="#0284c7" strokeWidth={2} rx={2} />
      {/* Círculo Base */}
      <circle cx={80} cy={102} r={14} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} />
    </svg>
  );
}

export function PyramidNet({ className = 'w-48 h-48' }: { className?: string }) {
  // 1 quadrado e 4 triângulos
  return (
    <svg viewBox="0 0 140 140" className={className} aria-label="Planificação com 1 quadrado central e 4 triângulos">
      {/* Centro Quadrado */}
      <rect x={46} y={46} width={48} height={48} fill="#bfdbfe" stroke="#0284c7" strokeWidth={2} rx={2} />
      {/* 4 Triângulos */}
      <polygon points="70,6 46,46 94,46" fill="#dbeafe" stroke="#0284c7" strokeWidth={2} />
      <polygon points="70,134 46,94 94,94" fill="#dbeafe" stroke="#0284c7" strokeWidth={2} />
      <polygon points="6,70 46,46 46,94" fill="#dbeafe" stroke="#0284c7" strokeWidth={2} />
      <polygon points="134,70 94,46 94,94" fill="#dbeafe" stroke="#0284c7" strokeWidth={2} />
    </svg>
  );
}
