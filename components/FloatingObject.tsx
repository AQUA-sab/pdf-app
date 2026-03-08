"use client";

import React, { useState, useRef, useEffect } from "react";
import { FloatingElement } from "@/app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface FloatingObjectProps {
    element: FloatingElement;
    updateElement: (id: string, updates: Partial<FloatingElement>) => void;
    removeElement: (id: string) => void;
    isActive: boolean;
    onActivate: (id: string) => void;
    onEdit?: (id: string) => void;
}

function renderShapeSVG(element: FloatingElement) {
    const w = element.width;
    const h = element.height;
    const fill = element.backgroundColor || 'transparent';
    const stroke = element.borderColor || '#3b82f6';
    const strokeW = element.borderWidth ?? 2;
    const opacity = element.opacity ?? 1;

    const commonProps = { fill, stroke, strokeWidth: strokeW, opacity };

    switch (element.shapeType) {
        case 'rect':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <rect x={strokeW / 2} y={strokeW / 2} width={w - strokeW} height={h - strokeW} rx={element.borderRadius || 0} {...commonProps} />
                </svg>
            );
        case 'roundedRect':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <rect x={strokeW / 2} y={strokeW / 2} width={w - strokeW} height={h - strokeW} rx={element.borderRadius || 12} {...commonProps} />
                </svg>
            );
        case 'circle':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - strokeW / 2} ry={h / 2 - strokeW / 2} {...commonProps} />
                </svg>
            );
        case 'ellipse':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - strokeW / 2} ry={h / 2 - strokeW / 2} {...commonProps} />
                </svg>
            );
        case 'triangle':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <polygon points={`${w / 2},${strokeW} ${w - strokeW},${h - strokeW} ${strokeW},${h - strokeW}`} {...commonProps} />
                </svg>
            );
        case 'diamond':
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <polygon points={`${w / 2},${strokeW} ${w - strokeW},${h / 2} ${w / 2},${h - strokeW} ${strokeW},${h / 2}`} {...commonProps} />
                </svg>
            );
        case 'arrow':
            const arrowHeadSize = Math.min(w, h) * 0.3;
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <line x1={strokeW} y1={h / 2} x2={w - arrowHeadSize} y2={h / 2} {...commonProps} fill="none" />
                    <polygon points={`${w - arrowHeadSize},${h * 0.2} ${w - strokeW},${h / 2} ${w - arrowHeadSize},${h * 0.8}`} {...commonProps} />
                </svg>
            );
        case 'star': {
            const cx = w / 2, cy = h / 2;
            const outerR = Math.min(w, h) / 2 - strokeW;
            const innerR = outerR * 0.4;
            const points: string[] = [];
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
            }
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <polygon points={points.join(' ')} {...commonProps} />
                </svg>
            );
        }
        case 'callout': {
            const bodyH = h * 0.75;
            const tailW = w * 0.15;
            const rx = Math.min(12, w * 0.1);
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <rect x={strokeW / 2} y={strokeW / 2} width={w - strokeW} height={bodyH - strokeW / 2} rx={rx} {...commonProps} />
                    <polygon points={`${w * 0.2},${bodyH} ${w * 0.2 + tailW},${bodyH} ${w * 0.15},${h - strokeW}`} fill={fill} stroke={stroke} strokeWidth={strokeW} opacity={opacity} />
                </svg>
            );
        }
        default:
            return (
                <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <rect x={strokeW / 2} y={strokeW / 2} width={w - strokeW} height={h - strokeW} {...commonProps} />
                </svg>
            );
    }
}

export function FloatingObject({ element, updateElement, removeElement, isActive, onActivate, onEdit }: FloatingObjectProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDragging || isResizing) {
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = '';
        }
        return () => { document.body.style.userSelect = ''; };
    }, [isDragging, isResizing]);

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.resize-handle')) return;

        // For drag-handle, always start dragging (for text boxes)
        const isDragHandle = (e.target as HTMLElement).closest('.drag-handle');

        if (!isDragHandle && (e.target as HTMLElement).closest('[contenteditable="true"]')) {
            onActivate(element.id);
            return;
        }

        e.stopPropagation();
        onActivate(element.id);
        setIsDragging(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = element.x;
        const initialY = element.y;

        const handleMouseMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            updateElement(element.id, { x: initialX + dx, y: initialY + dy });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // Resize Logic
    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        onActivate(element.id);
        setIsResizing(direction);

        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = element.x;
        const initialY = element.y;
        const initialWidth = element.width;
        const initialHeight = element.height;

        const handleMouseMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newX = initialX;
            let newY = initialY;

            if (direction.includes('e')) newWidth = initialWidth + dx;
            if (direction.includes('w')) { newWidth = initialWidth - dx; newX = initialX + dx; }
            if (direction.includes('s')) newHeight = initialHeight + dy;
            if (direction.includes('n')) { newHeight = initialHeight - dy; newY = initialY + dy; }

            if (newWidth < 20) { newWidth = 20; newX = direction.includes('w') ? initialX + initialWidth - 20 : newX; }
            if (newHeight < 20) { newHeight = 20; newY = direction.includes('n') ? initialY + initialHeight - 20 : newY; }

            updateElement(element.id, { x: newX, y: newY, width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            setIsResizing(null);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // Render content based on type
    let innerContent = null;
    if (element.type === 'image') {
        innerContent = (
            <div className="w-full h-full p-[2px]">
                <img src={element.content} alt="inserted" className="w-full h-full object-contain pointer-events-none" />
            </div>
        );
    } else if (element.type === 'shape') {
        innerContent = (
            <div className="w-full h-full">
                {renderShapeSVG(element)}
            </div>
        );
    } else if (element.type === 'text') {
        innerContent = (
            <div className="w-full h-full relative group flex flex-col">
                {/* Drag handle bar */}
                <div
                    className="drag-handle w-full h-5 flex items-center justify-center cursor-grab active:cursor-grabbing bg-gray-100 hover:bg-gray-200 transition-colors shrink-0 print:hidden"
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                    <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                    </div>
                </div>
                {/* Text editing area */}
                <div className="flex-1 overflow-hidden relative">
                    <div
                        className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-dashed group-hover:border-gray-300 print-hide transition-colors"
                        style={{ borderColor: isActive ? '#3b82f640' : undefined }}
                    />
                    <ContentEditableDiv
                        tagName="div"
                        className="w-full h-full p-2 outline-none overflow-hidden"
                        style={{ color: element.textColor || '#000000' }}
                        html={element.content}
                        onChange={(val) => updateElement(element.id, { content: val })}
                        placeholder="テキストを入力..."
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            className={`absolute group print:border-none print:shadow-none ${isActive ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white z-50' : 'hover:ring-1 hover:ring-gray-300 z-40'}`}
            style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                cursor: isDragging ? 'grabbing' : (element.type === 'text' ? 'default' : 'grab'),
                transform: 'translate3d(0,0,0)',
            }}
        >
            {/* Delete button + Edit button (only when active) */}
            {isActive && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 print-hide z-50">
                    {element.type === 'shape' && onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(element.id); }}
                            className="px-2 py-1 bg-[#e8af48] hover:bg-[#d9a03f] text-black text-xs font-semibold rounded-md shadow-md flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                            </svg>
                            編集
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                        title="削除"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Resize Handles (8 directions) */}
            {isActive && (
                <>
                    <div className="resize-handle nw absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
                    <div className="resize-handle ne absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
                    <div className="resize-handle sw absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
                    <div className="resize-handle se absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
                    <div className="resize-handle n absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-3 bg-white border border-blue-500 cursor-ns-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
                    <div className="resize-handle s absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-3 bg-white border border-blue-500 cursor-ns-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
                    <div className="resize-handle w absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-4 bg-white border border-blue-500 cursor-ew-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
                    <div className="resize-handle e absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-4 bg-white border border-blue-500 cursor-ew-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
                </>
            )}

            {/* Inner Content Wrapper */}
            <div className="w-full h-full overflow-hidden">
                {innerContent}
            </div>
        </div>
    );
}
