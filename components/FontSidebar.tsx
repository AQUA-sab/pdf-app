"use client";

import React from "react";

interface FontSidebarProps {
    onSelectFont: (fontFamily: string) => void;
    onClose: () => void;
}

const FONTS = [
    { label: "ゴシック体", family: "sans-serif", desc: "システム標準" },
    { label: "明朝体", family: "serif", desc: "システム標準" },
    { label: "メイリオ", family: "'Meiryo', 'メイリオ', sans-serif", desc: "Windows標準" },
];

export function FontSidebar({ onSelectFont, onClose }: FontSidebarProps) {
    return (
        <div className="w-[360px] h-full flex flex-col bg-[#121214]/80 backdrop-blur-3xl border-r border-white/10 shadow-3xl text-white/90 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#121214]/50 z-10 relative">
                <h2 className="text-lg font-medium text-[#e8af48]">フォント選択</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Font List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <p className="text-xs text-white/40 mb-2">フォントをクリックして選択中のテキストに適用します</p>
                {FONTS.map((font) => (
                    <button
                        key={font.label}
                        onClick={() => onSelectFont(font.family)}
                        className="w-full text-left p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/40 group-hover:text-white/60">{font.desc}</span>
                        </div>
                        <span
                            className="text-lg text-white/80 group-hover:text-[#e8af48]"
                            style={{ fontFamily: font.family }}
                        >
                            {font.label} あいうえお 漢字
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
