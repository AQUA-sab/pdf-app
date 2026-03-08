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

                {/* 3. Items List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">項目 (Items)</label>
                        <button
                            onClick={handleAdd}
                            className="flex items-center justify-center bg-[#e8af48]/10 hover:bg-[#e8af48]/20 text-[#e8af48] border border-[#e8af48]/20 rounded-md p-1 transition-colors"
                            title="Add item"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {documentState.items.map((item, index) => (
                            <div key={item.id} className="group relative flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                {/* Index Number (Aligned with heading input which is py-2 (8px top/bottom) + text-sm (20px line height) = ~36px height. Flex start with mt-[6px] matches center of input roughly) */}
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-xs font-bold text-white/50 mt-[6px]">
                                    {index + 1}
                                </div>

                                {/* Item Content Inputs */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <ContentEditableDiv
                                                tagName="div"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#e8af48] focus:border-[#e8af48] transition-colors min-h-[38px]"
                                                html={item.heading}
                                                onChange={(val) => handleItemChange(item.id, "heading", val)}
                                                placeholder="見出し..."
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="flex-shrink-0 w-8 h-[38px] bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors border border-red-500/20"
                                            title="この項目を削除"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <ContentEditableDiv
                                        tagName="div"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8af48] focus:border-[#e8af48] transition-colors min-h-[80px]"
                                        html={item.description || ""}
                                        onChange={(val) => handleItemChange(item.id, "description", val)}
                                        placeholder="本文（詳細内容）..."
                                    />
                                </div>
                            </div>
                        ))}
                        {documentState.items.length === 0 && (
                            <div className="text-center text-xs text-white/30 py-4 border border-dashed border-white/10 rounded-lg">
                                項目がありません。右上の＋ボタンから追加してください。
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Icons
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

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
