"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { DocumentState, FloatingElement } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";
import { FloatingObject } from "@/components/FloatingObject";

interface PreviewPaneProps {
    documentState: DocumentState;
    setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
    onEditShape?: (id: string) => void;
}

// A4 page dimensions in px (approx 96dpi)
const PAGE_W_A4 = 794; // px
const PAGE_H_A4 = 1123; // px

// Gap between pages in px
const PAGE_GAP_PX = 40;

export function PreviewPane({ documentState, setDocumentState, onEditShape }: PreviewPaneProps) {
    const isPortrait = documentState.orientation === 'portrait';
    const contentRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);
    const [activeFloatingId, setActiveFloatingId] = useState<string | null>(null);

    const pageW = isPortrait ? PAGE_W_A4 : PAGE_H_A4;
    const pageH = isPortrait ? PAGE_H_A4 : PAGE_W_A4;
    // Padding converted from mm to px: roughly 3.7795 px per mm.
    const paddingPx = documentState.padding * 3.7795;

    // Recalculate page count
    const recalcPages = useCallback(() => {
        if (!contentRef.current) return;

        const blocks = Array.from(contentRef.current.querySelectorAll('.page-breakable')) as HTMLElement[];
        blocks.forEach(b => {
            b.style.removeProperty('--pagination-shift');
        });

        // Temporarily remove minHeight to accurately measure the raw content height
        const oldMinHeight = contentRef.current.style.minHeight;
        contentRef.current.style.minHeight = '0';

        const containerRect = contentRef.current.getBoundingClientRect();
        const measurements = blocks.map(block => {
            const rect = block.getBoundingClientRect();
            return {
                block,
                originalTop: rect.top - containerRect.top,
                height: rect.height
            };
        });

        let accumulatedShift = 0;
        let currentPageIndex = 0;

        const shifts = measurements.map(m => {
            let currentTop = m.originalTop + accumulatedShift;
            let finalTop = currentTop;

            let pageByTop = Math.floor(finalTop / (pageH + PAGE_GAP_PX));
            if (pageByTop > currentPageIndex) {
                currentPageIndex = pageByTop;
            }

            let printTop = currentPageIndex * (pageH + PAGE_GAP_PX) + paddingPx;
            if (finalTop < printTop) {
                finalTop = printTop;
            }

            let currentBottom = finalTop + m.height;
            let printBottom = currentPageIndex * (pageH + PAGE_GAP_PX) + pageH - paddingPx;

            if (currentBottom > printBottom + 2 && finalTop < printBottom) {
                currentPageIndex++;
                finalTop = currentPageIndex * (pageH + PAGE_GAP_PX) + paddingPx;
            }

            const shiftNeeded = finalTop - currentTop;
            if (shiftNeeded > 0) {
                accumulatedShift += shiftNeeded;
                return shiftNeeded;
            }
            return 0;
        });

        shifts.forEach((shift, idx) => {
            if (shift > 0) {
                measurements[idx].block.style.setProperty('--pagination-shift', `${shift}px`);
            }
        });

        let totalDisplayHeight = 0;
        if (blocks.length > 0) {
            const lastM = measurements[measurements.length - 1];
            totalDisplayHeight = (lastM.originalTop + accumulatedShift) + lastM.height;
        } else {
            totalDisplayHeight = contentRef.current.scrollHeight;
        }

        // Restore minHeight immediately after reading
        contentRef.current.style.minHeight = oldMinHeight;

        const calculatedPages = Math.ceil((totalDisplayHeight + paddingPx) / (pageH + PAGE_GAP_PX));
        setPageCount(Math.max(1, calculatedPages));
    }, [pageH, paddingPx]);

    useEffect(() => {
        recalcPages();
        const observer = new MutationObserver(recalcPages);
        if (contentRef.current) {
            observer.observe(contentRef.current, { childList: true, subtree: true, characterData: true, attributes: true });
        }
        window.addEventListener("resize", recalcPages);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", recalcPages);
        };
    }, [recalcPages]);

    useEffect(() => {
        const t = setTimeout(recalcPages, 50);
        return () => clearTimeout(t);
    }, [documentState, recalcPages]);

    const handleBackgroundClick = (e: React.MouseEvent) => {
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
        <div className="w-full flex-1 flex flex-col items-center p-8 print:p-0 print:w-auto print:h-auto print:overflow-visible print:bg-white print:block">
            <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4 ${documentState.orientation}; margin: ${documentState.padding}mm; } }` }} />

            {/* Main wrapper determining layout size & controlling zoom */}
            <div
                className="preview-wrapper relative print:block print:w-full print:max-w-none print:m-0 print:p-0 transition-transform duration-200"
                style={{
                    '--page-w': `${pageW}px`,
                    '--page-h': `${pageH}px`,
                    width: 'var(--page-w)',
                    transformOrigin: 'top left',
                    transform: 'scale(1)', // Prepared for future zoom state
                    minHeight: `calc(${pageCount} * var(--page-h) + ${pageCount > 1 ? (pageCount - 1) * PAGE_GAP_PX : 0}px)`,
                } as React.CSSProperties}
            >
                {/* 1. Page Backgrounds (Distinct paper sheets with shadows for screen only) */}
                <div className="absolute inset-0 pointer-events-none z-0 print-hide flex flex-col" style={{ gap: `${PAGE_GAP_PX}px` }}>
                    {Array.from({ length: Math.max(1, pageCount) }, (_, i) => (
                        <div
                            key={`page-bg-${i}`}
                            className="w-full bg-white relative"
                            style={{
                                height: 'var(--page-h)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.04)',
                                borderRadius: '2px', // Slight paper edge rounding
                                flexShrink: 0
                            }}
                        >
                            {/* Page Numbers inside each visible page background (screen only) */}
                            {pageCount > 1 && (
                                <div className="absolute bottom-6 right-8 text-right pointer-events-none">
                                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                                        {i + 1} / {pageCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Document Content (Continuous flow) */}
                <div
                    id="pdf-content"
                    ref={contentRef}
                    onClick={handleBackgroundClick}
                    className="w-full h-full flex flex-col print:block print:!m-0 outline-none print-paper relative"
                    style={{
                        minHeight: `min(calc(${pageCount} * var(--page-h) + ${pageCount > 1 ? (pageCount - 1) * PAGE_GAP_PX : 0}px), 100%)`, // Screen display fallback, but flows naturally
                        padding: `${paddingPx}px`,
                        boxSizing: 'border-box',
                        color: '#000000',
                    }}
                >
                    {/* Paper Content Wrapper */}
                    <div className="flex-1 flex flex-col print:block relative z-10 w-full text-black">
                        {/* Title and Date - avoid breaking after title */}
                        <div className="flex flex-col pb-6 mb-8 break-inside-avoid break-after-avoid page-breakable" style={{ borderBottom: '1px solid #0000001a' }}>
                            <div className="flex items-start justify-between">
                                <ContentEditableDiv
                                    tagName="h1"
                                    className="text-3xl font-bold tracking-tight whitespace-pre-wrap break-words flex-1 min-h-[40px]"
                                    style={{ color: '#111827' }}
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

                        {documentState.isAttendeesVisible !== false && (
                            <div className="flex gap-4 break-inside-avoid page-breakable mb-6">
                                <span className="font-semibold min-w-[80px]" style={{ color: '#374151' }}>参加者:</span>
                                <ContentEditableDiv
                                    tagName="div"
                                    className="whitespace-pre-wrap flex-1 min-h-[1.5rem]"
                                    style={{ color: '#1f2937' }}
                                    html={documentState.attendees}
                                    onChange={(val) => setDocumentState(prev => ({ ...prev, attendees: val }))}
                                    placeholder="参加者を記入..."
                                />
                            </div>
                        )}

                        <div className="flex-1 mt-6 flex flex-col print:block">
                            {documentState.items.map((item, index) => (
                                <div key={item.id} className="flex gap-4 items-baseline pb-2 mb-6 break-inside-avoid relative group page-breakable">
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
                                    <div className="flex-1 flex flex-col gap-2">
                                        <ContentEditableDiv
                                            tagName="div"
                                            className="text-xl font-bold leading-tight min-h-[28px]"
                                            style={{ color: '#111827' }}
                                            html={item.heading}
                                            onChange={(val) => {
                                                setDocumentState(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i => i.id === item.id ? { ...i, heading: val } : i)
                                                }));
                                            }}
                                            placeholder="見出し"
                                        />
                                        <ContentEditableDiv
                                            tagName="div"
                                            className="leading-relaxed whitespace-pre-wrap min-h-[1.5rem] mt-1 -ml-3"
                                            style={{ color: '#1f2937' }}
                                            html={item.description || ""}
                                            onChange={(val) => {
                                                setDocumentState(prev => ({
                                                    ...prev,
                                                    items: prev.items.map(i => i.id === item.id ? { ...i, description: val } : i)
                                                }));
                                            }}
                                            placeholder="本文"
                                        />
                                        {item.isMemoEnabled && (
                                            <div className="mt-2 rounded-lg p-4 text-sm min-h-[80px]" style={{ backgroundColor: '#fefce880', border: '1px solid #fef08a99', color: '#374151' }}>
                                                <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#854d0e99' }}>Memo</div>
                                                <div className="w-full h-full min-h-[40px]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

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
                            onEdit={onEditShape}
                        />
                    ))}
                </div>
            </div>
        </div >
    );
}
