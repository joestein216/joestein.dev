// etch/renderer.js
export function createRenderer({ canvas, width, height }) {
  // alpha:true is important so the canvas can actually be transparent
  const ctx = canvas.getContext("2d", { alpha: true });

  // We keep one ImageData and reuse it (no churn)
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  function draw(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      const p = i * 4;

      if (buffer[i]) {
        // "ink" pixel (black, opaque)
        data[p + 0] = 0;
        data[p + 1] = 0;
        data[p + 2] = 0;
        data[p + 3] = 255;
      } else {
        // transparent pixel (let your CSS screen show through)
        data[p + 3] = 0;
      }
    }

    // Clear the previous frame before putting new transparent pixels
    // (otherwise old pixels can linger depending on browser compositing)
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
  }

  return { draw };
}
