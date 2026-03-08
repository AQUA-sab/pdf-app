"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// Excel-style color palette
// Row 1: Theme colors (dark)
// Rows 2-5: Tints (light to dark)
// Row 6: Standard bright colors
const THEME_COLORS = [
    // Column headers (base theme colors)
    ["#FFFFFF", "#000000", "#E7E6E6", "#44546A", "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5", "#70AD47"],
    // Tint 80%
    ["#F2F2F2", "#808080", "#D0CECE", "#D6DCE4", "#D9E2F3", "#FCE4D6", "#EDEDED", "#FFF2CC", "#DEEAF6", "#E2EFDA"],
    // Tint 60%
    ["#D9D9D9", "#595959", "#AEAAAA", "#ADB9CA", "#B4C6E7", "#F8CBAD", "#DBDBDB", "#FFE599", "#BDD7EE", "#C5E0B3"],
    // Tint 40%
    ["#BFBFBF", "#404040", "#767171", "#8496B0", "#8EAADB", "#F4B183", "#C9C9C9", "#FFD966", "#9CC3E5", "#A8D08D"],
    // Shade 25%
    ["#A6A6A6", "#262626", "#3B3838", "#333F50", "#2F5496", "#C55A11", "#7B7B7B", "#BF8F00", "#2E75B6", "#538135"],
    // Shade 50%
    ["#808080", "#0D0D0D", "#171616", "#222B35", "#1F3864", "#833C0B", "#525252", "#806000", "#1F4E79", "#375623"],
];

const STANDARD_COLORS = ["#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"];

interface FormattingToolbarProps {
    onOpenFontSidebar?: () => void;
}

export function FormattingToolbar({ onOpenFontSidebar }: FormattingToolbarProps) {
    const [mounted, setMounted] = useState(false);
    const savedRange = useRef<Range | null>(null);
    const [showTextPalette, setShowTextPalette] = useState(false);
    const [showHighlightPalette, setShowHighlightPalette] = useState(false);
    const paletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only save selection if it's inside #pdf-content (preview pane)
    useEffect(() => {
        const handleSelectionChange = () => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const node = range.startContainer;
                const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
                if (el && el.closest?.("#pdf-content")) {
                    savedRange.current = range.cloneRange();
                }
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, []);

    // Close palette when clicking elsewhere
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
                setShowTextPalette(false);
                setShowHighlightPalette(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const restoreAndExec = useCallback((cmd: string, value?: string) => {
        const sel = window.getSelection();
        if (sel && savedRange.current) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
        document.execCommand(cmd, false, value);
        if (sel && sel.rangeCount > 0) {
            savedRange.current = sel.getRangeAt(0).cloneRange();
        }
    }, []);

    if (!mounted) return null;

    const renderColorGrid = (onSelect: (color: string) => void) => (
        <div className="flex flex-col gap-0">
            {/* Theme color tints */}
            {THEME_COLORS.map((row, ri) => (
                <div key={ri} className="flex gap-0">
                    {row.map((color) => (
                        <button
                            key={`${ri}-${color}`}
                            className="w-5 h-5 hover:scale-150 hover:z-10 transition-transform cursor-pointer hover:ring-2 hover:ring-white/50 relative"
                            style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #d1d5db' : '1px solid transparent' }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onSelect(color)}
                            title={color}
                        />
                    ))}
                </div>
            ))}
            {/* Separator */}
            <div className="h-2" />
            {/* Standard colors */}
            <div className="flex gap-0">
                {STANDARD_COLORS.map((color) => (
                    <button
                        key={`std-${color}`}
                        className="w-5 h-5 hover:scale-150 hover:z-10 transition-transform cursor-pointer hover:ring-2 hover:ring-white/50 relative"
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelect(color)}
                        title={color}
                    />
                ))}
            </div>
            {/* Custom color */}
            <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-white/50">その他:</span>
                <input
                    type="color"
                    className="w-5 h-5 rounded cursor-pointer border-0"
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => onSelect(e.target.value)}
                />
            </div>
        </div>
    );

    return (
        <div
            ref={paletteRef}
            className="flex items-center bg-[#121214]/60 backdrop-blur-2xl border border-white/10 shadow-lg rounded-2xl px-1 py-1 z-50 relative"
            onMouseDown={(e) => {
                if (!(e.target as HTMLElement).closest('select') && !(e.target as HTMLElement).closest('input')) {
                    e.preventDefault();
                }
            }}
        >
            {/* Font Button */}
            <button
                onClick={() => onOpenFontSidebar?.()}
                className="h-7 px-2 flex items-center gap-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-xs"
                title="フォント選択"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3.97 3.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06L7.94 9 3.97 5.03a.75.75 0 0 1 0-1.06Zm6 0a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06L13.94 9l-3.97-3.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
                <span>フォント</span>
            </button>

            <div className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Font Size */}
            <select
                className="bg-transparent text-white/80 text-xs font-medium focus:outline-none appearance-none cursor-pointer px-1.5 py-1 hover:bg-white/5 rounded-lg transition-colors w-14 text-center"
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => { restoreAndExec('fontSize', e.target.value); e.target.value = ""; }}
                title="サイズ"
            >
                <option value="" className="bg-[#121214]">サイズ</option>
                {[1, 2, 3, 4, 5, 6, 7].map(size => (
                    <option key={size} value={size} className="bg-[#121214]">{size}</option>
                ))}
            </select>

            <div className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Style Buttons */}
            <button
                onClick={() => restoreAndExec('bold')}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="太字"
            >
                <strong className="font-bold font-serif text-base">B</strong>
            </button>
            <button
                onClick={() => restoreAndExec('italic')}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer italic font-serif text-base"
                title="斜体"
            >
                I
            </button>
            <button
                onClick={() => restoreAndExec('underline')}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer underline font-serif text-base"
                title="下線"
            >
                U
            </button>

            <div className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Text Color */}
            <div className="relative" title="文字色">
                <button
                    className="w-7 h-7 flex flex-col items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => { setShowTextPalette(!showTextPalette); setShowHighlightPalette(false); }}
                >
                    <span className="text-white/80 font-bold text-sm leading-tight">A</span>
                    <div className="w-4 h-0.5 bg-red-500 rounded-full -mt-0.5"></div>
                </button>
                {showTextPalette && (
                    <div className="absolute top-9 left-1/2 -translate-x-1/2 p-2.5 rounded-xl shadow-2xl z-[100]"
                        style={{ backgroundColor: 'rgba(30, 30, 35, 0.98)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
                        <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">文字色</div>
                        {renderColorGrid((color) => { restoreAndExec('foreColor', color); setShowTextPalette(false); })}
                    </div>
                )}
            </div>

            {/* Highlight Color */}
            <div className="relative" title="マーカー">
                <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => { setShowHighlightPalette(!showHighlightPalette); setShowTextPalette(false); }}
                >
                    <MarkerIcon className="w-3.5 h-3.5 text-white/80" />
                </button>
                {showHighlightPalette && (
                    <div className="absolute top-9 left-1/2 -translate-x-1/2 p-2.5 rounded-xl shadow-2xl z-[100]"
                        style={{ backgroundColor: 'rgba(30, 30, 35, 0.98)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
                        <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">マーカー色</div>
                        {renderColorGrid((color) => { restoreAndExec('hiliteColor', color); setShowHighlightPalette(false); })}
                    </div>
                )}
            </div>
        </div>
    );
}

function MarkerIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m9 11-6 6v3h9l3-3" />
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
    );
}
