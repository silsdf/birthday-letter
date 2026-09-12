(() => {
  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {}
    document.documentElement.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  }

  function bindButton(button) {
    if (!button || button.dataset.fullscreenReady === "1") return;
    button.dataset.fullscreenReady = "1";
    button.addEventListener("click", enterFullscreen);
  }

  function installFullscreenButton() {
    if (!document.documentElement.classList.contains("force-landscape")) return;
    const existingButton = document.querySelector("[data-fullscreen-button]");
    if (existingButton) {
      bindButton(existingButton);
      return;
    }
    if (document.querySelector(".fullscreen-button")) return;

    const button = document.createElement("button");
    button.className = "fullscreen-button";
    button.type = "button";
    button.textContent = "全屏";
    bindButton(button);
    document.body.appendChild(button);
  }

  document.addEventListener("fullscreenchange", () => {
    document.documentElement.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  });
  document.addEventListener("DOMContentLoaded", installFullscreenButton);
  window.installFullscreenButton = installFullscreenButton;
})();
