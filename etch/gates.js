export function createGateChain({ width, height }) {
  // signal: { type: "vector", dx, dy } => command: { type: "nudge", dx, dy } or null

  return function gateChain(signal, cursor) {
    if (!signal) return null;

    if (signal.type === "clear") {
      return { type: "clear" };
    }

    if (signal.type === "vector") {
      const dx = signal.dx;
      const dy = signal.dy;

      // If device is centered (dead), noop
      if (dx === 0 && dy === 0) return null;

      const nx = cursor.x + dx;
      const ny = cursor.y + dy;

      // Boundary gate: noop (no command) if it would go out of bounds
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return null;

      return { type: "nudge", dx, dy };
    }

    return null;
  };
}
