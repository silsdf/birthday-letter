(() => {
  const FULLSCREEN_KEY = "birthdayLetterPreferFullscreen";

  async function enterFullscreen() {
    localStorage.setItem(FULLSCREEN_KEY, "1");
    try {
      await document.documentElement.requestFullscreen?.();
      await screen.orientation?.lock?.("landscape");
    } catch {}
    document.documentElement.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  }

  function installFullscreenButton() {
    if (!document.documentElement.classList.contains("force-landscape")) return;
    if (document.querySelector(".fullscreen-button")) return;

    const button = document.createElement("button");
    button.className = "fullscreen-button";
    button.type = "button";
    button.textContent = localStorage.getItem(FULLSCREEN_KEY) === "1" ? "继续全屏" : "全屏";
    button.addEventListener("click", enterFullscreen);
    document.body.appendChild(button);
  }

  document.addEventListener("pointerdown", () => {
    if (localStorage.getItem(FULLSCREEN_KEY) === "1" && !document.fullscreenElement) {
      enterFullscreen();
    }
  }, { capture: true });
  document.addEventListener("fullscreenchange", () => {
    document.documentElement.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  });
  document.addEventListener("DOMContentLoaded", installFullscreenButton);
  window.installFullscreenButton = installFullscreenButton;
  window.enterPreferredFullscreen = enterFullscreen;
})();
