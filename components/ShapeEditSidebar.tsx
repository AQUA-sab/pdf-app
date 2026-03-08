"use client";

import React from "react";
import { FloatingElement } from "@/app/page";

interface ShapeEditSidebarProps {
    element: FloatingElement;
    onUpdate: (updates: Partial<FloatingElement>) => void;
    onClose: () => void;
}

const PRESET_COLORS = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
    "#6b7280", "#a855f7", "#14b8a6", "#f59e0b", "#dc2626",
];

export function ShapeEditSidebar({ element, onUpdate, onClose }: ShapeEditSidebarProps) {
    return (
        <div className="w-[360px] h-full flex flex-col bg-[#121214]/80 backdrop-blur-3xl border-r border-white/10 shadow-3xl text-white/90 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#121214]/50 z-10 relative">
                <h2 className="text-lg font-medium text-[#e8af48]">図形を編集</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Edit Controls */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Fill Color */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">塗りつぶし色</label>
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={`fill-${color}`}
                                onClick={() => onUpdate({ backgroundColor: color + '66' })}
                                className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform cursor-pointer ${element.backgroundColor?.startsWith(color) ? 'border-[#e8af48] ring-2 ring-[#e8af48]/30' : 'border-white/10'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-white/50">カスタム:</span>
                        <input
                            type="color"
                            value={element.backgroundColor?.replace(/[0-9a-f]{2}$/i, '') || '#3b82f6'}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value + '66' })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <button
                            onClick={() => onUpdate({ backgroundColor: 'transparent' })}
                            className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            なし
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Border Color */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">枠線の色</label>
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={`border-${color}`}
                                onClick={() => onUpdate({ borderColor: color })}
                                className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform cursor-pointer ${element.borderColor === color ? 'border-[#e8af48] ring-2 ring-[#e8af48]/30' : 'border-white/10'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-white/50">カスタム:</span>
                        <input
                            type="color"
                            value={element.borderColor || '#3b82f6'}
                            onChange={(e) => onUpdate({ borderColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Border Width */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">枠線の太さ</label>
                        <span className="text-xs text-white/70 font-mono">{element.borderWidth || 2}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={element.borderWidth || 2}
                        onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
                        className="w-full accent-[#e8af48] cursor-pointer"
                    />
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Border Radius (for rect shapes) */}
                {(element.shapeType === 'rect' || element.shapeType === 'roundedRect') && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">角の丸み</label>
                            <span className="text-xs text-white/70 font-mono">{element.borderRadius || 0}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={element.borderRadius || 0}
                            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
                            className="w-full accent-[#e8af48] cursor-pointer"
                        />
                    </div>
                )}

                {/* Opacity */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">不透明度</label>
                        <span className="text-xs text-white/70 font-mono">{Math.round((element.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={element.opacity ?? 1}
                        onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
                        className="w-full accent-[#e8af48] cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}
