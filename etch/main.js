import { createEtchCore } from "./etch-core.js";
import { createReel } from "./reel.js";
import { createRenderer } from "./renderer.js";
import { createGateChain } from "./gates.js";
import { createVectorKnobDevice } from "./devices/vectorknob.js";

const canvas = document.getElementById("etchCanvas");
if (!canvas) throw new Error("Missing #etchCanvas");

const width = canvas.width;
const height = canvas.height;

// 1) renderer
const renderer = createRenderer({ canvas, width, height });

// 2) reel (tape)
const reel = createReel({ width, height });

// 3) gate chain (signal -> command or noop)
const gateChain = createGateChain({ width, height });

// 4) etch core (owns sampling + applying commands)
const etch = createEtchCore({
  reel,
  renderer,
  gateChain,
});

// 5) device (knob) self-registers with register function ONLY
createVectorKnobDevice({
  knobEl: document.getElementById("etchKnob"),
  register: etch.registerDevice,
});

// draw initial frame
etch.render();

// sampling loop
function loop() {
  etch.step();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
