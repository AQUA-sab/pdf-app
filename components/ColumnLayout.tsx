"use client";

import React, { useMemo } from "react";
import { distributeTextAcrossColumns } from "@/lib/layoutEngine";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface ColumnLayoutProps {
  id: string;
  content: string;
  columnCount?: number;
  onChange?: (content: string) => void;
  isEditable?: boolean;
}

export function ColumnLayout({
  id,
  content,
  columnCount = 2,
  onChange,
  isEditable = false,
}: ColumnLayoutProps) {
  const columnWidth = 100 / columnCount;

  const columns = useMemo(() => {
    // 簡易版：テキストを段数で均等分割
    const charsPerColumn = Math.ceil(content.length / columnCount);
    const cols: string[] = [];

    for (let i = 0; i < columnCount; i++) {
      const start = i * charsPerColumn;
      const end = Math.min(start + charsPerColumn, content.length);
      cols.push(content.substring(start, end));
    }

    return cols;
  }, [content, columnCount]);

  return (
    <div className="w-full page-breakable">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columnCount}, 1fr)`, gap: "16px" }}>
        {columns.map((columnContent, index) => (
          <div
            key={`${id}-column-${index}`}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
            style={{ width: `${columnWidth}%` }}
          >
            {isEditable ? (
              <ContentEditableDiv
                tagName="div"
                className="text-sm leading-relaxed whitespace-pre-wrap"
                html={columnContent}
                onChange={(val) => {
                  // 全段のテキストを再結合
                  const newContent = columns
                    .map((c, i) => (i === index ? val : c))
                    .join("");
                  onChange?.(newContent);
                }}
                placeholder="段のテキスト..."
              />
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{columnContent}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
