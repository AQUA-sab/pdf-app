"use client";

import React from "react";

interface MarginPresetPanelProps {
  currentMargin: number;
  onMarginChange: (margin: number) => void;
  onReset: () => void;
}

// 一般的なマージンプリセット
const MARGIN_PRESETS = [
  { label: "狭い", value: 12, description: "12mm" },
  { label: "標準", value: 24, description: "24mm" },
  { label: "広い", value: 36, description: "36mm" },
  { label: "特広", value: 48, description: "48mm" },
];

export function MarginPresetPanel({ currentMargin, onMarginChange, onReset }: MarginPresetPanelProps) {
  return (
    <div className="space-y-3">
      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {MARGIN_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onMarginChange(preset.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentMargin === preset.value
                ? "bg-[#e8af48] text-black shadow-lg shadow-[#e8af48]/30"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
            }`}
            title={preset.description}
          >
            <div className="font-semibold">{preset.label}</div>
            <div className="text-xs opacity-75">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Visual Preview */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="text-xs font-medium text-white/50 mb-2">プレビュー</div>
        <div className="relative bg-black/50 rounded border border-white/20 aspect-[3/4] flex items-center justify-center">
          {/* A4 Page representation */}
          <div className="w-full h-full relative bg-white/10">
            {/* Margin visualization */}
            <div
              className="absolute inset-0 border-2 border-dashed border-[#e8af48]/50"
              style={{
                margin: `${(currentMargin / 24) * 8}px`, // Scale for visualization
              }}
            >
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <span className="text-[10px] text-white/30">コンテンツ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/70">カスタム余白</label>
          <span className="text-sm font-semibold text-[#e8af48]">{currentMargin}mm</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          value={currentMargin}
          onChange={(e) => onMarginChange(Number(e.target.value))}
          className="w-full accent-[#e8af48] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>0mm</span>
          <span>30mm</span>
          <span>60mm</span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all duration-200"
      >
        デフォルトにリセット (24mm)
      </button>

      {/* Info Text */}
      <div className="bg-blue/10 border border-blue/20 rounded-lg p-2 text-[11px] text-white/60 leading-relaxed">
        <p className="font-medium text-white/70 mb-1">💡 ヒント</p>
        <p>余白はページの上下左右に適用されます。テキストが余白を超えると自動的に次ページに移動します。</p>
      </div>
    </div>
  );
}
