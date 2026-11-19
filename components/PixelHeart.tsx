import { memo } from "react";

type PixelHeartProps = {
  className?: string;
};

// A true pixel-art heart drawn on an 11 x 10 grid. Each "#" becomes a square,
// rendered with crisp edges so it reads as 8-bit art rather than a smooth icon.
const HEART_MATRIX = [
  "01100000110",
  "11110001111",
  "11111011111",
  "11111111111",
  "11111111111",
  "01111111110",
  "00111111100",
  "00011111000",
  "00001110000",
  "00000100000",
];

function PixelHeart({ className = "" }: PixelHeartProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 11 10"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {HEART_MATRIX.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" || cell === "1" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
          ) : null
        )
      )}
    </svg>
  );
}

export default memo(PixelHeart);
