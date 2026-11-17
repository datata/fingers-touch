(() => {
  const colors = [
    { name: "Coral", hex: "#F08067" },
    { name: "Amarillo", hex: "#F2C75C" },
    { name: "Verde", hex: "#80B89A" },
    { name: "Azul", hex: "#78A9D1" },
    { name: "Violeta", hex: "#AD91C9" },
  ];
  const area = document.querySelector("#playArea");
  const points = document.querySelector("#touchPoints");
  const hint = document.querySelector("#hint");
  const counter = document.querySelector("#counter");
  const active = new Map();

  function moveMarker(touch, record) {
    const bounds = area.getBoundingClientRect();
    record.marker.style.left = `${touch.clientX - bounds.left}px`;
    record.marker.style.top = `${touch.clientY - bounds.top + 28}px`;
  }

  function updateStatus() {
    counter.textContent = `${active.size} / 5`;
    hint.hidden = active.size > 0;
  }

  area.addEventListener("touchstart", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      if (active.size >= 5 || active.has(touch.identifier)) continue;
      const used = new Set(Array.from(active.values(), (record) => record.colorIndex));
      const colorIndex = colors.findIndex((_, index) => !used.has(index));
      const color = colors[colorIndex];
      const marker = document.createElement("div");
      marker.className = "finger-color";
      marker.style.setProperty("--color", color.hex);
      marker.innerHTML = `<span class="swatch"></span><span>${color.name}</span>`;
      points.append(marker);
      const record = { colorIndex, marker };
      active.set(touch.identifier, record);
      moveMarker(touch, record);
      requestAnimationFrame(() => marker.classList.add("visible"));
    }
    updateStatus();
  }, { passive: false });

  document.addEventListener("touchmove", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const record = active.get(touch.identifier);
      if (record) moveMarker(touch, record);
    }
  }, { passive: false });

  function releaseTouches(event) {
    for (const touch of event.changedTouches) {
      const record = active.get(touch.identifier);
      if (!record) continue;
      record.marker.remove();
      active.delete(touch.identifier);
    }
    updateStatus();
  }

  document.addEventListener("touchend", releaseTouches);
  document.addEventListener("touchcancel", releaseTouches);
})();
