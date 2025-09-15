import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LoadScriptNext } from "@react-google-maps/api";
import "./index.css";
import App from "./App.jsx";
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadScriptNext googleMapsApiKey={apiKey} libraries={libraries} >
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </LoadScriptNext>
  </StrictMode>
);
 