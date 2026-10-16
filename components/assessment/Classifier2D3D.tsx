'use client';

import React, { useState, useEffect } from 'react';
import { Circle, Square, Cylinder, Cone, CheckCircle, RotateCcw } from 'lucide-react';

interface Classifier2D3DProps {
  initialClassifications?: Record<string, '2D' | '3D'>;
  onChange: (classifications: Record<string, '2D' | '3D'>) => void;
  readOnly?: boolean;
}

export function Classifier2D3D({
  initialClassifications = {},
  onChange,
  readOnly = false
}: Classifier2D3DProps) {
  const [itemsMap, setItemsMap] = useState<Record<string, '2D' | '3D'>>(initialClassifications);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    setItemsMap(initialClassifications || {});
  }, [initialClassifications]);

  const items = [
    {
      id: 'circle',
      name: 'Círculo',
      icon: (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="20" r="16" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2.5" />
        </svg>
      )
    },
    {
      id: 'cylinder',
      name: 'Cilindro',
      icon: (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <ellipse cx="20" cy="10" rx="14" ry="5" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M6 10 v18 c0 3 6 5 14 5 s14 -2 14 -5 v-18" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
          <ellipse cx="20" cy="28" rx="14" ry="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'rectangle',
      name: 'Retângulo',
      icon: (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <rect x="4" y="10" width="32" height="20" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" rx="2" />
        </svg>
      )
    },
    {
      id: 'pyramid',
      name: 'Pirâmide',
      icon: (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <polygon points="20,4 6,32 34,32" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
          <line x1="20" y1="4" x2="22" y2="32" stroke="#9a3412" strokeWidth="1.5" />
        </svg>
      )
    }
  ];

  const assignGroup = (itemId: string, group: '2D' | '3D') => {
    if (readOnly) return;
    const nextMap = { ...itemsMap, [itemId]: group };
    setItemsMap(nextMap);
    onChange(nextMap);
    setSelectedItem(null);
  };

  const removeFromGroup = (itemId: string) => {
    if (readOnly) return;
    const nextMap = { ...itemsMap };
    delete nextMap[itemId];
    setItemsMap(nextMap);
    onChange(nextMap);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDrop = (e: React.DragEvent, group: '2D' | '3D') => {
    if (readOnly) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      assignGroup(itemId, group);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const unassignedItems = items.filter(i => !itemsMap[i.id]);
  const group2DItems = items.filter(i => itemsMap[i.id] === '2D');
  const group3DItems = items.filter(i => itemsMap[i.id] === '3D');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Two Classification Buckets: 2D and 3D */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bucket 2D (Formas Planas) */}
        <div
          onDrop={(e) => handleDrop(e, '2D')}
          onDragOver={handleDragOver}
          onClick={() => {
            if (selectedItem) assignGroup(selectedItem, '2D');
          }}
          className={`p-5 rounded-2xl border-2 transition flex flex-col min-h-[220px] ${
            selectedItem 
              ? 'border-blue-400 bg-blue-50/40 cursor-pointer animate-pulse' 
              : 'border-slate-300 bg-slate-50/70'
          }`}
          role="region"
          aria-label="Grupo 2D - Formas Planas (Sem Volume)"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                2D
              </span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Formas Planas (2D)</h4>
                <p className="text-[11px] text-slate-600">Largura e Altura (Sem Volume)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
              {group2DItems.length} figura(s)
            </span>
          </div>

          <div className="flex-1 flex flex-wrap content-start gap-2.5 pt-4">
            {group2DItems.length === 0 ? (
              <div className="w-full h-24 flex items-center justify-center text-xs text-slate-600 italic">
                {selectedItem ? 'Clique aqui para colocar a figura em 2D' : 'Arraste ou clique para adicionar figuras 2D aqui'}
              </div>
            ) : (
              group2DItems.map(item => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!readOnly) removeFromGroup(item.id);
                  }}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 hover:border-rose-300 cursor-pointer transition group"
                  title="Clique para remover"
                >
                  {item.icon}
                  <span className="font-bold text-xs text-slate-800">{item.name}</span>
                  {!readOnly && (
                    <span className="text-[10px] text-slate-400 group-hover:text-rose-500 font-bold ml-1">✕</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bucket 3D (Sólidos com Volume) */}
        <div
          onDrop={(e) => handleDrop(e, '3D')}
          onDragOver={handleDragOver}
          onClick={() => {
            if (selectedItem) assignGroup(selectedItem, '3D');
          }}
          className={`p-5 rounded-2xl border-2 transition flex flex-col min-h-[220px] ${
            selectedItem 
              ? 'border-emerald-400 bg-emerald-50/40 cursor-pointer animate-pulse' 
              : 'border-slate-300 bg-slate-50/70'
          }`}
          role="region"
          aria-label="Grupo 3D - Sólidos com Volume"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
                3D
              </span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Sólidos com Volume (3D)</h4>
                <p className="text-[11px] text-slate-600">Largura, Altura e Profundidade</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
              {group3DItems.length} figura(s)
            </span>
          </div>

          <div className="flex-1 flex flex-wrap content-start gap-2.5 pt-4">
            {group3DItems.length === 0 ? (
              <div className="w-full h-24 flex items-center justify-center text-xs text-slate-600 italic">
                {selectedItem ? 'Clique aqui para colocar a figura em 3D' : 'Arraste ou clique para adicionar figuras 3D aqui'}
              </div>
            ) : (
              group3DItems.map(item => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!readOnly) removeFromGroup(item.id);
                  }}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 hover:border-rose-300 cursor-pointer transition group"
                  title="Clique para remover"
                >
                  {item.icon}
                  <span className="font-bold text-xs text-slate-800">{item.name}</span>
                  {!readOnly && (
                    <span className="text-[10px] text-slate-400 group-hover:text-rose-500 font-bold ml-1">✕</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Available / Pending Items to Classify */}
      {!readOnly && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Figuras para Organizar ({unassignedItems.length} restantes)
            </span>
            {Object.keys(itemsMap).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setItemsMap({});
                  onChange({});
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Organização
              </button>
            )}
          </div>

          {unassignedItems.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Todas as 4 figuras foram organizadas nos grupos 2D e 3D!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {unassignedItems.map(item => {
                const isSelected = selectedItem === item.id;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => setSelectedItem(isSelected ? null : item.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md scale-105 ring-2 ring-blue-300'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-xs">
                      {item.icon}
                    </div>
                    <span className="font-bold text-xs text-slate-800">{item.name}</span>

                    {/* WCAG Accessible Buttons: Click to assign directly to 2D or 3D */}
                    <div className="flex items-center gap-1 w-full pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          assignGroup(item.id, '2D');
                        }}
                        className="flex-1 text-[11px] font-bold py-1 bg-white border border-slate-200 hover:bg-blue-600 hover:text-white rounded-md text-slate-700 transition"
                      >
                        2D
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          assignGroup(item.id, '3D');
                        }}
                        className="flex-1 text-[11px] font-bold py-1 bg-white border border-slate-200 hover:bg-emerald-600 hover:text-white rounded-md text-slate-700 transition"
                      >
                        3D
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
