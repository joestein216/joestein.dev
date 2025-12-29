export function createEtchCore({ reel, renderer, gateChain }) {
  let device = null;

  function registerDevice(d) {
    device = d;
  }

  function step() {
    if (!device) return;

    // device emits signal (state), not commands
    const signal = device.sample();
    if (!signal) return;

    // gates decide whether this becomes a command
    const command = gateChain(signal, reel.getCursor());
    if (!command) return;

    reel.append(command);
    reel.applyLast(); // micro-step: apply only the new command
    renderer.draw(reel.getBuffer());
  }

  function render() {
    renderer.draw(reel.getBuffer());
  }

  return { registerDevice, step, render };
}
