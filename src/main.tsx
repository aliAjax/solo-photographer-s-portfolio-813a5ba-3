import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FilterProvider } from "./state/FilterContext";
import { LightboxProvider } from "./state/LightboxContext";
import "./styles/fonts.css";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <FilterProvider>
        <LightboxProvider>
          <App />
        </LightboxProvider>
      </FilterProvider>
    </BrowserRouter>
  </StrictMode>,
);
