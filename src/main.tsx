import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { i18nReady } from "./i18n/config";

// render once the texts are there, otherwise the first frame shows raw translation keys
i18nReady.finally(() => createRoot(document.getElementById("root")!).render(<App />));
