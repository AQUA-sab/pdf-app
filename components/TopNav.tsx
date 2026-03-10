"use client";

import { useState, useEffect } from "react";

export interface TopNavProps {
    isEditorOpen: boolean;
    onToggleEditor: () => void;
    onPrint: () => void;
    onClear: () => void;
    onSavePdf: () => void;
    onLoadPdf: () => void;
    onInsertItem: () => void;
    onInsertImage: () => void;
    onInsertShape: () => void;
    onInsertText: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export function TopNav({ isEditorOpen, onToggleEditor, onPrint, onClear, onSavePdf, onLoadPdf, onInsertItem, onInsertImage, onInsertShape, onInsertText, isDarkMode, onToggleDarkMode }: TopNavProps) {
    // 0: DarkMode, 1: Save, 2: Load, 3: Edit, 4: Insert, 5: Print, 6: Clear
    const [activeIdx, setActiveIdx] = useState(isEditorOpen ? 3 : 1);
    const [mounted, setMounted] = useState(false);
    const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isEditorOpen && activeIdx === 3) {
            setActiveIdx(1);
        } else if (isEditorOpen && activeIdx !== 3) {
            setActiveIdx(3);
        }
    }, [isEditorOpen, activeIdx]);

    const handleAction = (idx: number, name: string) => {
        setActiveIdx(idx);
        switch (name) {
            case "DarkMode":
                onToggleDarkMode();
                break;
            case "Save":
                onSavePdf();
                if (isEditorOpen) onToggleEditor();
                setIsInsertMenuOpen(false);
                break;
            case "Load":
                onLoadPdf();
                if (isEditorOpen) onToggleEditor();
                setIsInsertMenuOpen(false);
                break;
            case "Edit":
                onToggleEditor();
                setIsInsertMenuOpen(false);
                break;
            case "Insert":
                if (activeIdx === 4) {
                    setIsInsertMenuOpen(!isInsertMenuOpen);
                } else {
                    setIsInsertMenuOpen(true);
                }
                if (isEditorOpen) onToggleEditor();
                break;
            case "Print":
                onPrint();
                setIsInsertMenuOpen(false);
                break;
            case "Clear":
                onClear();
                setIsInsertMenuOpen(false);
                break;
        }
    };

    const navItems = [
        { name: "DarkMode", label: isDarkMode ? "ライト" : "ダーク", icon: isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" /> },
        { name: "Save", label: "保存", icon: <SaveIcon className="w-5 h-5" /> },
        { name: "Load", label: "読込", icon: <LoadIcon className="w-5 h-5" /> },
        { name: "Edit", label: "編集", icon: <EditIcon className="w-5 h-5" /> },
        { name: "Insert", label: "追加", icon: <InsertIcon className="w-5 h-5" /> },
        { name: "Print", label: "印刷", icon: <PrintIcon className="w-5 h-5" /> },
        { name: "Clear", label: "クリア", icon: <TrashIcon className="w-5 h-5" /> },
    ];

    if (!mounted) return null;

    return (
        <div className="fixed top-3 left-0 z-50">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes custom-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-custom-spin {
                    animation: custom-spin 4.5s linear infinite;
                }
                .top-nav-grain {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
                }
            `}} />

            <div
                className="flex items-center p-1.5 rounded-[24px] border shadow-2xl relative"
                style={{
                    width: "360px",
                    backgroundColor: "rgba(18, 18, 20, 0.6)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                <div className="absolute inset-0 pointer-events-none opacity-100 mix-blend-overlay top-nav-grain z-0 rounded-[24px] overflow-hidden" />
                <div
                    className="absolute inset-[10%] pointer-events-none opacity-30 rounded-full blur-3xl z-0"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
                />

                <div className="relative flex items-center z-10 w-full justify-between">
                    {/* Golden Ring Indicator */}
                    <div
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{
                            width: 'calc(100% / 7)',
                            left: `calc(${activeIdx} * 100% / 7)`,
                            transition: "left 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)",
                        }}
                    >
                        <div className="absolute inset-[-4px] rounded-[18px] bg-[#e8af48] opacity-15 blur-[10px]" />
                        <div className="absolute inset-0 rounded-[16px] overflow-hidden isolate">
                            <div
                                className="absolute w-[200%] h-[200%] top-1/2 left-1/2 animate-custom-spin"
                                style={{
                                    background: `conic-gradient(
                                        from 0deg,
                                        #533517 0%, #c49746 15%, #feeaa5 28%, #ffffff 30.5%,
                                        #ffc0cb 32%, #87ceeb 33.5%, #c49746 45%, #533517 50%,
                                        #533517 50%, #c49746 65%, #feeaa5 78%, #ffffff 80.5%,
                                        #ffc0cb 82%, #87ceeb 83.5%, #c49746 95%, #533517 100%
                                    )`
                                }}
                            />
                        </div>
                        <div
                            className="absolute inset-[2px] rounded-[14px] backdrop-blur-md"
                            style={{ backgroundColor: "rgba(18, 18, 20, 0.95)" }}
                        />
                    </div>

                    {/* Buttons */}
                    {navItems.map((item, idx) => (
                        <button
                            key={item.name}
                            onClick={() => handleAction(idx, item.name)}
                            className="relative z-10 flex-1 h-[44px] flex flex-col items-center justify-center rounded-2xl transition-colors duration-300 gap-0.5"
                            style={{
                                color: activeIdx === idx ? "#e8af48" : "rgba(255,255,255,0.6)"
                            }}
                            title={item.label}
                        >
                            <span className={`${activeIdx === idx ? "opacity-100" : "opacity-90 hover:opacity-100"} transition-opacity`}>
                                {item.icon}
                            </span>
                            <span className="text-[8px] font-medium leading-none">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Insert Popup Menu */}
                {isInsertMenuOpen && activeIdx === 4 && (
                    <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[220px] rounded-2xl p-2 shadow-2xl z-50"
                        style={{ backgroundColor: 'rgba(30, 30, 35, 0.98)', border: '1px solid rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(20px)' }}>
                        <button onClick={() => { onInsertItem(); setIsInsertMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all text-left font-semibold cursor-pointer" style={{ color: '#ffffff' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <ListIcon className="w-5 h-5 text-purple-400" /> 項目を挿入
                        </button>
                        <button onClick={() => { onInsertImage(); setIsInsertMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all text-left font-semibold cursor-pointer" style={{ color: '#ffffff' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <ImageIcon className="w-5 h-5 text-blue-400" /> 画像を挿入
                        </button>
                        <button onClick={() => { onInsertShape(); setIsInsertMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all text-left font-semibold cursor-pointer" style={{ color: '#ffffff' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <ShapeIcon className="w-5 h-5 text-emerald-400" /> 図形を挿入
                        </button>
                        <button onClick={() => { onInsertText(); setIsInsertMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all text-left font-semibold cursor-pointer" style={{ color: '#ffffff' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <TextIcon className="w-5 h-5 text-amber-400" /> テキストを挿入
                        </button>
                    </div>
                )}
            </div>

            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100px] blur-[60px] pointer-events-none -z-10"
                style={{ background: "rgba(255,255,255,0.03)" }}
            />
        </div>
    );
}

// SVG Icons
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    );
}

function LoadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function InsertIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function PrintIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
        </svg>
    );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

function ShapeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        </svg>
    );
}

function TextIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}
