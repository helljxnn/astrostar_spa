import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import './index.css';

// Configurar moment en español globalmente
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
  </React.StrictMode>
);

