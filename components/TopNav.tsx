"use client";

import { useState, useEffect } from "react";

export function TopNav() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: "File", icon: <FileIcon className="w-5 h-5" /> },
        { name: "Edit", icon: <EditIcon className="w-5 h-5" /> },
        { name: "Insert", icon: <InsertIcon className="w-5 h-5" /> },
    ];

    if (!mounted) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            {/* Embedded custom CSS animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes custom-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes bounce-scale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.25); }
                    100% { transform: scale(1); }
                }
                .animate-custom-spin {
                    animation: custom-spin 4.5s linear infinite;
                }
                .animate-bounce-scale {
                    animation: bounce-scale 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
                }
                .top-nav-grain {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
                }
            `}} />

            {/* Container with Glassmorphism */}
            <div
                className="flex items-center p-2 rounded-[24px] border shadow-2xl overflow-hidden relative"
                style={{
                    backgroundColor: "rgba(18, 18, 20, 0.6)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                {/* 1. Film grain noise overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-100 mix-blend-overlay top-nav-grain z-0" />

                {/* 2. Radial ambient glow (behind everything but inside container) */}
                <div
                    className="absolute inset-[10%] pointer-events-none opacity-30 rounded-full blur-3xl z-0 transition-colors duration-500"
                    style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
                    }}
                />

                {/* Navigation area */}
                <div className="relative flex items-center z-10">
                    {/* Golden Active Indicator Ring */}
                    <div
                        className="absolute top-0 bottom-0 w-[52px] pointer-events-none"
                        style={{
                            left: `${activeIdx * 52}px`, // each button is 52px wide (w-13)
                            transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)",
                            transform: `translateX(0px)`, // Just handling left property for movement
                        }}
                    >
                        {/* Layer 1: Glow - behind the ring blurred warm gold */}
                        <div className="absolute inset-[-4px] rounded-[22px] bg-[#e8af48] opacity-15 blur-[10px]" />

                        {/* Layer 2: Clip Container */}
                        <div className="absolute inset-0 rounded-[18px] overflow-hidden isolate">
                            {/* Layer 3: Rotating conic-gradient */}
                            <div
                                className="absolute w-[200%] h-[200%] top-1/2 left-1/2 animate-custom-spin"
                                style={{
                                    background: `conic-gradient(
                                        from 0deg, 
                                        #533517 0%, 
                                        #c49746 15%, 
                                        #feeaa5 28%, 
                                        #ffffff 30.5%, 
                                        #ffc0cb 32%, 
                                        #87ceeb 33.5%, 
                                        #c49746 45%, 
                                        #533517 50%, 
                                        #533517 50%, 
                                        #c49746 65%, 
                                        #feeaa5 78%, 
                                        #ffffff 80.5%, 
                                        #ffc0cb 82%, 
                                        #87ceeb 83.5%, 
                                        #c49746 95%, 
                                        #533517 100%
                                    )`
                                }}
                            />
                        </div>

                        {/* Layer 4: Inner Plate - leaving exactly 2px ring visible */}
                        <div
                            className="absolute inset-[2px] rounded-[16px] backdrop-blur-md transition-colors duration-500"
                            style={{
                                backgroundColor: "rgba(18, 18, 20, 0.95)",
                            }}
                        />
                    </div>

                    {/* Buttons */}
                    {navItems.map((item, idx) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveIdx(idx)}
                            className="relative z-10 w-[52px] h-[48px] flex flex-col items-center justify-center rounded-2xl transition-colors duration-300 gap-1"
                            style={{
                                color: activeIdx === idx ? "#e8af48" : "rgba(255,255,255,0.6)"
                            }}
                        >
                            <span className={activeIdx === idx ? "opacity-100" : "opacity-90 hover:opacity-100 transition-opacity"}>
                                {item.icon}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Extremely subtle ambient glow behind the entire nav to separate from background */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] rounded-[100px] blur-[60px] pointer-events-none -z-10 transition-opacity duration-700"
                style={{
                    background: "rgba(255,255,255,0.03)"
                }}
            />
        </div>
    );
}

// Minimal thin stroke SVG icons (strokeWidth 1.5)
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function InsertIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}


