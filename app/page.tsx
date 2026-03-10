"use client";

import { useState, useRef, useCallback } from "react";
import { EditSidebar } from "@/components/EditSidebar";
import { PreviewPane } from "@/components/PreviewPane";
import { TopNav } from "@/components/TopNav";
import { FormattingToolbar } from "@/components/FormattingToolbar";
import { ShapeSidebar } from "@/components/ShapeSidebar";
import { ShapeEditSidebar } from "@/components/ShapeEditSidebar";
import { FontSidebar } from "@/components/FontSidebar";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface DocumentItem {
  id: string;
  indexText?: string;
  heading: string;
  description: string;
  descriptionContinuations?: string[]; // 余白超過時に次ページへ送られたテキスト断片
  isMemoEnabled: boolean;
  textRows: number;
}

export type FloatingElementType = 'image' | 'shape' | 'text';

export interface FloatingElement {
  id: string;
  type: FloatingElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // Base64 image data, shape type, or text html
  shapeType?: 'rect' | 'roundedRect' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'arrow' | 'star' | 'callout';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  opacity?: number;
}

export interface DocumentState {
  title: string;
  date: string;
  attendees: string;
  items: DocumentItem[];
  floatingElements: FloatingElement[];
  orientation: "portrait" | "landscape";
  padding: number;
  isAttendeesVisible: boolean;
}

export default function Home() {
  // 1. Centralized State Management
  const [documentState, setDocumentState] = useState<DocumentState>({
    title: "",
    date: "",
    attendees: "",
    items: [],
    floatingElements: [],
    orientation: "portrait",
    padding: 24,
    isAttendeesVisible: true,
  });

  // 2. UI View State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShapeSidebarOpen, setIsShapeSidebarOpen] = useState(false);
  const [isFontSidebarOpen, setIsFontSidebarOpen] = useState(false);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const fontSavedRange = useRef<Range | null>(null);

  const handleOpenFontSidebar = useCallback(() => {
    // Save current selection before opening font sidebar
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
      if (el && el.closest?.('#pdf-content')) {
        fontSavedRange.current = range.cloneRange();
      }
    }
    setIsFontSidebarOpen(true);
    setIsEditorOpen(false);
    setIsShapeSidebarOpen(false);
    setEditingShapeId(null);
  }, []);

  const handleSelectFont = useCallback((fontFamily: string) => {
    const sel = window.getSelection();
    if (sel && fontSavedRange.current) {
      sel.removeAllRanges();
      sel.addRange(fontSavedRange.current);
    }
    document.execCommand('fontName', false, fontFamily);
    setIsFontSidebarOpen(false);
  }, []);

  // Passed down to TopNav to control editor sidebar via "Edit" button
  const toggleEditor = () => setIsEditorOpen(prev => !prev);

  // Handlers for printing and clearing
  const handlePrint = async () => {
    const el = document.getElementById("pdf-content");
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.querySelectorAll("*");
          const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor'];
          elements.forEach((node) => {
            const el = node as HTMLElement;
            if (el.getAttribute('style')?.includes('lab')) {
              const styleStr = el.getAttribute('style') || "";
              const safeStyle = styleStr.replace(/oklab\([^)]+\)/g, 'rgb(0, 0, 0)').replace(/lab\([^)]+\)/g, 'rgb(0, 0, 0)');
              if (safeStyle !== styleStr) el.setAttribute('style', safeStyle);
            }
            const computed = window.getComputedStyle(el);
            colorProps.forEach(prop => {
              const val = computed.getPropertyValue(prop);
              if (val && (val.includes('oklab') || val.includes('lab('))) {
                (el.style as any)[prop] = 'rgb(0, 0, 0)';
              }
            });
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: documentState.orientation,
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pdfWidth / pdfHeight;

      let drawWidth = pdfWidth;
      let drawHeight = pdfWidth / imgRatio;

      // Handle multi-page if content is taller than one A4 page
      if (drawHeight > pdfHeight) {
        const totalPages = Math.ceil(drawHeight / pdfHeight);
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -(pdfHeight * i), drawWidth, drawHeight);
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, drawWidth, drawHeight);
      }

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open PDF in new tab - browser's built-in PDF viewer allows printing
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        // Try to trigger print after a short delay
        printWindow.onload = () => {
          setTimeout(() => {
            try { printWindow.print(); } catch { /* PDF viewer handles print */ }
          }, 1000);
        };
      } else {
        // If popup was blocked, download instead
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = `${documentState.title || "document"}_print.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);
        alert("ポップアップがブロックされました。PDFをダウンロードしました。ダウンロードしたファイルを開いて印刷してください。");
      }
    } catch (e) {
      console.error("Print failed", e);
      alert("印刷の準備に失敗しました。");
    }
  };
  const handleClear = () => {
    if (window.confirm("画面のすべての内容をクリアしますか？この操作は元に戻せません。")) {
      setDocumentState({
        title: "",
        date: "",
        attendees: "",
        items: [],
        floatingElements: [],
        orientation: "portrait",
        padding: 24,
        isAttendeesVisible: true,
      });
    }
  };

  const handleSavePdf = async () => {
    const el = document.getElementById("pdf-content");
    if (!el) return;

    try {
      // 1. Generate PDF from DOM with oklab/lab color workaround
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          // html2canvas parser crashes on oklab/lab colors generated by Tailwind v4.
          // We iterate over all elements in the clone and replace oklab/lab with rgb.
          // A simple approach: remove the standard Tailwind variable injections or replace 
          // computed styles that use them.
          const elements = clonedDoc.querySelectorAll("*");
          const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor'];

          elements.forEach((node) => {
            const el = node as HTMLElement;
            // First check inline styles and replace literal oklab/lab strings
            if (el.getAttribute('style')?.includes('lab')) {
              const styleStr = el.getAttribute('style') || "";
              // Remove or replace unsupported color strings in inline style 
              // (Very basic fallback: replacing with a safe color if matching)
              const safeStyle = styleStr.replace(/oklab\([^)]+\)/g, 'rgb(0, 0, 0)')
                .replace(/lab\([^)]+\)/g, 'rgb(0, 0, 0)');
              if (safeStyle !== styleStr) {
                el.setAttribute('style', safeStyle);
              }
            }
            // For computed styles from classes (Tailwind variables), 
            // html2canvas parses the computed style. If a variable resolves to oklab, it crashes.
            // We force explicit rgb styles on elements taking the colors from var(--color-*)
            const computed = window.getComputedStyle(el);
            colorProps.forEach(prop => {
              const val = computed.getPropertyValue(prop);
              if (val && (val.includes('oklab') || val.includes('lab('))) {
                // Force it to a safe fallback directly on the clone
                (el.style as any)[prop] = 'rgb(0, 0, 0)';
              }
            });
          });
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: documentState.orientation,
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // 2. Extract raw PDF blob
      const pdfBlob = pdf.output("blob");

      // 3. Append JSON metadata at the end of the blob
      const metadataStr = `\n---PDFAPP_DATA---\n${JSON.stringify(documentState)}`;
      const metadataBlob = new Blob([metadataStr], { type: "text/plain" });

      // Combine them
      const combinedBlob = new Blob([pdfBlob, metadataBlob], { type: "application/pdf" });

      // 4. Download
      const url = URL.createObjectURL(combinedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentState.title || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed", e);
      alert("PDFの生成に失敗しました。");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadPdf = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parts = text.split("---PDFAPP_DATA---\n");
      if (parts.length > 1) {
        const jsonStr = parts[parts.length - 1];
        const state = JSON.parse(jsonStr) as DocumentState;
        if (state && typeof state === "object" && "items" in state) {
          // Compatibility for older saves without floatingElements
          if (!state.floatingElements) state.floatingElements = [];

          setDocumentState(state);
          return;
        }
      }
      alert("このファイルには編集用データが含まれていないか、破損しています。");
    } catch (e) {
      console.error("Failed to load PDF data", e);
      alert("ファイルの読み込みに失敗しました。");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Insert Floating Elements ---
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInsertImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      // Get an image object to check dimensions
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        // Scale down if too large (e.g., max 300px width initially)
        if (w > 300) {
          h = Math.round((300 / w) * h);
          w = 300;
        }

        setDocumentState(prev => ({
          ...prev,
          floatingElements: [
            ...prev.floatingElements,
            {
              id: crypto.randomUUID(),
              type: 'image',
              x: 50, // Initial dropped coords
              y: 50,
              width: w,
              height: h,
              content: base64
            }
          ]
        }));
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleOpenShapeSidebar = () => {
    setIsShapeSidebarOpen(true);
    setIsEditorOpen(false);
    setEditingShapeId(null);
  };

  const handleInsertShape = (shapeType: FloatingElement['shapeType']) => {
    const defaultRadius = shapeType === 'roundedRect' ? 12 : 0;
    setDocumentState(prev => ({
      ...prev,
      floatingElements: [
        ...prev.floatingElements,
        {
          id: crypto.randomUUID(),
          type: 'shape',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          content: '',
          shapeType: shapeType || 'rect',
          backgroundColor: '#3b82f640',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: defaultRadius,
          opacity: 1,
        }
      ]
    }));
    setIsShapeSidebarOpen(false);
  };

  const handleEditShape = (id: string) => {
    setEditingShapeId(id);
    setIsEditorOpen(false);
    setIsShapeSidebarOpen(false);
  };

  const handleUpdateFloatingElement = (id: string, updates: Partial<FloatingElement>) => {
    setDocumentState(prev => ({
      ...prev,
      floatingElements: prev.floatingElements.map(el => el.id === id ? { ...el, ...updates } : el)
    }));
  };

  const editingShape = editingShapeId ? documentState.floatingElements.find(el => el.id === editingShapeId) : null;

  const handleInsertText = () => {
    setDocumentState(prev => ({
      ...prev,
      floatingElements: [
        ...prev.floatingElements,
        {
          id: crypto.randomUUID(),
          type: 'text',
          x: 100,
          y: 150,
          width: 200,
          height: 80,
          content: 'テキスト',
          textColor: '#000000',
        }
      ]
    }));
  };

  const handleInsertItem = () => {
    setDocumentState(prev => ({
        ...prev,
        items: [...prev.items, { id: crypto.randomUUID(), heading: "", description: "", isMemoEnabled: false, textRows: 3 }]
    }));
  };

  return (
    <main className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-gray-100'} selection:bg-[#e8af48]/30 selection:text-[#e8af48] flex flex-col font-sans transition-colors duration-300`}>
      {/* Hidden file input for loading PDFs */}
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {/* Hidden file input for inserting images */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Top Floating Tools */}
      <TopNav
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
        onPrint={handlePrint}
        onClear={handleClear}
        onSavePdf={handleSavePdf}
        onLoadPdf={handleLoadPdf}
        onInsertItem={handleInsertItem}
        onInsertImage={handleInsertImageClick}
        onInsertShape={handleOpenShapeSidebar}
        onInsertText={handleInsertText}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <FormattingToolbar onOpenFontSidebar={handleOpenFontSidebar} />
      </div>

      {/* Main Workspace Layout - Flows naturally with window scroll */}
      <div className="flex-1 flex w-full relative mt-[80px]">

        {/* Background effects for the workspace */}
        <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_100%)] z-0 fixed" />

        {/* Left Side: Editor Sidebar (Fixed positioning now that window scrolls) */}
        <div
          className={`fixed left-0 top-[80px] h-[calc(100vh-80px)] flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] z-40 ${isEditorOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"}`}
        >
          <EditSidebar
            documentState={documentState}
            setDocumentState={setDocumentState}
            onClose={() => setIsEditorOpen(false)}
          />
        </div>

        {/* Shape Selection Sidebar */}
        <div
          className={`fixed left-0 top-[80px] h-[calc(100vh-80px)] flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] z-40 ${isShapeSidebarOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"}`}
        >
          <ShapeSidebar
            onInsertShape={handleInsertShape}
            onClose={() => setIsShapeSidebarOpen(false)}
          />
        </div>

        {/* Shape Edit Sidebar */}
        <div
          className={`fixed left-0 top-[80px] h-[calc(100vh-80px)] flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] z-40 ${editingShape ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"}`}
        >
          {editingShape && (
            <ShapeEditSidebar
              element={editingShape}
              onUpdate={(updates) => handleUpdateFloatingElement(editingShapeId!, updates)}
              onClose={() => setEditingShapeId(null)}
            />
          )}
        </div>

        {/* Font Selection Sidebar */}
        <div
          className={`fixed left-0 top-[80px] h-[calc(100vh-80px)] flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] z-40 ${isFontSidebarOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"}`}
        >
          <FontSidebar
            onSelectFont={handleSelectFont}
            onClose={() => setIsFontSidebarOpen(false)}
          />
        </div>

        {/* Right Side: Live Preview Pane - Let it grow and dictate window height */}
        <div className={`flex-1 w-full relative z-0 flex flex-col items-center justify-start min-h-[calc(100vh-80px)] p-8 ${isDarkMode ? 'bg-black/20' : 'bg-gray-200/50'} transition-all duration-500 ${(isEditorOpen || isShapeSidebarOpen || editingShape || isFontSidebarOpen) ? "ml-[360px]" : ""}`}>
          <PreviewPane documentState={documentState} setDocumentState={setDocumentState} onEditShape={handleEditShape} />
        </div>
      </div>
    </main>
  );
}
