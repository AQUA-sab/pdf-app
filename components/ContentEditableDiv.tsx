"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface ContentEditableDivProps {
    html: string;
    onChange: (html: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    tagName?: string;
    dataAttrs?: Record<string, string>; // data-* 属性
}

export function ContentEditableDiv({ html, onChange, className, style, placeholder, tagName = "div", dataAttrs }: ContentEditableDivProps) {
    const elRef = useRef<HTMLElement>(null);
    const isLocalChange = useRef(false);
    const lastHtml = useRef(html);

    // Set initial HTML on mount only
    useEffect(() => {
        if (elRef.current) {
            elRef.current.innerHTML = html;
            lastHtml.current = html;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external state changes WITHOUT resetting cursor
    useEffect(() => {
        if (isLocalChange.current) {
            isLocalChange.current = false;
            return;
        }
        // 外部からhtmlが変更された場合のみDOMを更新
        if (elRef.current && lastHtml.current !== html) {
            // フォーカスがある場合はカーソル位置を保持する試み
            const isFocused = document.activeElement === elRef.current;
            let savedOffset = 0;
            
            if (isFocused) {
                try {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        const preRange = document.createRange();
                        preRange.selectNodeContents(elRef.current);
                        preRange.setEnd(range.startContainer, range.startOffset);
                        savedOffset = preRange.toString().length;
                    }
                } catch { /* ignore */ }
            }
            
            elRef.current.innerHTML = html;
            lastHtml.current = html;
            
            if (isFocused) {
                try {
                    // カーソルを復元
                    const textLen = elRef.current.innerText.length;
                    const offset = Math.min(savedOffset, textLen);
                    
                    const range = document.createRange();
                    const walker = document.createTreeWalker(elRef.current, NodeFilter.SHOW_TEXT);
                    let charCount = 0;
                    let node = walker.nextNode();
                    let found = false;
                    
                    while (node) {
                        const nodeLen = node.nodeValue?.length || 0;
                        if (charCount + nodeLen >= offset) {
                            range.setStart(node, offset - charCount);
                            range.collapse(true);
                            found = true;
                            break;
                        }
                        charCount += nodeLen;
                        node = walker.nextNode();
                    }
                    
                    if (found) {
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } catch { /* ignore cursor restoration errors */ }
            }
        }
    }, [html]);

    const handleInput = useCallback(() => {
        if (elRef.current) {
            isLocalChange.current = true;
            const newHtml = elRef.current.innerHTML;
            lastHtml.current = newHtml;
            onChange(newHtml);
        }
    }, [onChange]);

    const Tag = tagName;

    return React.createElement(Tag, {
        ref: elRef,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onInput: handleInput,
        onBlur: handleInput,
        className: `outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-inherit empty:before:opacity-30 ${className || ""}`,
        style,
        "data-placeholder": placeholder,
        spellCheck: false,
        ...dataAttrs,
    });
}
