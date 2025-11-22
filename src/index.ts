import { ComfyApp } from "@comfyorg/comfyui-frontend-types";

declare global {
  const app: ComfyApp;

  interface Window {
    app: ComfyApp;
  }
}

const BUTTON_ID = "settingsSidebarButton";

app.extensionManager.registerSidebarTab({
  id: BUTTON_ID,
  icon: "pi pi-cog",
  title: "Settings",
  tooltip: "Open Settings",
  type: "custom",
  render: (_el) => {},
});

function observeSidebarButton(attempt = 1) {
  const sidebarButtonEl = document.querySelector<HTMLElement>(
    `button[class*="${BUTTON_ID}"]`
  );

  if (sidebarButtonEl) {
    console.log("[Settings Sidebar Button] Sidebar button found");

    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target === sidebarButtonEl &&
          sidebarButtonEl.classList.contains("side-bar-button-selected")
        ) {
          sidebarButtonEl.click();
          app.extensionManager.command.execute("Comfy.ShowSettingsDialog");
        }
      }
    });

    observer.observe(sidebarButtonEl, { attributes: true });
    return;
  }

  if (attempt < 5) {
    setTimeout(() => observeSidebarButton(attempt + 1), 250);
  } else {
    console.warn(
      "[Settings Sidebar Button] Sidebar button not found after 5 attempts."
    );
  }
}

observeSidebarButton();
