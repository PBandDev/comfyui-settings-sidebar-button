import { ComfyApp } from "@comfyorg/comfyui-frontend-types";

declare global {
  const app: ComfyApp;

  interface Window {
    app: ComfyApp;
  }
}

const BUTTON_ID = "comfyui-settings-sidebar-button";
const SETTINGS_PREFIX = "Settings Sidebar Button";
const SETTINGS_IDS = {
  VERSION: `${SETTINGS_PREFIX}. ${SETTINGS_PREFIX}`,
  ENABLED: `${SETTINGS_PREFIX}.Enabled`,
  PIN_TO_BOTTOM: `${SETTINGS_PREFIX}.Pin To Bottom`,
  SHOW_TEXT: `${SETTINGS_PREFIX}.Show Text`,
};

app.registerExtension({
  name: "Settings Sidebar Button",
  settings: [
    {
      id: SETTINGS_IDS.VERSION,
      name: "Version 1.2.0",
      type: () => {
        const spanEl = document.createElement("span");
        spanEl.insertAdjacentHTML(
          "beforeend",
          `<a href="https://github.com/PBandDev/comfyui-settings-sidebar-button" target="_blank" style="padding-right: 12px;">Homepage</a>`
        );

        return spanEl;
      },
      defaultValue: undefined,
    },
    {
      id: SETTINGS_IDS.ENABLED,
      name: "Enabled",
      type: "boolean",
      defaultValue: true,
      onChange: (enabled: boolean, _oldValue: boolean) => {
        const isSidebarButtonRegistered = app.extensionManager
          .getSidebarTabs()
          .find((tab) => tab.id === BUTTON_ID);

        if (isSidebarButtonRegistered) {
          const button = document.querySelector<HTMLElement>(
            `button[class*="${BUTTON_ID}"]`
          );

          if (button) {
            toggleVisibility(enabled, button);
          }
        }
      },
    },
    {
      id: SETTINGS_IDS.PIN_TO_BOTTOM,
      name: "Pin to Bottom",
      type: "boolean",
      tooltip: "Pin the button to the bottom of the sidebar",
      defaultValue: false,
      onChange: (pin: boolean, _oldValue: boolean) => {
        pinToBottom(pin ? "bottom" : "top");
      },
    },
    {
      id: SETTINGS_IDS.SHOW_TEXT,
      name: "Show Text",
      type: "boolean",
      defaultValue: true,
      tooltip: "Show the text 'Settings' on the button",
      onChange: (showText: boolean, _oldValue: boolean) => {
        const isSidebarButtonRegistered = app.extensionManager
          .getSidebarTabs()
          .find((tab) => tab.id === BUTTON_ID);

        if (isSidebarButtonRegistered) {
          const button = document.querySelector<HTMLElement>(
            `button[class*="${BUTTON_ID}"]`
          );

          if (button) {
            toggleText(showText, button);
          }
        }
      },
    },
  ],
  async setup() {
    registerSidebarButton();
  },
});

function registerSidebarButton(): void {
  app.extensionManager.registerSidebarTab({
    id: BUTTON_ID,
    icon: "pi pi-cog",
    title: app.extensionManager.setting.get(SETTINGS_IDS.SHOW_TEXT)
      ? "Settings"
      : "",
    tooltip: "Open Settings",
    type: "custom",
    render: (_el) => {},
  });

  const button = document.querySelector<HTMLElement>(
    `button[class*="${BUTTON_ID}"]`
  );

  function setupButton(button: HTMLElement): void {
    toggleVisibility(
      app.extensionManager.setting.get(SETTINGS_IDS.ENABLED),
      button
    );
    toggleText(
      app.extensionManager.setting.get(SETTINGS_IDS.SHOW_TEXT),
      button
    );

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
  }

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
}

function pinToBottom(position: "bottom" | "top"): void {
  const sideToolBarEndEl =
    document.querySelector<HTMLElement>(".side-tool-bar-end");

  const button = document.querySelector<HTMLElement>(
    `button[class*="${BUTTON_ID}"]`
  );

  function setupPosition(sidebar: HTMLElement, button: HTMLElement) {
    if (position === "bottom") {
      sidebar.insertAdjacentElement("beforeend", button);
    } else {
      sidebar.insertAdjacentElement("beforebegin", button);
    }
  }

  if (sideToolBarEndEl && button) {
    setupPosition(sideToolBarEndEl, button);
  } else {
    const observer = new MutationObserver(() => {
      const foundSideToolBarEndEl =
        document.querySelector<HTMLElement>(".side-tool-bar-end");

      const foundButton = document.querySelector<HTMLElement>(
        `button[class*="${BUTTON_ID}"]`
      );

      if (foundSideToolBarEndEl && foundButton) {
        observer.disconnect();
        setupPosition(foundSideToolBarEndEl, foundButton);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function toggleVisibility(visible: boolean, button: HTMLElement): void {
  button.classList.toggle("hidden", !visible);
}

function toggleText(showText: boolean, button: HTMLElement): void {
  const textElement = button.querySelector<HTMLElement>(
    ".side-bar-button-label"
  );

  if (textElement) {
    textElement.style.display = showText ? "block" : "none";
  }
}
