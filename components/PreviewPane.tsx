"use client";

import React from "react";
import { DocumentState } from "../app/page";
import { ContentEditableDiv } from "@/components/ContentEditableDiv";

interface PreviewPaneProps {
    documentState: DocumentState;
    setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
}

export function PreviewPane({ documentState, setDocumentState }: PreviewPaneProps) {
    // A4 Aspect Ratios:  1:1.414. We use a base width and calculate height.
    const isPortrait = documentState.orientation === 'portrait';

    return (
        <div className="w-full h-full flex items-center justify-center p-8 overflow-y-auto">
            {/* The A4 Paper representation */}
            <div
                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] relative flex flex-col"
                style={{
                    // Approximate A4 proportions. 
                    // In a real print scenario, padding mapping to mm/inches is needed, but this is for live visual preview styling
                    width: isPortrait ? '210mm' : '297mm',
                    minHeight: isPortrait ? '297mm' : '210mm',
                    // Fallback sizes for small screens using max-width and aspect-ratio
                    maxWidth: '100%',
                    aspectRatio: isPortrait ? '1 / 1.4142' : '1.4142 / 1',
                    padding: `${documentState.padding}mm`,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                }}
            >
                {/* Paper Content Wrapper */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Header: Title and Date */}
                    <div className="flex flex-col border-b border-black/10 pb-6 mb-2">
                        <div className="flex items-start justify-between">
                            <ContentEditableDiv
                                tagName="h1"
                                className="text-3xl font-bold text-gray-900 tracking-tight whitespace-pre-wrap break-words flex-1 min-h-[40px]"
                                html={documentState.title}
                                onChange={(val) => setDocumentState(prev => ({ ...prev, title: val }))}
                                placeholder="無題のドキュメント"
                            />
                            <div className="text-gray-500 font-medium ml-6 shrink-0 mt-2">
                                <ContentEditableDiv
                                    tagName="div"
                                    className="text-right min-w-[120px]"
                                    html={documentState.date || "---- / -- / --"}
                                    onChange={(val) => setDocumentState(prev => ({ ...prev, date: val }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metadata: Attendees */}
                    {documentState.isAttendeesVisible !== false && (
                        <div className="flex gap-4">
                            <span className="font-semibold text-gray-700 min-w-[80px]">参加者:</span>
                            <ContentEditableDiv
                                tagName="div"
                                className="text-gray-800 whitespace-pre-wrap flex-1 min-h-[1.5rem]"
                                html={documentState.attendees}
                                onChange={(val) => setDocumentState(prev => ({ ...prev, attendees: val }))}
                                placeholder="参加者を記入..."
                            />
                        </div>
                    )}

                    {/* Main Content: Items */}
                    <div className="flex-1 mt-6 flex flex-col gap-6">
                        {documentState.items.map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-baseline pb-2">
                                {/* Number */}
                                <div className="font-bold text-gray-400 w-6 shrink-0 text-xl text-right">
                                    {index + 1}.
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* Heading */}
                                    <ContentEditableDiv
                                        tagName="div"
                                        className="text-xl font-bold text-gray-900 leading-tight min-h-[28px]"
                                        html={item.heading}
                                        onChange={(val) => {
                                            setDocumentState(prev => ({
                                                ...prev,
                                                items: prev.items.map(i => i.id === item.id ? { ...i, heading: val } : i)
                                            }));
                                        }}
                                        placeholder="見出し"
                                    />

                                    {/* Description (Moved slightly to the left to align between number and heading) */}
                                    <ContentEditableDiv
                                        tagName="div"
                                        className="text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[1.5rem] mt-1 -ml-3"
                                        html={item.description || ""}
                                        onChange={(val) => {
                                            setDocumentState(prev => ({
                                                ...prev,
                                                items: prev.items.map(i => i.id === item.id ? { ...i, description: val } : i)
                                            }));
                                        }}
                                        placeholder="本文"
                                    />

                                    {/* Memo Field (Optional) */}
                                    {item.isMemoEnabled && (
                                        <div className="mt-2 bg-yellow-50/50 border border-yellow-200/60 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                                            <div className="text-xs font-semibold text-yellow-800/60 mb-1 uppercase tracking-wider">Memo</div>
                                            {/* In a real app this might be editable on the paper or just a rendering. Here it's a dedicated visual space. */}
                                            <div className="w-full h-full min-h-[40px]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {documentState.items.length === 0 && (
                            <div className="text-center text-gray-400 py-20 italic">
                                項目がありません。左のメニューから追加してください。
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
