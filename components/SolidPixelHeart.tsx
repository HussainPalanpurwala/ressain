type SolidPixelHeartProps = {
  className?: string;
};

// Same pixel silhouette as PixelHeart, but drawn as one filled path instead of
// individual squares — no seams/grid lines when the heart is scaled up.
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

function buildPath() {
  let path = "";
  HEART_MATRIX.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== "1") {
        x += 1;
        continue;
      }
      const start = x;
      while (x < row.length && row[x] === "1") x += 1;
      const width = x - start;
      path += `M${start} ${y}h${width}v1h-${width}z`;
    }
  });
  return path;
}

const HEART_PATH = buildPath();

export default function SolidPixelHeart({ className = "" }: SolidPixelHeartProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 11 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  );
}
