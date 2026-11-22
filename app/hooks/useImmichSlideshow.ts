// app/hooks/useImmichSlideshow.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const SLIDESHOW_INTERVAL_MS = 30000; // Change photo every 30 seconds

export interface PhotoMeta {
    takenAt: string | null;
    location: string | null;
}

export function useImmichSlideshow(mode: "preview" | "full") {
    const [now, setNow] = useState<Date | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [photoMeta, setPhotoMeta] = useState<PhotoMeta>({ takenAt: null, location: null });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    const requestIdRef = useRef<number>(0);

    const fetchNewImage = useCallback(() => {
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
            setPhotoMeta(nextMeta);
            setImageUrl(nextUrl);
            setIsLoading(false);
            setHasError(false);
        };

        preloader.onerror = () => {
            if (requestId !== requestIdRef.current) return;
            setIsLoading(false);
            setHasError(true);
        };
    }, [mode]);

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
        togglePlay,
        fetchNewImage,
    };
}