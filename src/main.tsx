import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { SafeArea } from "capacitor-plugin-safe-area";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Initialize safe area insets for native platforms
async function initSafeArea() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { insets } = await SafeArea.getSafeAreaInsets();
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(
          `--safe-area-inset-${key}`,
          `${value}px`
        );
      }
      // Listen for changes (e.g., orientation change)
      SafeArea.addListener("safeAreaChanged", ({ insets }) => {
        for (const [key, value] of Object.entries(insets)) {
          document.documentElement.style.setProperty(
            `--safe-area-inset-${key}`,
            `${value}px`
          );
        }
      });
    } catch (e) {
      console.warn("SafeArea plugin not available:", e);
    }
  }
}

initSafeArea();

createRoot(document.getElementById("root")!).render(<App />);

registerSW({ immediate: true });
