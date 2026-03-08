"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { DocumentState } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface PreviewPaneProps {
    documentState: DocumentState;
    setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
}

// A4 page dimensions in mm (used for calculating page breaks)
const A4_WIDTH_PT = 210; // mm portrait width
const A4_HEIGHT_PT = 297; // mm portrait height

export function PreviewPane({ documentState, setDocumentState }: PreviewPaneProps) {
    const isPortrait = documentState.orientation === 'portrait';
    const paperRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);

    // Page height in mm (inner content area)
    const pageWidthMm = isPortrait ? A4_WIDTH_PT : A4_HEIGHT_PT;
    const pageHeightMm = isPortrait ? A4_HEIGHT_PT : A4_WIDTH_PT;
    const paddingMm = documentState.padding;
    const contentHeightMm = pageHeightMm - (paddingMm * 2);

    // Calculate page count based on actual content height
    const recalcPages = useCallback(() => {
        if (!paperRef.current) return;
        const paperEl = paperRef.current;
        // Get the scrollable content height vs the single-page content area
        const contentAreaHeight = contentHeightMm * 3.7795; // mm to px (approx at 96dpi)
        const actualHeight = paperEl.scrollHeight;
        const pages = Math.max(1, Math.ceil(actualHeight / contentAreaHeight));
        setPageCount(pages);
    }, [contentHeightMm]);

    useEffect(() => {
        recalcPages();
        // Observe content changes
        const observer = new MutationObserver(recalcPages);
        if (paperRef.current) {
            observer.observe(paperRef.current, { childList: true, subtree: true, characterData: true, attributes: true });
        }
        window.addEventListener("resize", recalcPages);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", recalcPages);
        };
    }, [recalcPages]);

    // Also recalc when documentState changes
    useEffect(() => {
        // Use a short delay so the DOM updates first
        const t = setTimeout(recalcPages, 50);
        return () => clearTimeout(t);
    }, [documentState, recalcPages]);

    return (
        <div className="w-full h-full flex flex-col items-center p-8 overflow-y-auto gap-8">
            {/* The continuous A4 Paper - content flows naturally, page markers overlay */}
            <div className="relative" style={{ width: isPortrait ? '210mm' : '297mm', maxWidth: '100%' }}>
                <div
                    ref={paperRef}
                    className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex flex-col"
                    style={{
                        width: '100%',
                        minHeight: `${pageHeightMm}mm`,
                        padding: `${paddingMm}mm`,
                        backgroundColor: '#ffffff',
                        color: '#000000',
                    }}
                >
                    {/* Paper Content Wrapper */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Header: Title and Date */}
                        <div className="flex flex-col border-b border-black/10 pb-6 mb-2">
                            <div className="flex items-start justify-between">
                                <ContentEditableDiv
                                    tagName="h1"
                                    className="text-3xl font-bold text-gray-900 tracking-tight whitespace-pre-wrap break-words flex-1 min-h-[40px]"
                                    html={documentState.title}
                                    onChange={(val) => setDocumentState(prev => ({ ...prev, title: val }))}
                                    placeholder="無題のドキュメント"
                                />
                                <div className="text-gray-500 font-medium ml-6 shrink-0 mt-2">
                                    <ContentEditableDiv
                                        tagName="div"
                                        className="text-right min-w-[120px]"
                                        html={documentState.date || "---- / -- / --"}
                                        onChange={(val) => setDocumentState(prev => ({ ...prev, date: val }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata: Attendees (First page only - always at top) */}
                        {documentState.isAttendeesVisible !== false && (
                            <div className="flex gap-4">
                                <span className="font-semibold text-gray-700 min-w-[80px]">参加者:</span>
                                <ContentEditableDiv
                                    tagName="div"
                                    className="text-gray-800 whitespace-pre-wrap flex-1 min-h-[1.5rem]"
                                    html={documentState.attendees}
                                    onChange={(val) => setDocumentState(prev => ({ ...prev, attendees: val }))}
                                    placeholder="参加者を記入..."
                                />
                            </div>
                        )}

                        {/* Main Content: Items */}
                        <div className="flex-1 mt-6 flex flex-col gap-6">
                            {documentState.items.map((item, index) => (
                                <div key={item.id} className="flex gap-4 items-baseline pb-2">
                                    {/* Number */}
                                    <div className="font-bold text-gray-400 w-6 shrink-0 text-xl text-right">
                                        {index + 1}.
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {/* Heading */}
                                        <ContentEditableDiv
                                            tagName="div"
                                            className="text-xl font-bold text-gray-900 leading-tight min-h-[28px]"
                                            html={item.heading}
                                            onChange={(val) => {
                                                setDocumentState(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i => i.id === item.id ? { ...i, heading: val } : i)
                                                }));
                                            }}
                                            placeholder="見出し"
                                        />

                                        {/* Description */}
                                        <ContentEditableDiv
                                            tagName="div"
                                            className="text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[1.5rem] mt-1 -ml-3"
                                            html={item.description || ""}
                                            onChange={(val) => {
                                                setDocumentState(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i => i.id === item.id ? { ...i, description: val } : i)
                                                }));
                                            }}
                                            placeholder="本文"
                                        />

                                        {/* Memo Field (Optional) */}
                                        {item.isMemoEnabled && (
                                            <div className="mt-2 bg-yellow-50/50 border border-yellow-200/60 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                                                <div className="text-xs font-semibold text-yellow-800/60 mb-1 uppercase tracking-wider">Memo</div>
                                                <div className="w-full h-full min-h-[40px]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {documentState.items.length === 0 && (
                                <div className="text-center text-gray-400 py-20 italic">
                                    項目がありません。左のメニューから追加してください。
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page break indicators & page numbers overlaid on the paper */}
                {pageCount > 1 && Array.from({ length: pageCount - 1 }, (_, i) => (
                    <div
                        key={`break-${i}`}
                        className="absolute left-0 right-0 pointer-events-none z-10"
                        style={{
                            top: `${pageHeightMm * (i + 1)}mm`,
                        }}
                    >
                        {/* Break line */}
                        <div className="border-t-2 border-dashed border-blue-400/40 mx-4" />
                        <div className="flex justify-center -mt-3">
                            <span className="bg-blue-500/10 text-blue-500 text-[10px] px-3 py-0.5 rounded-full backdrop-blur-sm border border-blue-400/20">
                                ページ {i + 1} / {pageCount}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Page number for the last page (bottom-right of paper) */}
                {pageCount > 1 && (
                    <div
                        className="absolute right-0 pointer-events-none z-10 pr-8 text-right"
                        style={{
                            top: `calc(${pageHeightMm * pageCount}mm - 20px)`,
                        }}
                    >
                        <span className="text-gray-400 text-xs">
                            {pageCount} / {pageCount}
                        </span>
                    </div>
                )}

                {/* First page number (bottom-right) */}
                {pageCount > 1 && (
                    <div
                        className="absolute right-0 pointer-events-none z-10 pr-8 text-right"
                        style={{
                            top: `calc(${pageHeightMm}mm - 20px)`,
                        }}
                    >
                        <span className="text-gray-400 text-xs">
                            1 / {pageCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
