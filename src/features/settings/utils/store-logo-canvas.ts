export const STORE_LOGO_OUTPUT_SIZE = 512;
export const STORE_LOGO_PREVIEW_SIZE = 288;
export const STORE_LOGO_SOURCE_MAX_BYTES = 10 * 1024 * 1024;

export type LogoCropTransform = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export function getCoverScale(
  imageWidth: number,
  imageHeight: number,
  frameSize: number,
  zoom: number
) {
  const baseScale = Math.max(frameSize / imageWidth, frameSize / imageHeight);
  return baseScale * zoom;
}

export function getDrawDimensions(
  imageWidth: number,
  imageHeight: number,
  frameSize: number,
  zoom: number
) {
  const scale = getCoverScale(imageWidth, imageHeight, frameSize, zoom);

  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
  };
}

export function clampOffset(
  offsetX: number,
  offsetY: number,
  drawWidth: number,
  drawHeight: number,
  frameSize: number
) {
  const minX = frameSize - drawWidth;
  const minY = frameSize - drawHeight;

  return {
    offsetX: Math.min(0, Math.max(minX, offsetX)),
    offsetY: Math.min(0, Math.max(minY, offsetY)),
  };
}

export function getCenteredOffset(
  drawWidth: number,
  drawHeight: number,
  frameSize: number
) {
  return {
    offsetX: (frameSize - drawWidth) / 2,
    offsetY: (frameSize - drawHeight) / 2,
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function drawCroppedCanvas(
  image: HTMLImageElement,
  transform: LogoCropTransform,
  previewSize: number,
  outputSize: number
) {
  const { width: drawWidth, height: drawHeight } = getDrawDimensions(
    image.naturalWidth,
    image.naturalHeight,
    previewSize,
    transform.zoom
  );

  const { offsetX, offsetY } = clampOffset(
    transform.offsetX,
    transform.offsetY,
    drawWidth,
    drawHeight,
    previewSize
  );

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas not supported');
  }

  const scaleFactor = outputSize / previewSize;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    offsetX * scaleFactor,
    offsetY * scaleFactor,
    drawWidth * scaleFactor,
    drawHeight * scaleFactor
  );

  return canvas;
}

export async function exportCroppedLogo(
  image: HTMLImageElement,
  transform: LogoCropTransform,
  previewSize: number = STORE_LOGO_PREVIEW_SIZE,
  outputSize: number = STORE_LOGO_OUTPUT_SIZE
): Promise<{ blob: Blob; mimeType: 'image/webp' | 'image/png' }> {
  const canvas = await drawCroppedCanvas(
    image,
    transform,
    previewSize,
    outputSize
  );

  const webpQualities = [0.92, 0.85, 0.75, 0.65];

  for (const quality of webpQualities) {
    const webpBlob = await canvasToBlob(canvas, 'image/webp', quality);

    if (webpBlob) {
      return { blob: webpBlob, mimeType: 'image/webp' };
    }
  }

  const pngBlob = await canvasToBlob(canvas, 'image/png');

  if (!pngBlob) {
    throw new Error('Canvas export failed');
  }

  return { blob: pngBlob, mimeType: 'image/png' };
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed'));
    image.src = src;
  });
}

export function isAllowedLogoSourceFile(file: File) {
  return ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
}
