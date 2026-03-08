"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { DocumentState, FloatingElement } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";
import { FloatingObject } from "@/components/FloatingObject";

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
    const [activeFloatingId, setActiveFloatingId] = useState<string | null>(null);

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

    const handleBackgroundClick = (e: React.MouseEvent) => {
        // Deselect floating element if clicking directly on the paper background or normal text
        if (!(e.target as HTMLElement).closest('.group.absolute')) {
            setActiveFloatingId(null);
        }
    };

    const handleUpdateFloatingElement = (id: string, updates: Partial<FloatingElement>) => {
        setDocumentState(prev => ({
            ...prev,
            floatingElements: prev.floatingElements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const handleRemoveFloatingElement = (id: string) => {
        setDocumentState(prev => ({
            ...prev,
            floatingElements: prev.floatingElements.filter(el => el.id !== id)
        }));
        if (activeFloatingId === id) setActiveFloatingId(null);
    };

    return (
        <div className="w-full h-full flex flex-col items-center p-8 overflow-y-auto gap-8 print:p-0 print:w-auto print:h-auto print:overflow-visible print:bg-white print:block">
            {/* Inject dynamic print page size */}
            <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4 ${documentState.orientation}; margin: 0; } }` }} />

            {/* The continuous A4 Paper - content flows naturally, page markers overlay */}
            <div className="relative print:block print:w-full print:max-w-none print:m-0 print:p-0" style={{ width: isPortrait ? '210mm' : '297mm', maxWidth: '100%' }}>
                <div
                    id="pdf-content"
                    ref={paperRef}
                    onClick={handleBackgroundClick}
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative flex flex-col print-paper bg-white print:!shadow-none print:!m-0"
                    style={{
                        width: isPortrait ? '210mm' : '297mm',
                        minHeight: `${pageHeightMm}mm`,
                        padding: `${paddingMm}mm`,
                        boxSizing: 'border-box',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                    }}
                >
                    {/* Paper Content Wrapper */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="flex flex-col pb-6 mb-2" style={{ borderBottom: '1px solid #0000001a' }}>
                            <div className="flex items-start justify-between">
                                <ContentEditableDiv
                                    tagName="h1"
                                    className="text-3xl font-bold tracking-tight whitespace-pre-wrap break-words flex-1 min-h-[40px]"
                                    style={{ color: '#111827' }} // replace text-gray-900
                                    html={documentState.title}
                                    onChange={(val) => setDocumentState(prev => ({ ...prev, title: val }))}
                                    placeholder="無題のドキュメント"
                                />
                                <div className="font-medium ml-6 shrink-0 mt-2" style={{ color: '#6b7280' }}>
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
                                <span className="font-semibold min-w-[80px]" style={{ color: '#374151' }}>参加者:</span>
                                <ContentEditableDiv
                                    tagName="div"
                                    className="whitespace-pre-wrap flex-1 min-h-[1.5rem]"
                                    style={{ color: '#1f2937' }} // replace text-gray-800
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
                                    <div className="font-bold w-8 shrink-0 text-xl text-right whitespace-nowrap flex justify-end" style={{ color: '#9ca3af' }}>
                                        <ContentEditableDiv
                                            tagName="span"
                                            className="min-w-[1.5rem] outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-400 transition-colors cursor-text"
                                            html={item.indexText !== undefined ? item.indexText : `${index + 1}.`}
                                            onChange={(val) => {
                                                setDocumentState(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i => i.id === item.id ? { ...i, indexText: val } : i)
                                                }));
                                            }}
                                        />
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {/* Heading */}
                                        <ContentEditableDiv
                                            tagName="div"
                                            className="text-xl font-bold leading-tight min-h-[28px]"
                                            style={{ color: '#111827' }} // text-gray-900
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
                                            className="leading-relaxed whitespace-pre-wrap min-h-[1.5rem] mt-1 -ml-3"
                                            style={{ color: '#1f2937' }} // text-gray-800
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
                                            <div className="mt-2 rounded-lg p-4 text-sm min-h-[80px]" style={{ backgroundColor: '#fefce880', border: '1px solid #fef08a99', color: '#374151' }}>
                                                <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#854d0e99' }}>Memo</div>
                                                <div className="w-full h-full min-h-[40px]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {documentState.items.length === 0 && (
                                <div className="text-center py-20 italic" style={{ color: '#9ca3af' }}>
                                    項目がありません。左のメニューから追加してください。
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Elements layer */}
                    {documentState.floatingElements?.map(el => (
                        <FloatingObject
                            key={el.id}
                            element={el}
                            isActive={activeFloatingId === el.id}
                            onActivate={setActiveFloatingId}
                            updateElement={handleUpdateFloatingElement}
                            removeElement={handleRemoveFloatingElement}
                        />
                    ))}
                </div>

                {/* Page break indicators & page numbers overlaid on the paper */}
                {pageCount > 1 && Array.from({ length: pageCount - 1 }, (_, i) => (
                    <div
                        key={`break-${i}`}
                        className="absolute left-0 right-0 pointer-events-none z-10 print-hide"
                        style={{
                            top: `${pageHeightMm * (i + 1)}mm`,
                        }}
                    >
                        {/* Break line */}
                        <div className="border-t-2 border-dashed mx-4" style={{ borderColor: '#60a5fa66' }} />
                        <div className="flex justify-center -mt-3">
                            <span className="text-[10px] px-3 py-0.5 rounded-full backdrop-blur-sm border" style={{ backgroundColor: '#3b82f61a', color: '#3b82f6', borderColor: '#60a5fa33' }}>
                                ページ {i + 1} / {pageCount}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Page number for the last page (bottom-right of paper) */}
                {pageCount > 1 && (
                    <div
                        className="absolute right-0 pointer-events-none z-10 pr-8 text-right print-hide"
                        style={{
                            top: `calc(${pageHeightMm * pageCount}mm - 20px)`,
                        }}
                    >
                        <span className="text-xs" style={{ color: '#9ca3af' }}>
                            {pageCount} / {pageCount}
                        </span>
                    </div>
                )}

                {/* First page number (bottom-right) */}
                {pageCount > 1 && (
                    <div
                        className="absolute right-0 pointer-events-none z-10 pr-8 text-right print-hide"
                        style={{
                            top: `calc(${pageHeightMm}mm - 20px)`,
                        }}
                    >
                        <span className="text-xs" style={{ color: '#9ca3af' }}>
                            1 / {pageCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
