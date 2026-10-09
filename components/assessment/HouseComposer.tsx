'use client';

import React, { useState, useEffect } from 'react';
import { Box, Triangle, Circle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface HouseComposerProps {
  initialValue?: { basePiece?: string; roofPiece?: string };
  onChange: (value: { basePiece: string; roofPiece: string }) => void;
  readOnly?: boolean;
}

export function HouseComposer({ initialValue, onChange, readOnly = false }: HouseComposerProps) {
  const [basePiece, setBasePiece] = useState<string>(initialValue?.basePiece || '');
  const [roofPiece, setRoofPiece] = useState<string>(initialValue?.roofPiece || '');
  const [selectedPalettePiece, setSelectedPalettePiece] = useState<string | null>(null);

  const updatePieces = (newBase: string, newRoof: string) => {
    if (readOnly) return;
    setBasePiece(newBase);
    setRoofPiece(newRoof);
    onChange({ basePiece: newBase, roofPiece: newRoof });
  };

  const assignPieceToSlot = (slot: 'base' | 'roof', pieceId: string) => {
    if (readOnly) return;
    if (slot === 'base') {
      const nextRoof = roofPiece === pieceId ? '' : roofPiece;
      updatePieces(pieceId, nextRoof);
    } else {
      const nextBase = basePiece === pieceId ? '' : basePiece;
      updatePieces(nextBase, pieceId);
    }
    setSelectedPalettePiece(null);
  };

  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('text/plain', pieceId);
  };

  const handleDrop = (e: React.DragEvent, slot: 'base' | 'roof') => {
    if (readOnly) return;
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text/plain');
    if (pieceId) {
      assignPieceToSlot(slot, pieceId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetComposition = () => {
    if (readOnly) return;
    updatePieces('', '');
    setSelectedPalettePiece(null);
  };

  const pieces = [
    {
      id: 'cube',
      name: 'Cubo',
      icon: <Box className="w-8 h-8 text-blue-600" />,
      colorClass: 'bg-blue-50 border-blue-300 text-blue-700',
      description: '6 faces quadradas'
    },
    {
      id: 'triangular_prism',
      name: 'Prisma Triangular',
      icon: <Triangle className="w-8 h-8 text-amber-600" />,
      colorClass: 'bg-amber-50 border-amber-300 text-amber-700',
      description: 'Bases triangulares'
    },
    {
      id: 'sphere',
      name: 'Esfera',
      icon: <Circle className="w-8 h-8 text-rose-500" />,
      colorClass: 'bg-rose-50 border-rose-300 text-rose-700',
      description: 'Superfície curva contínua'
    }
  ];

  const getPieceData = (id: string) => pieces.find(p => p.id === id);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Target Composition & Model Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Reference Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Referência Desejada: Casa 3D
          </span>
          <div className="w-48 h-48 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-3">
            {/* Telhado Triângulo */}
            <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[40px] border-b-amber-500 mb-0.5 filter drop-shadow-xs" />
            {/* Parede Cubo */}
            <div className="w-24 h-24 bg-blue-500 rounded-sm border-2 border-blue-700 flex items-center justify-center shadow-xs">
              <span className="text-white text-xs font-bold">CORPO</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 font-medium">
            Telhado triangular sobre base cúbica quadrada
          </p>
        </div>

        {/* Assembly Slots (Drop Zones) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-between shadow-xs">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Área de Montagem da Casa
            </span>
            {(basePiece || roofPiece) && !readOnly && (
              <button
                onClick={resetComposition}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>

          <div className="w-full flex flex-col items-center gap-3 py-2">
            {/* Slot Telhado (Roof) */}
            <div
              onDrop={(e) => handleDrop(e, 'roof')}
              onDragOver={handleDragOver}
              onClick={() => {
                if (selectedPalettePiece) assignPieceToSlot('roof', selectedPalettePiece);
              }}
              className={`w-64 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition p-2 cursor-pointer ${
                roofPiece 
                  ? 'border-amber-400 bg-amber-50/80 shadow-xs' 
                  : selectedPalettePiece 
                  ? 'border-blue-400 bg-blue-50/50 animate-pulse' 
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
              role="button"
              tabIndex={0}
              aria-label="Encaixe do Telhado (Parte Superior)"
            >
              {roofPiece ? (
                <div className="flex items-center gap-2">
                  {getPieceData(roofPiece)?.icon}
                  <div>
                    <p className="font-bold text-sm text-slate-800">{getPieceData(roofPiece)?.name}</p>
                    <span className="text-[10px] text-amber-700 uppercase font-semibold">Telhado Encaixado</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-600">
                  {selectedPalettePiece ? 'Clique para colocar aqui no Telhado' : '1. Encaixe do Telhado (Topo)'}
                </span>
              )}
            </div>

            {/* Slot Base (Body) */}
            <div
              onDrop={(e) => handleDrop(e, 'base')}
              onDragOver={handleDragOver}
              onClick={() => {
                if (selectedPalettePiece) assignPieceToSlot('base', selectedPalettePiece);
              }}
              className={`w-64 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition p-2 cursor-pointer ${
                basePiece 
                  ? 'border-blue-500 bg-blue-50/80 shadow-xs' 
                  : selectedPalettePiece 
                  ? 'border-blue-400 bg-blue-50/50 animate-pulse' 
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
              role="button"
              tabIndex={0}
              aria-label="Encaixe da Base (Corpo da Casa)"
            >
              {basePiece ? (
                <div className="flex items-center gap-2">
                  {getPieceData(basePiece)?.icon}
                  <div>
                    <p className="font-bold text-sm text-slate-800">{getPieceData(basePiece)?.name}</p>
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Corpo Encaixado</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-600">
                  {selectedPalettePiece ? 'Clique para colocar aqui no Corpo' : '2. Encaixe do Corpo (Base)'}
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            {basePiece && roofPiece ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Estrutura completa!
              </span>
            ) : (
              <span>Arraste ou selecione as peças abaixo.</span>
            )}
          </div>
        </div>
      </div>

      {/* Palette of Shapes */}
      {!readOnly && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Peças Disponíveis (Clique para selecionar ou arraste)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pieces.map((piece) => {
              const isSelected = selectedPalettePiece === piece.id;
              const isUsedAsBase = basePiece === piece.id;
              const isUsedAsRoof = roofPiece === piece.id;

              return (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece.id)}
                  onClick={() => setSelectedPalettePiece(isSelected ? null : piece.id)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-md scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                    {piece.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-slate-800">{piece.name}</p>
                    <p className="text-[11px] text-slate-600">{piece.description}</p>
                  </div>

                  {/* Quick assign buttons for WCAG 2.2 AA alternative to dragging */}
                  <div className="flex items-center gap-1.5 mt-2 w-full pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        assignPieceToSlot('base', piece.id);
                      }}
                      className={`flex-1 text-[11px] font-bold py-1 px-2 rounded-lg transition ${
                        isUsedAsBase 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Pôr na Base
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        assignPieceToSlot('roof', piece.id);
                      }}
                      className={`flex-1 text-[11px] font-bold py-1 px-2 rounded-lg transition ${
                        isUsedAsRoof 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      Pôr no Telhado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
