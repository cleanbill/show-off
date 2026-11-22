// app/components/FullScreenImageClock.tsx
"use client";

import Link from "next/link";
import { useImmichSlideshow } from "../hooks/useImmichSlideshow";

export default function FullScreenImageClock() {
    const {
        formattedDate,
        formattedTime,
        imageUrl,
        photoMeta,
        isLoading,
        hasError,
        isPlaying,
        togglePlay,
        fetchNewImage,
    } = useImmichSlideshow("full");

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
            <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 px-5 py-3 bg-gradient-to-b from-black/65 via-black/25 to-transparent text-white pointer-events-none">
                <span className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300/90 drop-shadow truncate">
                    {formattedDate ?? "Loading date..."}
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold tabular-nums drop-shadow">
                    {formattedTime ?? "--:--:--"}
                </span>
            </div>

            {/* Subtle bottom-left EXIF location & timestamp + bottom-right controls */}
            <div className="absolute bottom-0 inset-x-0 flex items-end justify-between gap-4 px-4 py-3 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none">
                <div className="min-w-0 text-xs sm:text-sm text-zinc-300/85 drop-shadow truncate">
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