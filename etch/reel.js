export function createReel({ width, height }) {
  const commands = [];
  const buffer = new Uint8Array(width * height);

  const cursor = {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2),
  };

  function index(x, y) {
    return y * width + x;
  }

  function clear() {
    buffer.fill(0);
    cursor.x = Math.floor(width / 2);
    cursor.y = Math.floor(height / 2);
  }

  function setPixel(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    buffer[index(x, y)] = 1;
  }

  function applyCommand(cmd) {
    if (cmd.type === "clear") {
      clear();
      return;
    }

    if (cmd.type === "nudge") {
      const nx = cursor.x + cmd.dx;
      const ny = cursor.y + cmd.dy;

      // NOTE: boundary noop is enforced by gates, but keep this safe.
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

      cursor.x = nx;
      cursor.y = ny;
      setPixel(cursor.x, cursor.y);
    }
  }

  function append(cmd) {
    commands.push(cmd);
  }

  function applyLast() {
    const last = commands[commands.length - 1];
    if (!last) return;
    applyCommand(last);
  }

  function applyAll() {
    clear();
    for (const c of commands) applyCommand(c);
  }

  return {
    commands,
    append,
    applyLast,
    applyAll,
    getBuffer: () => buffer,
    getCursor: () => ({ x: cursor.x, y: cursor.y }),
  };
}
