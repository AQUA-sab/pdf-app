/**
 * 日本語テキスト分割ユーティリティ
 * 日本語の句読点や単語境界を考慮した正確なテキスト分割を実現
 */

/**
 * 日本語の句読点や改行に適切な分割点を検出
 * @param text 対象テキスト
 * @param maxIndex テキスト内の最大インデックス
 * @returns 最適な分割点のインデックス
 */
export function findOptimalSplitPointJapanese(text: string, maxIndex: number): number {
  if (maxIndex <= 0 || maxIndex >= text.length) {
    return maxIndex;
  }

  // 句読点や改行を含む分割可能な文字のパターン
  const splitChars = /[。、！？\n\s]/;
  const preferredSplitChars = /[。、！？\n]/; // より好ましい分割点

  // maxIndexから逆向きに検索して、最初の句読点を見つける
  let idx = maxIndex;
  
  // まず、より好ましい分割点（句読点）を探す
  while (idx > 0) {
    if (preferredSplitChars.test(text[idx])) {
      return idx + 1; // 句読点の次の位置
    }
    idx--;
  }

  // 句読点が見つからない場合は、スペースや改行を探す
  idx = maxIndex;
  while (idx > 0) {
    if (splitChars.test(text[idx])) {
      return idx + 1;
    }
    idx--;
  }

  // 分割点が見つからない場合は、最後の文字の後ろを返す
  return maxIndex;
}

/**
 * テキストが指定の高さに収まるかどうかを判定
 * @param el HTMLElement
 * @param availableHeight 利用可能な高さ（px）
 * @returns テキストが収まっているかどうか
 */
export function doesTextFitInHeight(el: HTMLElement, availableHeight: number): boolean {
  return el.scrollHeight <= availableHeight;
}

/**
 * バイナリサーチでテキスト分割点を検出（日本語対応版）
 * @param el HTMLElement
 * @param availableHeight 利用可能な高さ（px）
 * @returns 分割点の文字インデックス。分割不要なら-1
 */
export function findSplitIndexJapanese(el: HTMLElement, availableHeight: number): number {
  const text = el.innerText || '';
  if (!text || el.scrollHeight <= availableHeight) return -1;

  const w = el.getBoundingClientRect().width;
  if (w <= 0) return -1;

  const cs = getComputedStyle(el);
  const clone = document.createElement('div');
  clone.style.cssText = [
    'position:absolute', 'left:-9999px', 'top:-9999px',
    'visibility:hidden', `width:${w}px`, 'height:auto',
    `font-size:${cs.fontSize}`, `line-height:${cs.lineHeight}`,
    `font-family:${cs.fontFamily}`, `white-space:${cs.whiteSpace}`,
    `word-break:${cs.wordBreak}`, `overflow-wrap:${cs.overflowWrap}`,
    `padding:${cs.padding}`
  ].join(';');
  document.body.appendChild(clone);

  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    clone.innerText = text.substring(0, mid);
    if (clone.scrollHeight <= availableHeight) lo = mid + 1;
    else hi = mid;
  }
  document.body.removeChild(clone);

  // 日本語対応：句読点や単語境界を考慮した分割点を探す
  let idx = findOptimalSplitPointJapanese(text, lo);
  
  // 分割点がテキストの最初または最後に近い場合は調整
  if (idx <= 0) return lo;
  if (idx >= text.length) return lo;

  return idx;
}

/**
 * テキストが複数行にわたるかどうかを判定
 * @param el HTMLElement
 * @returns 複数行かどうか
 */
export function isMultiline(el: HTMLElement): boolean {
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
  return el.scrollHeight > lineHeight * 1.5;
}

/**
 * テキストの行数を取得
 * @param el HTMLElement
 * @returns 行数
 */
export function getLineCount(el: HTMLElement): number {
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
  return Math.ceil(el.scrollHeight / lineHeight);
}
