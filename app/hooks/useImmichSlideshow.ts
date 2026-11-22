// app/hooks/useImmichSlideshow.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const SLIDESHOW_INTERVAL_MS = 30000; // Change photo every 30 seconds

export interface PhotoMeta {
    takenAt: string | null;
    location: string | null;
}

interface SlideItem {
    imageUrl: string;
    photoMeta: PhotoMeta;
}

export function useImmichSlideshow(mode: "preview" | "full") {
    const [now, setNow] = useState<Date | null>(null);
    const [history, setHistory] = useState<SlideItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    const requestIdRef = useRef<number>(0);
    const historyRef = useRef<SlideItem[]>([]);
    const indexRef = useRef<number>(-1);

    historyRef.current = history;
    indexRef.current = historyIndex;

    const currentSlide = historyIndex >= 0 ? history[historyIndex] : undefined;
    const imageUrl = currentSlide?.imageUrl ?? "";
    const photoMeta = currentSlide?.photoMeta ?? { takenAt: null, location: null };

    const goToIndex = useCallback((targetIndex: number) => {
        const items = historyRef.current;
        if (targetIndex < 0 || targetIndex >= items.length) return;
        requestIdRef.current += 1;
        setHistoryIndex(targetIndex);
        setIsLoading(false);
        setHasError(false);
    }, []);

    const fetchNewImage = useCallback(() => {
        const currentIdx = indexRef.current;
        const items = historyRef.current;

        // If we stepped back in history, ArrowRight / next moves forward first
        if (currentIdx >= 0 && currentIdx < items.length - 1) {
            goToIndex(currentIdx + 1);
            return;
        }

        const requestId = ++requestIdRef.current;
        const stamp = Date.now();
        const nextUrl = `/api/random-photo?mode=${mode}&t=${stamp}`;
        const metaUrl = `/api/random-photo?mode=${mode}&meta=1&t=${stamp}`;

        setIsLoading(true);
        setHasError(false);

        const preloader = new window.Image();
        preloader.src = nextUrl;

        preloader.onload = async () => {
            if (requestId !== requestIdRef.current) return;

            let nextMeta: PhotoMeta = { takenAt: null, location: null };
            try {
                const res = await fetch(metaUrl, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    nextMeta = {
                        takenAt: data.takenAt ?? null,
                        location: data.location ?? null,
                    };
                }
            } catch {
                // Keep photo even if metadata lookup fails
            }

            if (requestId !== requestIdRef.current) return;

            const newSlide: SlideItem = { imageUrl: nextUrl, photoMeta: nextMeta };
            setHistory((prev) => {
                const base = prev.slice(0, indexRef.current + 1);
                const updated = [...base, newSlide];
                setHistoryIndex(updated.length - 1);
                return updated;
            });
            setIsLoading(false);
            setHasError(false);
        };

        preloader.onerror = () => {
            if (requestId !== requestIdRef.current) return;
            setIsLoading(false);
            setHasError(true);
        };
    }, [mode, goToIndex]);

    const goPrevious = useCallback(() => {
        if (indexRef.current > 0) {
            goToIndex(indexRef.current - 1);
        }
    }, [goToIndex]);

    const canGoPrevious = historyIndex > 0;

    useEffect(() => {
        setNow(new Date());
        fetchNewImage();

        const clockTimer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(clockTimer);
    }, [fetchNewImage]);

    useEffect(() => {
        if (!isPlaying) return;

        const slideTimer = setInterval(() => {
            fetchNewImage();
        }, SLIDESHOW_INTERVAL_MS);

        return () => clearInterval(slideTimer);
    }, [isPlaying, fetchNewImage]);

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    const formattedDate = now?.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = now?.toLocaleTimeString();

    return {
        now,
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
    };
}