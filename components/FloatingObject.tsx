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
}

export function FloatingObject({ element, updateElement, removeElement, isActive, onActivate }: FloatingObjectProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // To prevent text selection while manipulating
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
        // Only trigger drag if it's the container (not the resize handles or content editable inner text)
        if ((e.target as HTMLElement).closest('.resize-handle')) return;
        if ((e.target as HTMLElement).closest('[contenteditable="true"]')) {
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

            // Handle horizontal resizing
            if (direction.includes('e')) newWidth = initialWidth + dx;
            if (direction.includes('w')) {
                newWidth = initialWidth - dx;
                newX = initialX + dx;
            }

            // Handle vertical resizing
            if (direction.includes('s')) newHeight = initialHeight + dy;
            if (direction.includes('n')) {
                newHeight = initialHeight - dy;
                newY = initialY + dy;
            }

            // Minimum dimensions constraints
            if (newWidth < 20) {
                newWidth = 20;
                newX = direction.includes('w') ? initialX + initialWidth - 20 : newX;
            }
            if (newHeight < 20) {
                newHeight = 20;
                newY = direction.includes('n') ? initialY + initialHeight - 20 : newY;
            }

            updateElement(element.id, {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            });
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
            <div
                className="w-full h-full"
                style={{
                    backgroundColor: element.backgroundColor,
                    borderColor: element.borderColor,
                    borderWidth: element.borderWidth,
                    borderStyle: 'solid',
                    borderRadius: element.shapeType === 'circle' ? '50%' : `${element.borderRadius || 0}px`
                }}
            />
        );
    } else if (element.type === 'text') {
        innerContent = (
            <div className="w-full h-full relative group">
                {/* Visual border only visible slightly or when active so it looks like a text box */}
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
                cursor: isDragging ? 'grabbing' : 'grab',
                // Using hardware acceleration for smoother dragging
                transform: 'translate3d(0,0,0)',
            }}
        >
            {/* Delete button (only when active) */}
            {isActive && (
                <button
                    onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md print-hide z-50"
                    title="削除"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
            )}

            {/* Resize Handles (8 directions) */}
            {isActive && (
                <>
                    {/* Corners */}
                    <div className="resize-handle nw absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
                    <div className="resize-handle ne absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
                    <div className="resize-handle sw absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nesw-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
                    <div className="resize-handle se absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nwse-resize print-hide z-40" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
                    {/* Edges */}
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
