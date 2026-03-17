"use client";

import React from "react";
import { TableData } from "@/lib/layoutEngine";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface TableElementProps {
  id: string;
  data: TableData;
  onChange?: (data: TableData) => void;
  isEditable?: boolean;
}

export function TableElement({ id, data, onChange, isEditable = false }: TableElementProps) {
  const handleCellChange = (rowIndex: number, cellIndex: number, newContent: string) => {
    if (!onChange) return;

    const newData = {
      ...data,
      rows: data.rows.map((row, ri) =>
        ri === rowIndex
          ? {
              ...row,
              cells: row.cells.map((cell, ci) =>
                ci === cellIndex ? { ...cell, content: newContent } : cell
              ),
            }
          : row
      ),
    };

    onChange(newData);
  };

  const handleAddRow = () => {
    if (!onChange) return;

    const newRow = {
      cells: data.rows[0]?.cells.map(() => ({ content: "" })) || [{ content: "" }],
    };

    onChange({
      ...data,
      rows: [...data.rows, newRow],
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (!onChange || data.rows.length <= 1) return;

    onChange({
      ...data,
      rows: data.rows.filter((_, ri) => ri !== rowIndex),
    });
  };

  return (
    <div className="w-full overflow-x-auto page-breakable">
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={`${id}-row-${rowIndex}`} className="group relative">
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={`${id}-cell-${rowIndex}-${cellIndex}`}
                  className="border border-gray-300 p-2 min-h-[40px]"
                  style={{
                    width: cell.width ? `${cell.width}%` : "auto",
                    textAlign: cell.align || "left",
                  }}
                >
                  {isEditable ? (
                    <ContentEditableDiv
                      tagName="div"
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      html={cell.content}
                      onChange={(val) => handleCellChange(rowIndex, cellIndex, val)}
                      placeholder="セルの内容..."
                    />
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{cell.content}</div>
                  )}
                </td>
              ))}
              {isEditable && (
                <td className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded"
                  >
                    削除
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isEditable && (
        <button
          onClick={handleAddRow}
          className="mt-2 px-3 py-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded"
        >
          行を追加
        </button>
      )}
    </div>
  );
}
