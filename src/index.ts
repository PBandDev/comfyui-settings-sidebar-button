import { ComfyApp } from "@comfyorg/comfyui-frontend-types";

declare global {
  const app: ComfyApp;

  interface Window {
    app: ComfyApp;
  }
}

const BUTTON_ID = "settingsSidebarButton";

app.registerExtension({
  name: "settingsSidebarButton",
  async setup() {
    app.extensionManager.registerSidebarTab({
      id: BUTTON_ID,
      icon: "pi pi-cog",
      title: "Settings",
      tooltip: "Open Settings",
      type: "custom",
      render: (_el) => {},
    });

    const setupButton = (button: HTMLElement): void => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class" &&
            button.classList.contains("side-bar-button-selected")
          ) {
            button.click();
            app.extensionManager.command.execute("Comfy.ShowSettingsDialog");
          }
        }
      });

      observer.observe(button, { attributes: true });
    };

    const button = document.querySelector<HTMLElement>(
      `button[class*="${BUTTON_ID}"]`
    );

    if (button) {
      console.log("[Settings Sidebar Button] Button found");
      setupButton(button);
    } else {
      const observer = new MutationObserver(() => {
        const foundButton = document.querySelector<HTMLElement>(
          `button[class*="${BUTTON_ID}"]`
        );

        if (foundButton) {
          observer.disconnect();
          setupButton(foundButton);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  },
});
