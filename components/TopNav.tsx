"use client";

import { useState, useEffect } from "react";

export interface TopNavProps {
    isEditorOpen: boolean;
    onToggleEditor: () => void;
    onPrint: () => void;
    onClear: () => void;
}

export function TopNav({ isEditorOpen, onToggleEditor, onPrint, onClear }: TopNavProps) {
    // 0: File, 1: Edit, 2: Insert
    const [activeIdx, setActiveIdx] = useState(isEditorOpen ? 1 : 0);
    const [mounted, setMounted] = useState(false);

    // UI State for Insert
    const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Sync active state if editor closes from outside
        if (!isEditorOpen && activeIdx === 1) {
            setActiveIdx(0);
        } else if (isEditorOpen && activeIdx !== 1) {
            setActiveIdx(1);
        }
    }, [isEditorOpen, activeIdx]);

    const handleAction = (idx: number, name: string) => {
        setActiveIdx(idx);

        switch (name) {
            case "File":
                // PDF保存ロジック（後ほど実装）
                console.log("Saving as PDF...");
                alert("PDF保存処理を実行します");
                if (isEditorOpen) onToggleEditor();
                setIsInsertMenuOpen(false);
                break;
            case "Edit":
                // 編集サイドバー表示ロジック
                onToggleEditor();
                setIsInsertMenuOpen(false);
                break;
            case "Insert":
                // 挿入ポップアップメニュー表示ロジック
                setIsInsertMenuOpen(!isInsertMenuOpen);
                if (isEditorOpen) onToggleEditor();
                break;
        }
    };

    const navItems = [
        { name: "File", icon: <FileIcon className="w-5 h-5" /> },
        { name: "Edit", icon: <EditIcon className="w-5 h-5" /> },
        { name: "Insert", icon: <InsertIcon className="w-5 h-5" /> },
    ];

    // 追加されたステータスのためのデバッグ出力（UIには表示されないが機能確認用）
    if (!mounted) return null;

    return (
        <div className="fixed top-4 left-6 z-50">
            {/* Embedded custom CSS animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes custom-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes bounce-scale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.25); }
                    100% { transform: scale(1); }
                }
                .animate-custom-spin {
                    animation: custom-spin 4.5s linear infinite;
                }
                .animate-bounce-scale {
                    animation: bounce-scale 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
                }
                .top-nav-grain {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
                }
            `}} />

            {/* Container with Glassmorphism */}
            <div
                className="flex items-center p-2 rounded-[24px] border shadow-2xl overflow-hidden relative"
                style={{
                    backgroundColor: "rgba(18, 18, 20, 0.6)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                {/* 1. Film grain noise overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-100 mix-blend-overlay top-nav-grain z-0" />

                {/* 2. Radial ambient glow (behind everything but inside container) */}
                <div
                    className="absolute inset-[10%] pointer-events-none opacity-30 rounded-full blur-3xl z-0 transition-colors duration-500"
                    style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
                    }}
                />

                {/* Navigation area */}
                <div className="relative flex items-center z-10">
                    {/* Golden Active Indicator Ring */}
                    <div
                        className="absolute top-0 bottom-0 w-[52px] pointer-events-none"
                        style={{
                            left: `${activeIdx * 52}px`, // each button is 52px wide (w-13)
                            transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)",
                            transform: `translateX(0px)`, // Just handling left property for movement
                        }}
                    >
                        {/* Layer 1: Glow - behind the ring blurred warm gold */}
                        <div className="absolute inset-[-4px] rounded-[22px] bg-[#e8af48] opacity-15 blur-[10px]" />

                        {/* Layer 2: Clip Container */}
                        <div className="absolute inset-0 rounded-[18px] overflow-hidden isolate">
                            {/* Layer 3: Rotating conic-gradient */}
                            <div
                                className="absolute w-[200%] h-[200%] top-1/2 left-1/2 animate-custom-spin"
                                style={{
                                    background: `conic-gradient(
                                        from 0deg, 
                                        #533517 0%, 
                                        #c49746 15%, 
                                        #feeaa5 28%, 
                                        #ffffff 30.5%, 
                                        #ffc0cb 32%, 
                                        #87ceeb 33.5%, 
                                        #c49746 45%, 
                                        #533517 50%, 
                                        #533517 50%, 
                                        #c49746 65%, 
                                        #feeaa5 78%, 
                                        #ffffff 80.5%, 
                                        #ffc0cb 82%, 
                                        #87ceeb 83.5%, 
                                        #c49746 95%, 
                                        #533517 100%
                                    )`
                                }}
                            />
                        </div>

                        {/* Layer 4: Inner Plate - leaving exactly 2px ring visible */}
                        <div
                            className="absolute inset-[2px] rounded-[16px] backdrop-blur-md transition-colors duration-500"
                            style={{
                                backgroundColor: "rgba(18, 18, 20, 0.95)",
                            }}
                        />
                    </div>

                    {/* Navigation Buttons */}
                    {navItems.map((item, idx) => (
                        <button
                            key={item.name}
                            onClick={() => handleAction(idx, item.name)}
                            className="relative z-10 w-[52px] h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors duration-300 gap-1"
                            style={{
                                color: activeIdx === idx ? "#e8af48" : "rgba(255,255,255,0.6)"
                            }}
                            title={item.name}
                        >
                            <span className={activeIdx === idx ? "opacity-100" : "opacity-90 hover:opacity-100 transition-opacity"}>
                                {item.icon}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Print Button */}
                <button
                    onClick={onPrint}
                    className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 group"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                    title="Print"
                >
                    <PrintIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300" />
                </button>

                {/* Trash / Clear Button */}
                <button
                    onClick={onClear}
                    className="relative z-10 w-10 h-10 flex flex-col items-center justify-center rounded-2xl transition-colors duration-300 group ml-1"
                    style={{ color: "rgba(255,255,255,0.7)" }}

                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 60, 60, 0.15)";
                        e.currentTarget.style.color = "#ff6b6b";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                    title="Clear Screen"
                >
                    <TrashIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300" />
                </button>

                {/* 挿入ポップアップメニュー (InsertがアクティブでisInsertMenuOpenがtrueの時のみ表示) */}
                {isInsertMenuOpen && activeIdx === 2 && (
                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-48 bg-[#1a1a1c]/95 border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left">
                            <ImageIcon className="w-4 h-4" /> 画像を挿入
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left">
                            <ShapeIcon className="w-4 h-4" /> 図形を挿入
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left">
                            <TextIcon className="w-4 h-4" /> テキストを挿入
                        </button>
                    </div>
                )}
            </div>

            {/* Extremely subtle ambient glow behind the entire nav to separate from background */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100px] blur-[60px] pointer-events-none -z-10 transition-opacity duration-700"
                style={{
                    background: "rgba(255,255,255,0.03)"
                }}
            />
        </div>
    );
}

// Minimal thin stroke SVG icons (strokeWidth 1.5)
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
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


