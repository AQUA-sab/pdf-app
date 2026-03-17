/**
 * 複雑なレイアウト対応エンジン
 * テーブル、複数段組み、フローティング要素などの高度なレイアウトに対応
 */

export interface LayoutElement {
  id: string;
  type: 'text' | 'table' | 'image' | 'shape' | 'columns';
  content: string;
  metadata?: Record<string, any>;
}

export interface TableCell {
  content: string;
  width?: number; // percentage
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableData {
  rows: TableRow[];
  width?: number; // percentage
}

/**
 * テーブルが利用可能な高さに収まるかを判定
 * @param tableData テーブルデータ
 * @param availableHeight 利用可能な高さ（px）
 * @param estimatedRowHeight 推定行高さ（px）
 * @returns 収まるかどうか
 */
export function doesTableFitInHeight(
  tableData: TableData,
  availableHeight: number,
  estimatedRowHeight: number = 40
): boolean {
  const estimatedHeight = tableData.rows.length * estimatedRowHeight;
  return estimatedHeight <= availableHeight;
}

/**
 * テーブルを複数ページに分割
 * @param tableData テーブルデータ
 * @param availableHeight 利用可能な高さ（px）
 * @param estimatedRowHeight 推定行高さ（px）
 * @returns 分割されたテーブルの配列
 */
export function splitTableAcrossPages(
  tableData: TableData,
  availableHeight: number,
  estimatedRowHeight: number = 40
): TableData[] {
  const maxRowsPerPage = Math.max(1, Math.floor(availableHeight / estimatedRowHeight));
  const tables: TableData[] = [];

  for (let i = 0; i < tableData.rows.length; i += maxRowsPerPage) {
    const rows = tableData.rows.slice(i, i + maxRowsPerPage);
    tables.push({
      rows,
      width: tableData.width,
    });
  }

  return tables;
}

/**
 * 複数段組みのテキストを計算
 * @param text テキスト内容
 * @param columnCount 段数
 * @param availableWidth 利用可能な幅（px）
 * @param availableHeight 利用可能な高さ（px）
 * @returns 各段のテキスト配列
 */
export function distributeTextAcrossColumns(
  text: string,
  columnCount: number,
  availableWidth: number,
  availableHeight: number
): string[] {
  if (columnCount <= 1) return [text];

  const columnWidth = availableWidth / columnCount;
  const columns: string[] = Array(columnCount).fill('');

  // 簡易的な段組み実装：テキストを均等に分割
  const chars = text.split('');
  let currentColumn = 0;
  let currentHeight = 0;
  const estimatedLineHeight = 20; // px

  chars.forEach((char) => {
    columns[currentColumn] += char;

    if (char === '\n') {
      currentHeight += estimatedLineHeight;
      if (currentHeight > availableHeight && currentColumn < columnCount - 1) {
        currentColumn++;
        currentHeight = 0;
      }
    }
  });

  return columns;
}

/**
 * 要素が複数ページにまたがるかを判定
 * @param elementHeight 要素の高さ（px）
 * @param currentPageRemaining 現在のページの残り高さ（px）
 * @returns またがるかどうか
 */
export function doesElementSpanPages(
  elementHeight: number,
  currentPageRemaining: number
): boolean {
  return elementHeight > currentPageRemaining;
}

/**
 * ページ内での要素の配置を計算
 * @param elements レイアウト要素の配列
 * @param pageHeight ページの高さ（px）
 * @param pageWidth ページの幅（px）
 * @param padding ページのパディング（px）
 * @returns 各要素のページ番号と位置
 */
export interface ElementPosition {
  elementId: string;
  pageIndex: number;
  y: number;
  height: number;
}

export function calculateElementPositions(
  elements: LayoutElement[],
  pageHeight: number,
  pageWidth: number,
  padding: number
): ElementPosition[] {
  const positions: ElementPosition[] = [];
  let currentPageIndex = 0;
  let currentY = padding;
  const availableHeight = pageHeight - padding * 2;

  elements.forEach((element) => {
    // 要素の高さを推定（簡易版）
    let elementHeight = 40; // デフォルト
    if (element.type === 'text') {
      elementHeight = Math.ceil((element.content.length / 80) * 20) + 20;
    } else if (element.type === 'table' && element.metadata?.rows) {
      elementHeight = element.metadata.rows.length * 40;
    } else if (element.type === 'image') {
      elementHeight = element.metadata?.height || 200;
    }

    // 現在のページに収まるかチェック
    if (currentY + elementHeight > pageHeight - padding) {
      // 次のページへ
      currentPageIndex++;
      currentY = padding;
    }

    positions.push({
      elementId: element.id,
      pageIndex: currentPageIndex,
      y: currentY,
      height: elementHeight,
    });

    currentY += elementHeight + 16; // 16px のマージン
  });

  return positions;
}

/**
 * ページ数を計算
 * @param positions 要素の位置情報
 * @returns ページ数
 */
export function calculatePageCount(positions: ElementPosition[]): number {
  if (positions.length === 0) return 1;
  return Math.max(...positions.map((p) => p.pageIndex)) + 1;
}
