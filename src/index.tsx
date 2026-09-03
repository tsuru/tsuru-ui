import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { loadConfig } from "./configRuntime";
import { loadAuthScheme } from "./authSchemes";

// Nothing here may statically import a module that reads the config: the config
// only exists once loadConfig() resolves. App is therefore imported
// dynamically, which is what puts every module below it -- including the auth
// providers, which build their client at import time -- after the load.
const bootstrap = async () => {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  await loadConfig();
  await loadAuthScheme();

  const { default: App } = await import("./App");

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  reportWebVitals();
};

bootstrap().catch((e) => {
  console.error("failed to start", e);

  const root = document.getElementById("root");
  if (root) {
    root.textContent = `Failed to start: ${
      e instanceof Error ? e.message : String(e)
    }`;
  }
});
