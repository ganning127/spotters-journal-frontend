import { useState, useRef } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  zoomLevel?: number;
  className?: string;
}

export function ImageMagnifier({ src, alt = "", zoomLevel = 3.5, className }: ImageMagnifierProps) {
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });
  const imgRef = useRef<HTMLImageElement>(null);
  const lensSize = 120; // Size of the circular lens

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();

    // Calculate cursor position relative to the image
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Check if within bounds
    if (x < 0 || y < 0 || x > width || y > height) {
      setZoomStyle({ display: "none" });
      return;
    }

    setZoomStyle({
      display: "block",
      position: "absolute",
      left: `${x - lensSize / 2}px`,
      top: `${y - lensSize / 2}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      // Scale background size based on the rendered image size * zoom level
      backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
      // Position background to match what's under the lens
      backgroundPosition: `-${(x * zoomLevel) - lensSize / 2}px -${(y * zoomLevel) - lensSize / 2}px`,
      borderRadius: "50%",
      border: "2px solid white",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      pointerEvents: "none",
      zIndex: 50,
      backgroundColor: "white", // Fallback
    });
  };

  return (
    <div
      className={cn("relative overflow-hidden cursor-crosshair group rounded-lg", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setZoomStyle({ display: "none" })}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-auto object-contain block" // Ensure block display to remove bottom gap
      />
      <div style={zoomStyle} className="shadow-2xl" />
    </div>
  );
}
