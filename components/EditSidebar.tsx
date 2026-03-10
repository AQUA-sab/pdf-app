"use client";

import { useState } from "react";

import { DocumentItem, DocumentState } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface EditSidebarProps {
    documentState: DocumentState;
    setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
    onClose: () => void;
}

export function EditSidebar({ documentState, setDocumentState, onClose }: EditSidebarProps) {
    const handleAdd = () => {
        setDocumentState(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), heading: "", description: "", isMemoEnabled: false, textRows: 3 }]
        }));
    };

    const handleItemChange = (id: string, field: keyof DocumentItem, value: any) => {
        setDocumentState(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const handleRemoveItem = (id: string) => {
        setDocumentState(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    return (
        <div className="w-[360px] h-full flex flex-col bg-[#121214]/80 backdrop-blur-3xl border-r border-white/10 shadow-3xl text-white/90 overflow-hidden">
            {/* Header (Fixed) */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-[#121214]/50 z-10 relative">
                <h2 className="text-lg font-medium text-[#e8af48]">Document Editor</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* 1. Orientation Toggle (A4) */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">A4 Orientation</label>
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => setDocumentState(prev => ({ ...prev, orientation: "portrait" }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all duration-300 ${documentState.orientation === 'portrait' ? 'bg-[#303035] text-white shadow-md shadow-black/50' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <PortraitIcon className="w-4 h-4" /> 縦向き
                        </button>
                        <button
                            onClick={() => setDocumentState(prev => ({ ...prev, orientation: "landscape" }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all duration-300 ${documentState.orientation === 'landscape' ? 'bg-[#303035] text-white shadow-md shadow-black/50' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <LandscapeIcon className="w-4 h-4" /> 横向き
                        </button>
                    </div>
                </div>

                {/* 1.5. Margin (Padding) Control */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-white/50 uppercase tracking-wider">
                        <label>余白 (Margin: {documentState.padding}mm)</label>
                        <button
                            onClick={() => setDocumentState(prev => ({ ...prev, padding: 24 }))}
                            className="bg-white/5 hover:bg-white/10 text-white/40 hover:text-white px-2 py-0.5 rounded transition-colors text-[10px]"
                            title="24mmに戻す"
                        >
                            リセット
                        </button>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="60"
                        value={documentState.padding}
                        onChange={(e) => setDocumentState(prev => ({ ...prev, padding: Number(e.target.value) }))}
                        className="w-full accent-[#e8af48] cursor-pointer"
                    />
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* 2. Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70">タイトル (Title)</label>
                        <ContentEditableDiv
                            tagName="div"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8af48] focus:border-[#e8af48] transition-colors"
                            html={documentState.title}
                            onChange={(val) => setDocumentState(prev => ({ ...prev, title: val }))}
                            placeholder="議事録..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70">日付 (Date)</label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8af48] focus:border-[#e8af48] transition-colors [color-scheme:dark]"
                            value={documentState.date}
                            onChange={(e) => setDocumentState(prev => ({ ...prev, date: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-white/70">参加者 (Attendees)</label>
                            <button
                                onClick={() => setDocumentState(prev => ({ ...prev, isAttendeesVisible: !prev.isAttendeesVisible }))}
                                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${documentState.isAttendeesVisible ? "bg-[#e8af48]/20 text-[#e8af48]" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                            >
                                {documentState.isAttendeesVisible ? "表示中" : "非表示"}
                            </button>
                        </div>
                        <ContentEditableDiv
                            tagName="div"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8af48] focus:border-[#e8af48] transition-colors min-h-[60px]"
                            html={documentState.attendees}
                            onChange={(val) => setDocumentState(prev => ({ ...prev, attendees: val }))}
                            placeholder="山田太郎、佐藤花子..."
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full"></div>

            </div>
        </div>
    );
}

// Icons
function PortraitIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="9" y1="6" x2="15" y2="6" />
        </svg>
    );
}

function LandscapeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
            <line x1="6" y1="9" x2="18" y2="9" />
        </svg>
    );
}
