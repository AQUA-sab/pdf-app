"use client";

import { useState, useEffect } from "react";

export function FloatingNav() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [isDark, setIsDark] = useState(true); // Default dark as requested
    const [isBouncing, setIsBouncing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize theme
        if (isDark) {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const handleThemeToggle = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        setIsBouncing(true);
        setTimeout(() => {
            setIsBouncing(false);
        }, 400); // matches the CSS bounce animation
    };

    const navItems = [
        { name: "Home", icon: <HomeIcon className="w-5 h-5" /> },
        { name: "Search", icon: <SearchIcon className="w-5 h-5" /> },
        { name: "User", icon: <UserIcon className="w-5 h-5" /> },
    ];

    if (!mounted) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            {/* Container with Glassmorphism */}
            <div
                className="flex items-center p-2 rounded-[24px] border shadow-2xl overflow-hidden relative"
                style={{
                    backgroundColor: isDark ? "rgba(20, 20, 20, 0.65)" : "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)",
                }}
            >
                {/* Film grain overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay nav-grain-bg" />

                {/* Radial ambient glow (behind everything) */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        background: `radial-gradient(circle at center, ${isDark ? "#e8af48" : "#000"} 0%, transparent 80%)`,
                    }}
                />

                {/* Navigation area */}
                <div className="relative flex items-center p-1 z-10 gap-1">
                    {/* Active Indicator Background */}
                    <div
                        className="absolute top-1 bottom-1 w-12 rounded-[18px] pointer-events-none"
                        style={{
                            left: `${4 + activeIdx * 52}px`, // 4px init pad + (48px width + 4px gap) * idx
                            transition: "all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)",
                        }}
                    >
                        {/* Glow behind the ring */}
                        <div className="absolute inset-[-6px] rounded-[24px] bg-[#e8af48] opacity-20 blur-md" />

                        {/* Clip Container */}
                        <div className="absolute inset-0 rounded-[18px] overflow-hidden">
                            {/* Rotating Conic Gradient */}
                            <div
                                className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] conic-ring-spin"
                                style={{
                                    background: "repeating-conic-gradient(from 0deg, #533517 0%, #c49746 10%, #feeaa5 20%, #c49746 25%, #533517 35%, #ffffff 36.5%, #ffc0cb 38%, #87ceeb 39.5%, #ffffff 41%, #533517 42.5%, #533517 50%)"
                                }}
                            />
                        </div>

                        {/* Inner Plate */}
                        <div
                            className="absolute inset-[2px] rounded-[16px]"
                            style={{
                                backgroundColor: isDark ? "#1c1c1c" : "#fafafa",
                                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)"
                            }}
                        />
                    </div>

                    {/* Buttons */}
                    {navItems.map((item, idx) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveIdx(idx)}
                            className="relative z-10 w-12 h-12 flex items-center justify-center rounded-2xl transition-colors duration-300"
                            style={{
                                color: activeIdx === idx
                                    ? (isDark ? "#fff" : "#000")
                                    : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)")
                            }}
                        >
                            {item.icon}
                        </button>
                    ))}
                </div>

                {/* Subtle Divider */}
                <div
                    className="w-[1px] h-8 mx-2 z-10"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
                />

                {/* Theme Toggle Button */}
                <button
                    onClick={handleThemeToggle}
                    className={`relative z-10 w-12 h-12 mr-1 flex items-center justify-center rounded-2xl transition-colors ${isBouncing ? "bounce-anim" : ""}`}
                    style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}
                >
                    {/* Sun & Moon Icons with rotate/fade effect */}
                    <div className="relative w-6 h-6">
                        <div
                            className="absolute inset-0 transition-all duration-500 will-change-transform"
                            style={{
                                opacity: isDark ? 0 : 1,
                                transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
                            }}
                        >
                            <SunIcon className="w-6 h-6" />
                        </div>
                        <div
                            className="absolute inset-0 transition-all duration-500 will-change-transform"
                            style={{
                                opacity: isDark ? 1 : 0,
                                transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
                            }}
                        >
                            <MoonIcon className="w-6 h-6" />
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

// Minimal thin stroke SVG icons
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    );
}
