"use client";

import { useEffect, useState } from "react";

export function FormattingToolbar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDoc = (cmd: string, value: string | undefined = undefined) => {
        document.execCommand(cmd, false, value);
    };

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-1 bg-[#121214]/60 backdrop-blur-2xl border border-white/10 shadow-lg rounded-2xl p-1.5 z-50">
            {/* Font Control Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                <select
                    className="bg-transparent text-white/80 text-sm font-medium focus:outline-none appearance-none cursor-pointer pl-2 pr-6 py-1 hover:bg-white/5 rounded-lg transition-colors"
                    onChange={(e) => formatDoc('fontName', e.target.value)}
                    title="フォント"
                >
                    <option value="" className="bg-[#121214]">- フォント -</option>
                    <option value="sans-serif" className="bg-[#121214]">ゴシック体</option>
                    <option value="serif" className="bg-[#121214]">明朝体</option>
                    <option value="monospace" className="bg-[#121214]">等幅</option>
                </select>

                <select
                    className="bg-transparent text-white/80 text-sm font-medium focus:outline-none appearance-none cursor-pointer pl-2 pr-6 py-1 hover:bg-white/5 rounded-lg transition-colors"
                    onChange={(e) => formatDoc('fontSize', e.target.value)}
                    title="フォントサイズ (1~7)"
                >
                    <option value="" className="bg-[#121214]">- サイズ -</option>
                    {[1, 2, 3, 4, 5, 6, 7].map(size => (
                        <option key={size} value={size} className="bg-[#121214]">{size}</option>
                    ))}
                </select>
            </div>

            {/* Style Control Group */}
            <div className="flex items-center gap-1 px-1 border-r border-white/10">
                <button
                    onClick={() => formatDoc('bold')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    title="太字 (Bold)"
                >
                    <strong className="font-bold font-serif text-lg">B</strong>
                </button>
                <button
                    onClick={() => formatDoc('italic')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer italic font-serif text-lg"
                    title="斜体 (Italic)"
                >
                    I
                </button>
                <button
                    onClick={() => formatDoc('underline')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer underline font-serif text-lg"
                    title="下線 (Underline)"
                >
                    U
                </button>
            </div>

            {/* Color Control Group */}
            <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-1 group relative" title="文字色 (Text Color)">
                    <div className="w-8 h-8 flex flex-col items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="text-white/80 font-bold leading-tight -mt-1">A</span>
                        <div className="w-4 h-1 bg-red-500 rounded-full"></div>
                    </div>
                    {/* The actual color input is absolute and invisible over the button, but clickable */}
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => formatDoc('foreColor', e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1 group relative" title="マーカー (Highlight Color)">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        <MarkerIcon className="w-4 h-4 text-white/80" />
                    </div>
                    <input
                        type="color"
                        defaultValue="#ffff00"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => formatDoc('hiliteColor', e.target.value)} // hiliteColor for some browsers, backColor for others
                    />
                </div>
            </div>
        </div>
    );
}

function MarkerIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m9 11-6 6v3h9l3-3" />
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
    );
}
