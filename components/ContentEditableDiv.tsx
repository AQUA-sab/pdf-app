"use client";

import React, { useRef, useEffect } from "react";

interface ContentEditableDivProps {
    html: string;
    onChange: (html: string) => void;
    className?: string;
    placeholder?: string;
    tagName?: React.ElementType | string;
}

export function ContentEditableDiv({ html, onChange, className, placeholder, tagName = "div" }: ContentEditableDivProps) {
    const contentEditableRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (contentEditableRef.current && contentEditableRef.current.innerHTML !== html) {
            // Only update DOM if the local state does not match the incoming prop, 
            // otherwise cursor jumps to the beginning on every keystroke
            contentEditableRef.current.innerHTML = html;
        }
    }, [html]);

    const handleInput = () => {
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    const Tag = tagName as any;

    return (
        <Tag
            ref={contentEditableRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-inherit empty:before:opacity-30 ${className || ""}`}
            data-placeholder={placeholder}
            dangerouslySetInnerHTML={{ __html: html }}
            spellCheck="false"
        />
    );
}
