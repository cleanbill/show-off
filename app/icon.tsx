import { ImageResponse } from "next/og";

export const size = {
    width: 32,
    height: 32,
};

export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#09090b",
                    borderRadius: "7px",
                    border: "2px solid #3f3f46",
                    position: "relative",
                }}
            >
                {/* Inner photo frame */}
                <div
                    style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        border: "2px solid #e4e4e7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        backgroundColor: "#18181b",
                    }}
                >
                    {/* Clock hands */}
                    <div
                        style={{
                            position: "absolute",
                            top: "4px",
                            left: "9px",
                            width: "2px",
                            height: "7px",
                            backgroundColor: "#38bdf8",
                            borderRadius: "1px",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "9px",
                            left: "9px",
                            width: "6px",
                            height: "2px",
                            backgroundColor: "#f4f4f5",
                            borderRadius: "1px",
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}