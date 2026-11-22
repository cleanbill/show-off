import { NextRequest, NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;

interface ImmichExifInfo {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    dateTimeOriginal?: string | null;
}

interface ImmichAsset {
    id: string;
    fileCreatedAt?: string;
    localDateTime?: string;
    exifInfo?: ImmichExifInfo | null;
}

function formatPhotoMeta(asset: ImmichAsset) {
    const exif = asset.exifInfo ?? {};
    const rawDate = exif.dateTimeOriginal || asset.localDateTime || asset.fileCreatedAt || null;

    let takenAt: string | null = null;
    if (rawDate) {
        const parsed = new Date(rawDate);
        if (!Number.isNaN(parsed.getTime())) {
            takenAt = parsed.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
        }
    }

    const locationParts = [exif.city, exif.state, exif.country].filter(
        (part): part is string => Boolean(part && part.trim())
    );
    const location = locationParts.length > 0 ? locationParts.join(", ") : null;

    return { takenAt, location };
}

export async function GET(request: NextRequest) {
    const immichUrl = process.env.IMMICH_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const apiKey = process.env.IMMICH_API_KEY;

    if (!immichUrl || !apiKey) {
        return NextResponse.json(
            { error: "Missing IMMICH_URL or IMMICH_API_KEY" },
            { status: 500 }
        );
    }

    const isFull = request.nextUrl.searchParams.get("mode") === "full";
    const metaOnly = request.nextUrl.searchParams.get("meta") === "1";

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
    };

    try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const searchRes = await fetch(`${immichUrl}/api/search/random`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    type: "IMAGE",
                    size: 1,
                    withDeleted: false,
                    withExif: true,
                }),
                cache: "no-store",
            });

            if (!searchRes.ok) {
                throw new Error(`Immich search failed: ${searchRes.status} ${searchRes.statusText}`);
            }

            const assets = (await searchRes.json()) as ImmichAsset[];
            if (!Array.isArray(assets) || assets.length === 0) {
                return NextResponse.json({ error: "No images found" }, { status: 404 });
            }

            const asset = assets[0];
            const assetId = asset.id;
            const endpoints = isFull
                ? [
                    `${immichUrl}/api/assets/${assetId}/original`,
                    `${immichUrl}/api/assets/${assetId}/thumbnail?size=preview`,
                    `${immichUrl}/api/assets/${assetId}/thumbnail?size=thumbnail`,
                ]
                : [
                    `${immichUrl}/api/assets/${assetId}/thumbnail?size=preview`,
                    `${immichUrl}/api/assets/${assetId}/thumbnail?size=thumbnail`,
                    `${immichUrl}/api/assets/${assetId}/original`,
                ];

            for (const url of endpoints) {
                const imageRes = await fetch(url, {
                    headers: { "x-api-key": apiKey },
                    cache: "no-store",
                });

                if (imageRes.ok) {
                    if (metaOnly) {
                        const meta = formatPhotoMeta(asset);
                        return NextResponse.json(meta, {
                            headers: { "Cache-Control": "no-store, max-age=0" },
                        });
                    }

                    return new Response(imageRes.body, {
                        headers: {
                            "Content-Type": imageRes.headers.get("Content-Type") || "image/jpeg",
                            "Cache-Control": "no-store, max-age=0",
                        },
                    });
                }

                if (imageRes.status !== 404) {
                    throw new Error(
                        `Image fetch ${imageRes.status} (${imageRes.statusText}) for asset ${assetId} (${url})`
                    );
                }
            }

            console.warn(`No image found for asset ${assetId} (attempt ${attempt}/${MAX_ATTEMPTS})`);
        }

        return NextResponse.json(
            { error: "Could not find a random image" },
            { status: 404 }
        );
    } catch (error) {
        console.error("Immich proxy error:", error);
        return NextResponse.json(
            { error: "Failed to load image from Immich" },
            { status: 500 }
        );
    }
}