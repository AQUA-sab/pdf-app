"use client";

import React from "react";

interface LayoutModeSelectorProps {
  currentMode: 'standard' | 'columns' | 'table';
  columnCount?: number;
  onModeChange: (mode: 'standard' | 'columns' | 'table') => void;
  onColumnCountChange?: (count: number) => void;
}

const LAYOUT_MODES = [
  {
    id: 'standard',
    label: '標準',
    description: '通常のレイアウト',
    icon: '📄',
  },
  {
    id: 'columns',
    label: '段組み',
    description: '複数段組みレイアウト',
    icon: '📰',
  },
  {
    id: 'table',
    label: 'テーブル',
    description: 'テーブルレイアウト',
    icon: '📊',
  },
];

export function LayoutModeSelector({
  currentMode,
  columnCount = 2,
  onModeChange,
  onColumnCountChange,
}: LayoutModeSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">レイアウトモード</label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                currentMode === mode.id
                  ? "bg-[#e8af48] text-black shadow-lg shadow-[#e8af48]/30"
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
              }`}
              title={mode.description}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="text-xs">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Column Count Selector (only for columns mode) */}
      {currentMode === 'columns' && onColumnCountChange && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">段数</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => onColumnCountChange(count)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  columnCount === count
                    ? "bg-[#e8af48] text-black shadow-lg shadow-[#e8af48]/30"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                }`}
              >
                {count}段
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="bg-blue/10 border border-blue/20 rounded-lg p-2 text-[11px] text-white/60 leading-relaxed">
        <p className="font-medium text-white/70 mb-1">💡 レイアウトモード</p>
        {currentMode === 'standard' && (
          <p>通常のレイアウトで、見出しと本文を順番に配置します。</p>
        )}
        {currentMode === 'columns' && (
          <p>テキストを複数の段に分割して配置します。新聞や雑誌のようなレイアウトに最適です。</p>
        )}
        {currentMode === 'table' && (
          <p>テーブル形式でデータを整理します。複雑なデータの表示に適しています。</p>
        )}
      </div>
    </div>
  );
}
