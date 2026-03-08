"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface ContentEditableDivProps {
    html: string;
    onChange: (html: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    tagName?: string;
}

export function ContentEditableDiv({ html, onChange, className, style, placeholder, tagName = "div" }: ContentEditableDivProps) {
    const elRef = useRef<HTMLElement>(null);
    const isLocalChange = useRef(false);

    // Set initial HTML on mount only
    useEffect(() => {
        if (elRef.current) {
            elRef.current.innerHTML = html;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external state changes (e.g. from sidebar edits) WITHOUT resetting cursor
    useEffect(() => {
        if (isLocalChange.current) {
            // This update was triggered by our own onInput, skip DOM update
            isLocalChange.current = false;
            return;
        }
        if (elRef.current && elRef.current.innerHTML !== html) {
            elRef.current.innerHTML = html;
        }
    }, [html]);

    const handleInput = useCallback(() => {
        if (elRef.current) {
            isLocalChange.current = true;
            onChange(elRef.current.innerHTML);
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
    });
}
