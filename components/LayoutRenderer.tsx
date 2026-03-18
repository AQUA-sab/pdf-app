"use client";

import React from "react";
import { DocumentState, DocumentItem } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";
import { ColumnLayout } from "@/components/ColumnLayout";
import { TableElement } from "@/components/TableElement";

interface LayoutRendererProps {
  documentState: DocumentState;
  setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
}

/**
 * 標準レイアウトのレンダリング
 */
function renderStandardLayout(
  items: DocumentItem[],
  setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>
) {
  return items.map((item, index) => (
    <React.Fragment key={item.id}>
      {/* 見出し行 */}
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

      {/* 本文 */}
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

      {/* 本文の続き */}
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
  ));
}

/**
 * 段組みレイアウトのレンダリング
 */
function renderColumnsLayout(
  items: DocumentItem[],
  columnCount: number,
  setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>
) {
  const allContent = items
    .map(item => `${item.heading}\n${item.description}`)
    .join('\n\n');

  return (
    <ColumnLayout
      id="main-content"
      content={allContent}
      columnCount={columnCount}
      onChange={(content) => {
        // 段組みモードでの編集は全体のテキストを更新
        const lines = content.split('\n\n');
        setDocumentState(prev => ({
          ...prev,
          items: prev.items.map((item, idx) => {
            if (idx < lines.length) {
              const [heading, ...descParts] = lines[idx].split('\n');
              return { ...item, heading, description: descParts.join('\n') };
            }
            return item;
          })
        }));
      }}
      isEditable={true}
    />
  );
}

/**
 * テーブルレイアウトのレンダリング
 */
function renderTableLayout(
  items: DocumentItem[],
  setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>
) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="page-breakable">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#111827' }}>
            {item.heading}
          </h3>
          <TableElement
            id={item.id}
            data={{
              rows: [
                {
                  cells: [
                    { content: '項目', width: 30, align: 'center' },
                    { content: '説明', width: 70, align: 'left' }
                  ]
                },
                {
                  cells: [
                    { content: item.heading, align: 'center' },
                    { content: item.description, align: 'left' }
                  ]
                }
              ]
            }}
            onChange={(data) => {
              setDocumentState(prev => ({
                ...prev,
                items: prev.items.map(i =>
                  i.id === item.id
                    ? { ...i, description: data.rows[1]?.cells[1]?.content || '' }
                    : i
                )
              }));
            }}
            isEditable={true}
          />
        </div>
      ))}
    </div>
  );
}

export function LayoutRenderer({ documentState, setDocumentState }: LayoutRendererProps) {
  const layoutMode = documentState.layoutMode || 'standard';
  const columnCount = documentState.columnCount || 2;

  return (
    <div className="flex-1 mt-6 flex flex-col print:block">
      {layoutMode === 'columns' && renderColumnsLayout(documentState.items, columnCount, setDocumentState)}
      {layoutMode === 'table' && renderTableLayout(documentState.items, setDocumentState)}
      {layoutMode === 'standard' && renderStandardLayout(documentState.items, setDocumentState)}
    </div>
  );
}
