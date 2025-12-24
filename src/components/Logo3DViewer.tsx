import { useEffect, useRef, useState, useCallback } from "react";
import logo3d from "@/assets/tradenotes-logo-3d.png";

interface Logo3DViewerProps {
  size?: number;
}

export function Logo3DViewer({ size = 120 }: Logo3DViewerProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">("loading");
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Debug signal (visible in console)
    console.log("[Logo3DViewer] mounted", { size, src: logo3d });
  }, [size]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;

      setRotation((prev) => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      lastPosition.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging],
  );

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    lastPosition.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPosition.current.x;
      const deltaY = touch.clientY - lastPosition.current.y;

      setRotation((prev) => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      lastPosition.current = { x: touch.clientX, y: touch.clientY };
    },
    [isDragging],
  );

  return (
    <div
      style={{ width: size, height: size, perspective: "800px" }}
      className={
        "select-none " +
        (isDragging ? "cursor-grabbing" : "cursor-grab")
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDragging}
      aria-label="3D Logo (klicken & ziehen zum Drehen)"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          overflow: "hidden",
          borderRadius: "8px",
        }}
        className="relative flex items-center justify-center"
      >
        <img
          src={logo3d}
          alt="TradeNotes 3D Logo"
          className="mix-blend-lighten"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: "scale(2.2) translateY(3%)",
            filter: "drop-shadow(0 0 15px hsl(var(--primary) / 0.5))",
          }}
          draggable={false}
          onLoad={() => {
            console.log("[Logo3DViewer] image loaded");
            setImgStatus("loaded");
          }}
          onError={(e) => {
            console.error("[Logo3DViewer] image failed to load", e);
            setImgStatus("error");
          }}
        />

        {imgStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Logo nicht geladen
          </div>
        )}
      </div>
    </div>
  );
}

