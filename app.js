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
  const countdown = document.querySelector("#countdown");
  const winner = document.querySelector("#winner");
  const winnerName = document.querySelector("#winnerName");
  const active = new Map();
  let timer = null;
  let deadline = 0;
  let showingWinner = false;

  function moveMarker(touch, record) {
    const bounds = area.getBoundingClientRect();
    record.marker.style.left = `${touch.clientX - bounds.left}px`;
    record.marker.style.top = `${touch.clientY - bounds.top + 28}px`;
  }

  function updateStatus() {
    counter.textContent = `${active.size} / 5`;
    hint.hidden = active.size > 0 || showingWinner;
  }

  function stopCountdown() {
    clearInterval(timer);
    timer = null;
    countdown.hidden = true;
  }

  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    countdown.textContent = seconds;
    if (seconds > 0) return;

    stopCountdown();
    const records = Array.from(active.values());
    if (!records.length) return;
    const chosen = records[Math.floor(Math.random() * records.length)];
    const color = colors[chosen.colorIndex];
    showingWinner = true;
    area.style.setProperty("--winner-color", color.hex);
    area.style.backgroundColor = color.hex;
    area.classList.add("has-winner");
    winnerName.textContent = color.name;
    winner.hidden = false;
    for (const record of records) record.marker.remove();
  }

  function startCountdown() {
    stopCountdown();
    if (!active.size || showingWinner) return;
    deadline = Date.now() + 5000;
    countdown.hidden = false;
    tick();
    timer = setInterval(tick, 100);
  }

  function resetWinner() {
    showingWinner = false;
    area.classList.remove("has-winner");
    area.style.removeProperty("--winner-color");
    area.style.removeProperty("background-color");
    winner.hidden = true;
    updateStatus();
  }

  area.addEventListener("touchstart", (event) => {
    event.preventDefault();
    if (showingWinner) {
      if (active.size) return;
      resetWinner();
    }
    let added = false;
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
      added = true;
    }
    updateStatus();
    if (added) startCountdown();
  }, { passive: false });

  document.addEventListener("touchmove", (event) => {
    event.preventDefault();
    if (showingWinner) return;
    for (const touch of event.changedTouches) {
      const record = active.get(touch.identifier);
      if (record) moveMarker(touch, record);
    }
  }, { passive: false });

  function releaseTouches(event) {
    let removed = false;
    for (const touch of event.changedTouches) {
      const record = active.get(touch.identifier);
      if (!record) continue;
      record.marker.remove();
      active.delete(touch.identifier);
      removed = true;
    }
    if (!removed) return;
    updateStatus();
    if (showingWinner) return;
    if (active.size) startCountdown();
    else stopCountdown();
  }

  document.addEventListener("touchend", releaseTouches);
  document.addEventListener("touchcancel", releaseTouches);
})();
