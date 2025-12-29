export function createVectorKnobDevice({ knobEl, register }) {
  if (!knobEl) throw new Error("Missing #etchKnob");

  const cap = knobEl.querySelector(".vk-cap");
  if (!cap) throw new Error("Missing .vk-cap inside #etchKnob");

  // device internal state (signal)
  let state = { x: 0, y: 0, strength: 0 };

  let dragging = false;

  function setVisual(nx, ny, strength, deg) {
    // lean cap less than pointer travel
    const maxLean =
      parseFloat(getComputedStyle(knobEl).getPropertyValue("--vk-max-lean")) || 12;
    const lean = strength * maxLean;

    cap.style.setProperty("--vk-x", `${(nx * lean).toFixed(2)}px`);
    cap.style.setProperty("--vk-y", `${(ny * lean).toFixed(2)}px`);
    cap.style.setProperty("--vk-rot", `${deg.toFixed(2)}deg`);
  }

  function center() {
    state = { x: 0, y: 0, strength: 0 };
    cap.style.setProperty("--vk-x", `0px`);
    cap.style.setProperty("--vk-y", `0px`);
    cap.style.setProperty("--vk-rot", `0deg`);
  }

  function updateFromPointer(clientX, clientY) {
    const rect = knobEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    const maxR = rect.width * 0.35;
    const r = Math.hypot(dx, dy);

    const clampedR = Math.min(r, maxR);
    const nx = r === 0 ? 0 : dx / r;
    const ny = r === 0 ? 0 : dy / r;

    const strength = maxR === 0 ? 0 : clampedR / maxR;

    // for now: no fancy hysteresis here; just signal
    const angle = Math.atan2(dy, dx);
    const deg = angle * (180 / Math.PI) + 90;

    state = { x: nx, y: ny, strength };
    setVisual(nx, ny, strength, deg);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    center();
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", endDrag);

  knobEl.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    knobEl.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  });

  knobEl.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY);
  });

  knobEl.addEventListener("pointerup", endDrag);
  knobEl.addEventListener("pointercancel", endDrag);

  // Device contract: Etch samples this to produce commands
  const device = {
    sample() {
      // Convert continuous state into discrete nudge signal
      // (micro-step: simple thresholded 8-way)
      const dead = 0.25;
      if (state.strength < dead) return null;

      const dx = state.x;
      const dy = state.y;

      // choose discrete -1/0/1 per axis
      const sx = Math.abs(dx) < 0.35 ? 0 : dx > 0 ? 1 : -1;
      const sy = Math.abs(dy) < 0.35 ? 0 : dy > 0 ? 1 : -1;

      if (sx === 0 && sy === 0) return null;

      return { type: "vector", dx: sx, dy: sy };
    },
  };

  register(device);
  center();

  return device;
}
