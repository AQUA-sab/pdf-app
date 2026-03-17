"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { DocumentState, FloatingElement } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";
import { FloatingObject } from "@/components/FloatingObject";
import { findSplitIndexJapanese } from "@/lib/textSplitter";

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

/**
 * 指定エレメントのテキストが availableHeight 内に収まる分割点をバイナリサーチで特定
 * 日本語テキストに対応した版
 * @returns 分割点の文字インデックス。分割不要ならば -1
 */
function findSplitIndex(el: HTMLElement, availableHeight: number): number {
    // 日本語対応版を使用
    return findSplitIndexJapanese(el, availableHeight);
}

export function PreviewPane({ documentState, setDocumentState, onEditShape }: PreviewPaneProps) {
    const isPortrait = documentState.orientation === 'portrait';
    const contentRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(1);
    const [activeFloatingId, setActiveFloatingId] = useState<string | null>(null);

    const pageW = isPortrait ? PAGE_W_A4 : PAGE_H_A4;
    const pageH = isPortrait ? PAGE_H_A4 : PAGE_W_A4;
    // Padding converted from mm to px: roughly 3.7795 px per mm.
    const paddingPx = documentState.padding * 3.7795;

    // floatingElementsの最新値を常にrefで保持（recalcPages内から参照するため）
    const floatingElementsRef = useRef(documentState.floatingElements);
    useEffect(() => {
        floatingElementsRef.current = documentState.floatingElements;
    });

    // Recalculate page count (テキストブロックの折り返し計算 + ページ数確定)
    const recalcPages = useCallback(() => {
        if (!contentRef.current) return;

        // --- テキストブロックのページ送り計算 ---
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

            // 各ページの余白内の開始位置（上部余白を考慮）
            let printTop = currentPageIndex * (pageH + PAGE_GAP_PX) + paddingPx;
            if (finalTop < printTop) {
                finalTop = printTop;
            }

            let currentBottom = finalTop + m.height;
            // 各ページの余白内の終了位置（下部余白を考慮）
            let printBottom = currentPageIndex * (pageH + PAGE_GAP_PX) + pageH - paddingPx;

            // 要素が下部余白を超える場合、次ページへ移動
            // 余白設定を維持したまま、次ページの上部余白直後に配置
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
            // ブロックがない場合は上下余白分だけ（空ドキュメントは1ページ）
            totalDisplayHeight = paddingPx * 2;
        }

        // Restore minHeight immediately after reading
        contentRef.current.style.minHeight = oldMinHeight;

        // フローティング要素の最大下端もページ数計算に考慮（refから参照）
        let floatingMaxBottom = 0;
        floatingElementsRef.current?.forEach(el => {
            const bottom = el.y + el.height;
            if (bottom > floatingMaxBottom) floatingMaxBottom = bottom;
        });

        const effectiveHeight = Math.max(totalDisplayHeight, floatingMaxBottom);
        const calculatedPages = Math.ceil((effectiveHeight + paddingPx) / (pageH + PAGE_GAP_PX));
        setPageCount(Math.max(1, calculatedPages));
    }, [pageH, paddingPx]);

    // フローティング要素が余白をはみ出したら次ページへ自動移動（recalcPagesとは独立したEffect）
    useEffect(() => {
        setDocumentState(prev => {
            if (!prev.floatingElements || prev.floatingElements.length === 0) return prev;

            let changed = false;
            const updated = prev.floatingElements.map(el => {
                // 要素が所属するページを計算
                const pageIndex = Math.floor(el.y / (pageH + PAGE_GAP_PX));
                // そのページの余白内の下端（ピクセル、絶対座標）
                const pageBottom = pageIndex * (pageH + PAGE_GAP_PX) + pageH - paddingPx;
                // 要素の絶対下端
                const elBottom = el.y + el.height;

                if (elBottom > pageBottom + 2) {
                    // 次ページの余白先頭に移動（余白設定を維持）
                    const newY = (pageIndex + 1) * (pageH + PAGE_GAP_PX) + paddingPx;
                    changed = true;
                    return { ...el, y: newY };
                }
                return el;
            });

            if (!changed) return prev;
            return { ...prev, floatingElements: updated };
        });
    }, [documentState.floatingElements, pageH, paddingPx, setDocumentState]);

    // itemsの最新値をrefで保持（分割ロジック内でのstate参照用）
    const itemsRef = useRef(documentState.items);
    useEffect(() => {
        itemsRef.current = documentState.items;
    });

    // 分割計算中フラグ（MutationObserverの再発火を防止する）
    const isSplittingRef = useRef(false);

    // 本文が余白を超えたら超えた文字のみ次ページへ分割する関数
    // 改善：複数ページにまたがる場合の処理を強化
    const recalcDescriptionSplits = useCallback(() => {
        if (!contentRef.current) return;
        isSplittingRef.current = true;
        const containerRect = contentRef.current.getBoundingClientRect();

        setDocumentState(prev => {
            if (!prev.items.length) { isSplittingRef.current = false; return prev; }
            let changed = false;

            const newItems = prev.items.map(item => {
                const descEl = contentRef.current?.querySelector(
                    `[data-desc-id="${item.id}"]`
                ) as HTMLElement | null;
                if (!descEl) return item;

                const rect = descEl.getBoundingClientRect();
                const visualTop = rect.top - containerRect.top;
                const visualBottom = rect.bottom - containerRect.top;
                const pageIdx = Math.max(0, Math.floor(visualTop / (pageH + PAGE_GAP_PX)));
                // ページの余白内の下端を計算（下部余白を考慮）
                const pagePrintBottom = pageIdx * (pageH + PAGE_GAP_PX) + pageH - paddingPx;

                const allText = [item.description, ...(item.descriptionContinuations || [])].join('');

                if (visualBottom <= pagePrintBottom + 2) {
                    // 収まっている → continuationsをクリア（テキストを削った場合）
                    if ((item.descriptionContinuations?.length ?? 0) > 0) {
                        changed = true;
                        return { ...item, description: allText, descriptionContinuations: [] };
                    }
                    return item;
                }

                // 超過 → 分割点を計算
                // 利用可能な高さ = ページの下部余白までの距離
                const availableHeight = pagePrintBottom - visualTop;
                if (availableHeight <= 16) return item;

                const splitIdx = findSplitIndex(descEl, availableHeight);
                if (splitIdx <= 0) return item;

                const firstPart = allText.substring(0, splitIdx);
                const rest = allText.substring(splitIdx).trimStart();

                // 収束チェック：すでに同じ分割なら更新不要
                if (firstPart === item.description &&
                    JSON.stringify(item.descriptionContinuations ?? []) ===
                    JSON.stringify(rest ? [rest] : [])) {
                    return item;
                }

                changed = true;
                return { ...item, description: firstPart, descriptionContinuations: rest ? [rest] : [] };
            });

            if (!changed) return prev;
            return { ...prev, items: newItems };
        });
        isSplittingRef.current = false;
    }, [pageH, paddingPx]);

    useEffect(() => {
        recalcPages();
        recalcDescriptionSplits();
        const observer = new MutationObserver(() => {
            recalcPages();
            // 分割計算中のDOMアップデートによる再発動をスキップ
            if (!isSplittingRef.current) recalcDescriptionSplits();
        });
        if (contentRef.current) {
            // style属性の変更は無限ループを引き起こすため除外
            observer.observe(contentRef.current, { childList: true, subtree: true });
        }
        window.addEventListener("resize", () => { recalcPages(); recalcDescriptionSplits(); });
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", () => { recalcPages(); recalcDescriptionSplits(); });
        };
    }, [recalcPages, recalcDescriptionSplits]);

    useEffect(() => {
        const t = setTimeout(() => { recalcPages(); recalcDescriptionSplits(); }, 50);
        return () => clearTimeout(t);
    }, [documentState, recalcPages, recalcDescriptionSplits]);

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
                                borderRadius: '2px',
                                flexShrink: 0
                            }}
                        >
                            {/* 上部余白エリア（視覚的ガイド：点線） */}
                            <div
                                className="absolute left-0 right-0 top-0 pointer-events-none"
                                style={{
                                    height: paddingPx,
                                    borderBottom: '1px dashed rgba(0,0,0,0.07)',
                                    background: 'rgba(0,0,0,0.012)',
                                }}
                            />
                            {/* 下部余白エリア（上部余白と同じ幅・同じスタイル） */}
                            <div
                                className="absolute left-0 right-0 bottom-0 pointer-events-none"
                                style={{
                                    height: paddingPx,
                                    borderTop: '1px dashed rgba(0,0,0,0.07)',
                                    background: 'rgba(0,0,0,0.012)',
                                }}
                            />
                            {/* Page Numbers（下部余白エリア内の右側） */}
                            {pageCount > 1 && (
                                <div
                                    className="absolute right-8 text-right pointer-events-none"
                                    style={{ bottom: paddingPx / 2 - 8 }}
                                >
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
                                <React.Fragment key={item.id}>
                                    {/* 見出し行（インデックス番号 + 見出し） - 独立したpage-breakable */}
                                    <div className="flex gap-4 items-baseline pb-1 break-inside-avoid relative group page-breakable">
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
                                        <div className="flex-1">
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
                                        </div>
                                    </div>
                                    {/* 本文（見出しとは独立したpage-breakable） */}
                                    <div className="flex gap-4 pb-2 mb-2 break-inside-avoid page-breakable">
                                        <div className="w-8 shrink-0" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <ContentEditableDiv
                                                tagName="div"
                                                className="leading-relaxed whitespace-pre-wrap min-h-[1.5rem] -ml-3"
                                                style={{ color: '#1f2937' }}
                                                html={item.description || ""}
                                                dataAttrs={{ 'data-desc-id': item.id }}
                                                onChange={(val) => {
                                                    setDocumentState(prev => ({
                                                        ...prev,
                                                        items: prev.items.map(i => i.id === item.id
                                                            ? { ...i, description: val, descriptionContinuations: [] }
                                                            : i)
                                                    }));
                                                }}
                                                placeholder="本文"
                                            />
                                        </div>
                                    </div>
                                    {/* 本文の続き（余白超過分 - 次ページに表示） */}
                                    {(item.descriptionContinuations || []).map((cont, ci) => (
                                        <div key={`${item.id}-cont-${ci}`} className="flex gap-4 pb-2 mb-2 break-inside-avoid page-breakable">
                                            <div className="w-8 shrink-0" />
                                            <div className="flex-1 flex flex-col gap-2">
                                                <ContentEditableDiv
                                                    tagName="div"
                                                    className="leading-relaxed whitespace-pre-wrap min-h-[1.5rem] -ml-3"
                                                    style={{ color: '#1f2937' }}
                                                    html={cont}
                                                    onChange={(val) => {
                                                        // 続きブロックを編集したら全部統合してcontinuationsをリセット
                                                        setDocumentState(prev => {
                                                            const it = prev.items.find(i => i.id === item.id);
                                                            if (!it) return prev;
                                                            const parts = [it.description, ...(it.descriptionContinuations || [])];
                                                            parts[ci + 1] = val;
                                                            return {
                                                                ...prev,
                                                                items: prev.items.map(i => i.id === item.id
                                                                    ? { ...i, description: parts.join(''), descriptionContinuations: [] }
                                                                    : i)
                                                            };
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {/* メモ欄 */}
                                    {item.isMemoEnabled && (
                                        <div className="flex gap-4 pb-2 mb-6 page-breakable">
                                            <div className="w-8 shrink-0" />
                                            <div className="flex-1">
                                                <div className="mt-2 rounded-lg p-4 text-sm min-h-[80px]" style={{ backgroundColor: '#fefce880', border: '1px solid #fef08a99', color: '#374151' }}>
                                                    <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#854d0e99' }}>Memo</div>
                                                    <div className="w-full h-full min-h-[40px]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
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
