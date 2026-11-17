(() => {
  const colors = [
    { name: "Coral", hex: "#F08067" },
    { name: "Amarillo", hex: "#F2C75C" },
    { name: "Verde", hex: "#80B89A" },
    { name: "Azul", hex: "#78A9D1" },
    { name: "Violeta", hex: "#AD91C9" },
  ];
  const stage = document.querySelector("#stage");
  const touchPoints = document.querySelector("#touchPoints");
  const idle = document.querySelector("#idle");
  const countdown = document.querySelector("#countdown");
  const countNumber = document.querySelector("#countNumber");
  const counter = document.querySelector("#counter");
  const help = document.querySelector("#help");
  const result = document.querySelector("#result");
  const resultSwatch = document.querySelector("#resultSwatch");
  const resultName = document.querySelector("#resultName");
  const reroll = document.querySelector("#reroll");
  const activeTouches = new Map();
  let timer = null;
  let deadline = 0;
  let lastColorIndex = -1;

  function position(record, pointer) {
    const bounds = stage.getBoundingClientRect();
    record.x = pointer.clientX - bounds.left;
    record.y = pointer.clientY - bounds.top;
    record.element.style.left = `${record.x}px`;
    record.element.style.top = `${record.y + 34}px`;
  }

  function addTouch(pointer) {
    if (activeTouches.has(pointer.pointerId) || activeTouches.size >= 5) return;
    const usedColors = new Set(Array.from(activeTouches.values(), (record) => record.colorIndex));
    const colorIndex = colors.findIndex((_, index) => !usedColors.has(index));
    const color = colors[colorIndex];
    const element = document.createElement("div");
    element.className = "touch-tag";
    element.style.setProperty("--color", color.hex);
    element.textContent = color.name;
    touchPoints.append(element);
    const record = { colorIndex, element, x: 0, y: 0 };
    activeTouches.set(pointer.pointerId, record);
    position(record, pointer);
  }

  function update(pointer) {
    const record = activeTouches.get(pointer.pointerId);
    if (record) position(record, pointer);
  }

  function syncUI(groupChanged) {
    const count = activeTouches.size;
    counter.textContent = `${count} / 5`;
    stage.classList.toggle("is-active", count > 0);
    if (!groupChanged) return;

    clearInterval(timer);
    timer = null;
    result.hidden = true;
    if (count) startCountdown();
    else {
      idle.hidden = false;
      countdown.hidden = true;
      help.textContent = "Hasta 5 dedos";
    }
  }

  function startCountdown() {
    idle.hidden = true;
    result.hidden = true;
    countdown.hidden = false;
    help.textContent = "No levantes los dedos";
    deadline = Date.now() + 5000;
    tick();
    timer = setInterval(tick, 100);
  }

  function tick() {
    const remaining = Math.max(0, deadline - Date.now());
    countNumber.textContent = Math.ceil(remaining / 1000);
    if (remaining > 0) return;

    clearInterval(timer);
    timer = null;
    countdown.hidden = true;
    const records = Array.from(activeTouches.values());
    if (!records.length) return;
    const options = records.length > 1
      ? records.filter((record) => record.colorIndex !== lastColorIndex)
      : records;
    const chosen = options[Math.floor(Math.random() * options.length)];
    const color = colors[chosen.colorIndex];
    lastColorIndex = chosen.colorIndex;
    resultSwatch.style.setProperty("--color", color.hex);
    resultSwatch.style.background = color.hex;
    resultName.textContent = color.name;
    result.hidden = false;
    help.textContent = "";
  }

  stage.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    stage.setPointerCapture(event.pointerId);
    const before = activeTouches.size;
    addTouch(event);
    syncUI(activeTouches.size !== before);
  });
  stage.addEventListener("pointermove", update);
  stage.addEventListener("pointerup", (event) => {
    if (!activeTouches.has(event.pointerId)) return;
    activeTouches.get(event.pointerId).element.remove();
    activeTouches.delete(event.pointerId);
    syncUI(true);
  });
  stage.addEventListener("pointercancel", (event) => {
    if (!activeTouches.has(event.pointerId)) return;
    activeTouches.get(event.pointerId).element.remove();
    activeTouches.delete(event.pointerId);
    syncUI(true);
  });
  reroll.addEventListener("pointerdown", (event) => event.stopPropagation());
  reroll.addEventListener("click", startCountdown);
})();
