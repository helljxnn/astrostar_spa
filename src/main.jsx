import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./shared/utils/asciiConsolePatch.js";
import App from "./App.jsx";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "./index.css";

import moment from "moment";
import "moment/locale/es";

moment.locale("es");

if (window.location.hostname.endsWith(".firebaseapp.com")) {
  const canonicalHost = window.location.hostname.replace(
    ".firebaseapp.com",
    ".web.app",
  );
  const canonicalUrl = `${window.location.protocol}//${canonicalHost}${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(canonicalUrl);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
