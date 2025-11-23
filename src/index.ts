import { ComfyApp } from "@comfyorg/comfyui-frontend-types";

declare global {
  const app: ComfyApp;

  interface Window {
    app: ComfyApp;
  }
}

const BUTTON_ID = "settingsSidebarButton";

app.registerExtension({
  name: "Settings Sidebar Button",
  settings: [
    {
      id: `${BUTTON_ID}.Enabled`,
      name: "Enabled",
      type: "boolean",
      defaultValue: true,
    },
    {
      id: `${BUTTON_ID}.PinToBottom`,
      name: "Pin to Bottom",
      type: "boolean",
      tooltip: "Pin the button to the bottom of the sidebar",
      defaultValue: true,
    },
    {
      id: `${BUTTON_ID}.ShowText`,
      name: "Show Text",
      type: "boolean",
      defaultValue: true,
      tooltip: "Show the text 'Settings' on the button",
    },
  ],
  async setup() {
    if (!app.extensionManager.setting.get(`${BUTTON_ID}.Enabled`)) {
      return;
    }

    app.extensionManager.registerSidebarTab({
      id: BUTTON_ID,
      icon: "pi pi-cog",
      title: "",
      tooltip: "Open Settings",
      type: "custom",
      render: (_el) => {},
    });

    const setupButton = (button: HTMLElement): void => {
      if (app.extensionManager.setting.get(`${BUTTON_ID}.PinToBottom`)) {
        const endBar =
          document.querySelector<HTMLElement>(".side-tool-bar-end");
        if (endBar) {
          endBar.appendChild(button);
        } else {
          const observer = new MutationObserver(() => {
            const foundEndBar =
              document.querySelector<HTMLElement>(".side-tool-bar-end");

            if (foundEndBar) {
              observer.disconnect();
              foundEndBar.appendChild(button);
            }
          });

          observer.observe(document.body, { childList: true, subtree: true });
        }
      }

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
