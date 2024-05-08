import "@/globals.css";
import "@/translations/i18n";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme";
import { MainRoute } from "@/routes/main";

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <MainRoute />
      </ThemeProvider>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
