// app/components/ImageClockDisplay.tsx
"use client";

import Link from "next/link";
import { useImmichSlideshow } from "../hooks/useImmichSlideshow";

export default function ImageClockDisplay() {
    const {
        now,
        formattedDate,
        formattedTime,
        imageUrl,
        isLoading,
        hasError,
        isPlaying,
        togglePlay,
        fetchNewImage,
    } = useImmichSlideshow("preview");

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
            <div className="text-center bg-zinc-900 text-white px-6 py-4 rounded-xl shadow-md w-full">
                {now ? (
                    <>
                        <p className="text-sm uppercase tracking-widest text-zinc-400">
                            {formattedDate}
                        </p>
                        <p className="text-4xl font-mono font-bold mt-1 tabular-nums">
                            {formattedTime}
                        </p>
                    </>
                ) : (
                    <p className="text-xl font-mono py-3">Loading clock...</p>
                )}
            </div>

            <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                {!imageUrl && isLoading && (
                    <div className="text-zinc-300">Loading from Immich...</div>
                )}

                {!imageUrl && hasError && (
                    <div className="text-center text-red-400 px-4">
                        <p className="font-medium">Unable to load photo from Immich</p>
                        <p className="text-sm text-zinc-400 mt-1">
                            Check IMMICH_URL and IMMICH_API_KEY, then try again.
                        </p>
                    </div>
                )}

                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Random photo from Immich"
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? "opacity-80" : "opacity-100"
                            }`}
                    />
                )}

                {imageUrl && (isLoading || hasError) && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-zinc-950/75 text-xs text-zinc-300 backdrop-blur-xs">
                        {hasError ? "Retry failed — keeping current photo" : "Loading next..."}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={togglePlay}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg shadow transition cursor-pointer"
                >
                    {isPlaying ? "Pause Slideshow" : "Resume Slideshow"}
                </button>

                <button
                    onClick={fetchNewImage}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow transition cursor-pointer"
                >
                    {isLoading ? "Loading..." : "Next Random Photo"}
                </button>

                <Link
                    href="/full"
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg shadow transition"
                >
                    Full Size Mode
                </Link>
            </div>
        </div>
    );
}