// Client-side image helpers: resize to max 1280px JPEG and basic quality checks.
export const MAX_DIM = 1280;

function drawToCanvas(source: CanvasImageSource, w: number, h: number) {
  const scale = Math.min(1, MAX_DIM / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function fileToResizedDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return drawToCanvas(img, img.naturalWidth, img.naturalHeight).toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function captureVideoFrame(video: HTMLVideoElement): string {
  return drawToCanvas(video, video.videoWidth, video.videoHeight).toDataURL("image/jpeg", 0.8);
}

/** Returns "dark" | "blurry" | "ok" using a tiny downscaled sample. */
export function checkFrameQuality(video: HTMLVideoElement): "dark" | "blurry" | "ok" {
  const w = 64, h = 48;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(video, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const lum: number[] = [];
  for (let i = 0; i < d.length; i += 4) lum.push(0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!);
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  if (mean < 35) return "dark";
  // edge energy (simple horizontal/vertical differences)
  let edge = 0;
  for (let y = 0; y < h - 1; y++)
    for (let x = 0; x < w - 1; x++) {
      const i = y * w + x;
      edge += Math.abs(lum[i]! - lum[i + 1]!) + Math.abs(lum[i]! - lum[i + w]!);
    }
  if (edge / (w * h) < 4) return "blurry";
  return "ok";
}
