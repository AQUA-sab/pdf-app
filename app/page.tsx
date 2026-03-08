"use client";

import { useState } from "react";
import { EditSidebar } from "@/components/EditSidebar";
import { PreviewPane } from "@/components/PreviewPane";
import { TopNav } from "@/components/TopNav";
import { FormattingToolbar } from "@/components/FormattingToolbar";

export interface DocumentItem {
  id: string;
  heading: string;
  description: string;
  isMemoEnabled: boolean;
  textRows: number;
}

export interface DocumentState {
  title: string;
  date: string;
  attendees: string;
  items: DocumentItem[];
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
    orientation: "portrait",
    padding: 24,
    isAttendeesVisible: true,
  });

  // 2. UI View State
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Passed down to TopNav to control editor sidebar via "Edit" button
  const toggleEditor = () => setIsEditorOpen(prev => !prev);

  // Handlers for printing and clearing
  const handlePrint = () => window.print();
  const handleClear = () => {
    if (window.confirm("画面のすべての内容をクリアしますか？この操作は元に戻せません。")) {
      setDocumentState({
        title: "",
        date: "",
        attendees: "",
        items: [],
        orientation: "portrait",
        padding: 24,
        isAttendeesVisible: true,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] selection:bg-[#e8af48]/30 selection:text-[#e8af48] flex flex-col font-sans overflow-hidden">
      {/* Top Floating Tools */}
      <TopNav
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
        onPrint={handlePrint}
        onClear={handleClear}
      />

      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <FormattingToolbar />
      </div>

      {/* Main Workspace Layout - Fixed height to viewport to prevent full page scroll */}
      <div className="flex-1 flex w-full relative h-[calc(100vh-80px)] mt-[80px] overflow-hidden">

        {/* Background effects for the workspace */}
        <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_100%)] z-0" />

        {/* Left Side: Editor Sidebar (Absolute positioning to not squeeze the preview) */}
        <div
          className={`absolute left-0 top-0 h-full flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] z-40 ${isEditorOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"
            }`}
        >
          {/* Override pt-[80px] inside EditSidebar by passing a custom class or removing it since we now have mt-[80px] on the parent. Wait, EditSidebar is inside this absolute div. Let's make this div fixed to top:80px or just remove the pt-80 from EditSidebar and handle it here. For simplicity we will remove `pt-[80px]` from EditSidebar.tsx as well in the next step, but here we adjust the layout. */}
          <EditSidebar
            documentState={documentState}
            setDocumentState={setDocumentState}
            onClose={() => setIsEditorOpen(false)}
          />
        </div>

        {/* Right Side: Live Preview Pane (Takes full width always, centered, independently scrollable) */}
        <div className={`flex-1 h-full relative z-0 flex items-center justify-center p-8 overflow-y-auto overflow-x-hidden bg-black/20 transition-all duration-500 ${isEditorOpen ? "pl-[380px]" : ""}`}>
          <PreviewPane documentState={documentState} setDocumentState={setDocumentState} />
        </div>
      </div>
    </main>
  );
}
