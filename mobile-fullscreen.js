(() => {
  function installFullscreenButton() {
    if (!document.documentElement.classList.contains("force-landscape")) return;
    if (document.querySelector(".fullscreen-button")) return;

    const button = document.createElement("button");
    button.className = "fullscreen-button";
    button.type = "button";
    button.textContent = "全屏";
    button.addEventListener("click", async () => {
      try {
        await document.documentElement.requestFullscreen?.();
        await screen.orientation?.lock?.("landscape");
      } catch {}
      document.documentElement.classList.add("is-fullscreen");
    });
    document.body.appendChild(button);
  }

  document.addEventListener("fullscreenchange", () => {
    document.documentElement.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  });
  document.addEventListener("DOMContentLoaded", installFullscreenButton);
  window.installFullscreenButton = installFullscreenButton;
})();
