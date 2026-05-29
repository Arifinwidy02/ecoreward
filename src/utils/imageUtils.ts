import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';
import { decode } from 'jpeg-js';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = global.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function centerCropRGB(
  data: Uint8Array,
  srcW: number,
  srcH: number,
  targetSize: number,
): Float32Array {
  const out = new Float32Array(targetSize * targetSize * 3);
  const offsetX = Math.floor((srcW - targetSize) / 2);
  const offsetY = Math.floor((srcH - targetSize) / 2);

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const srcIdx = ((offsetY + y) * srcW + (offsetX + x)) * 4;
      const dstIdx = (y * targetSize + x) * 3;
      out[dstIdx] = data[srcIdx]! / 255.0;
      out[dstIdx + 1] = data[srcIdx + 1]! / 255.0;
      out[dstIdx + 2] = data[srcIdx + 2]! / 255.0;
    }
  }
  return out;
}

export async function preprocessImage(
  uri: string,
  targetSize: number,
): Promise<ArrayBuffer> {
  const actualUri = uri.startsWith('file://') ? uri.slice(7) : uri;

  const resizedUri = await ImageResizer.createResizedImage(
    actualUri,
    targetSize,
    targetSize,
    'JPEG',
    100,
    undefined,
    undefined,
    false,
    { mode: 'cover' },
  );

  const jpegBase64 = await RNFS.readFile(resizedUri.uri, 'base64');
  const jpegBytes = base64ToUint8Array(jpegBase64);
  const rawImage = decode(jpegBytes, { useTArray: true });

  const { width, height, data } = rawImage;
  console.log('[ImageUtils] Decoded image:', width, 'x', height, 'target:', targetSize);

  let floatData: Float32Array;
  if (width === targetSize && height === targetSize) {
    floatData = new Float32Array(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      floatData[i * 3] = data[i * 4]! / 255.0;
      floatData[i * 3 + 1] = data[i * 4 + 1]! / 255.0;
      floatData[i * 3 + 2] = data[i * 4 + 2]! / 255.0;
    }
  } else {
    console.log('[ImageUtils] Dimensions mismatch, applying center crop from', width, 'x', height, 'to', targetSize, 'x', targetSize);
    floatData = centerCropRGB(data, width, height, targetSize);
  }

  return floatData.buffer.slice(
    floatData.byteOffset,
    floatData.byteOffset + floatData.byteLength,
  );
}
