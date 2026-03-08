"use client";

import React from "react";
import { FloatingElement } from "@/app/page";

interface ShapeSidebarProps {
    onInsertShape: (shapeType: FloatingElement['shapeType']) => void;
    onClose: () => void;
}

const SHAPES: { type: FloatingElement['shapeType']; label: string; render: React.ReactNode }[] = [
    {
        type: 'rect', label: '四角形',
        render: <rect x="2" y="4" width="20" height="16" rx="0" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'roundedRect', label: '角丸四角形',
        render: <rect x="2" y="4" width="20" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'circle', label: '円',
        render: <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'ellipse', label: '楕円',
        render: <ellipse cx="12" cy="12" rx="11" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'triangle', label: '三角形',
        render: <polygon points="12,2 22,22 2,22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'diamond', label: 'ひし形',
        render: <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'arrow', label: '矢印',
        render: <>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="14,7 19,12 14,17" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
    },
    {
        type: 'star', label: '星',
        render: <polygon points="12,2 14.5,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9.5,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    },
    {
        type: 'callout', label: '吹き出し',
        render: <>
            <rect x="2" y="2" width="20" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="6,16 10,16 8,22" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
    },
];

export function ShapeSidebar({ onInsertShape, onClose }: ShapeSidebarProps) {
    return (
        <div className="w-[360px] h-full flex flex-col bg-[#121214]/80 backdrop-blur-3xl border-r border-white/10 shadow-3xl text-white/90 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#121214]/50 z-10 relative">
                <h2 className="text-lg font-medium text-[#e8af48]">図形を挿入</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Shape Grid */}
            <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <p className="text-xs text-white/40 mb-4">図形をクリックしてプレビューに挿入します</p>
                <div className="grid grid-cols-3 gap-3">
                    {SHAPES.map(shape => (
                        <button
                            key={shape.type}
                            onClick={() => onInsertShape(shape.type)}
                            className="aspect-square flex flex-col items-center justify-center gap-2 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/60 group-hover:text-[#e8af48] transition-colors">
                                {shape.render}
                            </svg>
                            <span className="text-[10px] text-white/50 group-hover:text-white/80">{shape.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
