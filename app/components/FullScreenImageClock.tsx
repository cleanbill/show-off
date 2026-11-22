// app/components/FullScreenImageClock.tsx
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useImmichSlideshow } from "../hooks/useImmichSlideshow";
import { useEffect } from "react";

const outlinedNumberStyle: CSSProperties = {
    WebkitTextStroke: "3px #000000",
    paintOrder: "stroke fill",
};

const outlinedMetaStyle: CSSProperties = {
    WebkitTextStroke: "1.5px #000000",
    paintOrder: "stroke fill",
};

export default function FullScreenImageClock() {
    const {
        formattedDate,
        formattedTime,
        imageUrl,
        photoMeta,
        isLoading,
        hasError,
        isPlaying,
        canGoPrevious,
        togglePlay,
        fetchNewImage,
        goPrevious,
    } = useImmichSlideshow("full");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            const target = event.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable)
            ) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrevious();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                fetchNewImage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goPrevious, fetchNewImage]);

    const detailsText = [photoMeta.location, photoMeta.takenAt].filter(Boolean).join(" · ");

    return (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-black overflow-hidden select-none">
            {!imageUrl && isLoading && (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    Loading full-size photo from Immich...
                </div>
            )}

            {!imageUrl && hasError && (
                <div className="w-full h-full flex items-center justify-center text-red-400 px-4">
                    <p className="font-medium">Unable to load photo from Immich</p>
                </div>
            )}

            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Full-size random photo from Immich"
                    className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? "opacity-80" : "opacity-100"
                        }`}
                />
            )}

            {/* Floating top clock overlay */}
            <div className="absolute top-0 inset-x-0 flex items-start justify-between gap-4 px-5 py-4 text-white pointer-events-none">
                <span
                    style={outlinedMetaStyle}
                    className="text-sm sm:text-base uppercase tracking-wider text-white truncate mt-1"
                >
                    {formattedDate ?? "Loading date..."}
                </span>
                <span
                    style={outlinedNumberStyle}
                    className="text-5xl sm:text-7xl lg:text-8xl font-mono font-bold tabular-nums leading-none text-white"
                >
                    {formattedTime ?? "--:--:--"}
                </span>
            </div>

            {/* Subtle bottom-left EXIF location & timestamp + bottom-right controls */}
            <div className="absolute bottom-0 inset-x-0 flex items-end justify-between gap-4 px-4 py-3 pointer-events-none">
                <div
                    style={outlinedMetaStyle}
                    className="min-w-0 text-xs sm:text-sm text-white truncate"
                >
                    {hasError && imageUrl
                        ? "Retry failed — keeping current photo"
                        : isLoading && imageUrl
                            ? "Loading next photo..."
                            : detailsText}
                </div>

                <div className="flex items-center gap-2 shrink-0 pointer-events-auto opacity-65 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                        onClick={togglePlay}
                        className="px-3 py-1.5 text-xs bg-zinc-900/75 hover:bg-zinc-800 text-zinc-200 font-medium rounded-md border border-white/10 transition cursor-pointer backdrop-blur-xs"
                    >
                        {isPlaying ? "Pause" : "Resume"}
                    </button>

                    <button
                        onClick={fetchNewImage}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs bg-zinc-900/75 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 font-medium rounded-md border border-white/10 transition cursor-pointer backdrop-blur-xs"
                    >
                        {isLoading ? "Loading..." : "Next"}
                    </button>

                    <button
                        onClick={goPrevious}
                        disabled={!canGoPrevious}
                        className="px-3 py-1.5 text-xs bg-zinc-900/75 hover:bg-zinc-800 disabled:opacity-30 text-zinc-200 font-medium rounded-md border border-white/10 transition cursor-pointer backdrop-blur-xs"
                    >
                        Prev
                    </button>

                    <Link
                        href="/"
                        className="px-3 py-1.5 text-xs bg-zinc-900/75 hover:bg-zinc-800 text-zinc-200 font-medium rounded-md border border-white/10 transition backdrop-blur-xs"
                    >
                        Standard
                    </Link>
                </div>
            </div>
        </div>
    );
}