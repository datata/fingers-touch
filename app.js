(() => {
  const colors = [
    { name: "Coral", hex: "#F08067" },
    { name: "Amarillo", hex: "#F2C75C" },
    { name: "Verde", hex: "#80B89A" },
    { name: "Azul", hex: "#78A9D1" },
    { name: "Violeta", hex: "#AD91C9" },
  ];
  const stage = document.querySelector("#stage");
  const idle = document.querySelector("#idle");
  const countdown = document.querySelector("#countdown");
  const countNumber = document.querySelector("#countNumber");
  const counter = document.querySelector("#counter");
  const players = document.querySelector("#players");
  const help = document.querySelector("#help");
  const result = document.querySelector("#result");
  const resultSwatch = document.querySelector("#resultSwatch");
  const resultName = document.querySelector("#resultName");
  const slots = colors.map((color, index) => {
    const item = document.createElement("div");
    item.className = "player";
    item.style.setProperty("--color", color.hex);
    item.innerHTML = `<span class="player-dot"></span><span class="player-name">${color.name}</span>`;
    players.append(item);
    return item;
  });

  let activeTouches = new Map();
  let timer = null;
  let deadline = 0;
  let previousCount = 0;
  let selectedColor = null;

  function syncTouches(touches) {
    const next = new Map();
    Array.from(touches).slice(0, 5).forEach((touch, index) => {
      next.set(touch.identifier, index);
    });
    const groupChanged = next.size !== activeTouches.size ||
      Array.from(next.keys()).some((id) => !activeTouches.has(id));
    activeTouches = next;
    update(groupChanged);
  }

  function update(groupChanged = false) {
    const count = activeTouches.size;
    counter.innerHTML = `${count} <i>/ 5</i>`;
    slots.forEach((slot, index) => slot.classList.toggle("active", index < count));
    stage.classList.toggle("is-active", count > 0);
    if (groupChanged || count !== previousCount) {
      clearInterval(timer);
      timer = null;
      selectedColor = null;
      result.hidden = true;
      if (count) startCountdown();
      else {
        idle.hidden = false;
        countdown.hidden = true;
        help.textContent = "Cuando todos estén listos, empieza la cuenta atrás.";
      }
      previousCount = count;
    }
  }

  function startCountdown() {
    idle.hidden = true;
    result.hidden = true;
    countdown.hidden = false;
    help.textContent = "¡No levantes ningún dedo!";
    deadline = Date.now() + 5000;
    tick();
    timer = setInterval(tick, 100);
  }

  function tick() {
    const remaining = Math.max(0, deadline - Date.now());
    countNumber.textContent = Math.ceil(remaining / 1000);
    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      countdown.hidden = true;
      const color = colors[Math.floor(Math.random() * activeTouches.size)];
      selectedColor = color;
      resultSwatch.style.setProperty("--color", color.hex);
      resultSwatch.style.background = color.hex;
      resultName.textContent = color.name;
      result.hidden = false;
      help.textContent = "¡Ya tenemos un color! Sigue pulsando o levanta los dedos para volver a jugar.";
    }
  }

  document.addEventListener("touchstart", (event) => {
    event.preventDefault();
    syncTouches(event.touches);
  }, { passive: false });
  document.addEventListener("touchmove", (event) => {
    event.preventDefault();
    syncTouches(event.touches);
  }, { passive: false });
  document.addEventListener("touchend", (event) => syncTouches(event.touches));
  document.addEventListener("touchcancel", (event) => syncTouches(event.touches));
})();
